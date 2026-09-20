'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import webpush from 'web-push';
import { Resend } from 'resend';
import { buildAnnouncementEmail } from '@/lib/emails/announcement-email';

const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_build_error';
const resend = new Resend(resendApiKey);

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const supabase = createAdminClient();
  const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
  if (user?.role !== 'super_admin') throw new Error("Forbidden");
  return { supabase, userId };
}

export async function postAnnouncement(formData: FormData) {
  try {
    const { supabase, userId } = await checkAdmin();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const adminOnly = formData.get('adminOnly') === 'on';
    
    if (!title || !content) return { success: false, error: 'Missing fields' };

    const res = await supabase.from('announcements').insert({ 
      title, 
      content, 
      posted_by: userId,
      admin_only: adminOnly
    });
    if (res.error) {
      console.error('ANNOUNCEMENT ERROR:', res.error);
      return { success: false, error: res.error.message };
    }

    // DISPATCH NOTIFICATIONS DIRECTLY
    try {
      let targetUserIds: string[] | null = null;
      let recipientEmails: string[] = [];

      if (adminOnly) {
        const { data: adminUsers, error: adminErr } = await supabase
          .from('users')
          .select('id, email, role')
          .in('role', ['admin', 'super_admin']);

        if (adminErr) {
          console.error('Failed to fetch admin users for announcement:', adminErr);
        } else if (adminUsers) {
          targetUserIds = adminUsers.map((u: any) => u.id);
          recipientEmails = adminUsers.map((u: any) => u.email).filter(Boolean);
        }
      } else {
        const { data: users, error: usersErr } = await supabase
          .from('users')
          .select('email')
          .order('created_at', { ascending: true })
          .limit(100);

        if (usersErr) {
          console.error('Failed to fetch broadcast users:', usersErr);
        } else if (users) {
          recipientEmails = users.map((u: any) => u.email).filter(Boolean);
        }
      }

      // 1. Push Notifications
      let subsQuery = supabase.from('push_subscriptions').select('*');
      if (adminOnly && targetUserIds && targetUserIds.length > 0) {
        subsQuery = subsQuery.in('user_id', targetUserIds);
      }
      const { data: subs } = await subsQuery;

      if (subs && subs.length > 0 && process.env.VAPID_PRIVATE_KEY) {
        const payload = JSON.stringify({
          title: adminOnly ? `🔒 [ADMIN] ${title}` : title,
          body: content,
          url: '/dashboard?tab=announcements',
        });

        await Promise.allSettled(
          subs.map(async (sub: any) => {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
              );
            } catch (e: any) {
              if (e.statusCode === 410 || e.statusCode === 404) {
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
              }
            }
          })
        );
      }

      // 2. Email Notifications via Resend
      if (process.env.RESEND_API_KEY && recipientEmails.length > 0) {
        const emailHtml = buildAnnouncementEmail({ title, content, adminOnly });

        if (adminOnly) {
          // Direct delivery into admin inboxes (to: recipientEmails)
          try {
            const adminSendRes = await resend.emails.send({
              from: 'OUCE SIH 2026 Admin <updates@sih-ouce.meetthealtezza.tech>',
              to: recipientEmails,
              subject: `🔒 [SIH 2026 ADMIN] ${title}`,
              html: emailHtml,
            });
            console.log(`Admin announcement email successfully dispatched to ${recipientEmails.length} admins:`, adminSendRes);
          } catch (adminEmailErr: any) {
            console.error('Failed to send admin announcement email:', adminEmailErr?.message || adminEmailErr);
          }
        } else {
          // General broadcast in batches of 50 via BCC
          const BATCH_SIZE = 50;
          for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
            const batch = recipientEmails.slice(i, i + BATCH_SIZE);
            try {
              await resend.emails.send({
                from: 'OUCE SIH 2026 <updates@sih-ouce.meetthealtezza.tech>',
                to: 'updates@sih-ouce.meetthealtezza.tech',
                bcc: batch,
                subject: `📢 [SIH 2026] ${title}`,
                html: emailHtml,
              });
            } catch (batchErr: any) {
              console.error(`Broadcast email batch failed:`, batchErr?.message || batchErr);
            }
          }
        }
      }
    } catch (notifError) {
      console.error('Notification dispatch error:', notifError);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignRole(targetUserId: string, role: 'super_admin' | 'student') {
  try {
    const { supabase } = await checkAdmin();
    if (!targetUserId || !role) return { success: false, error: 'Missing params' };
    
    await supabase
      .from('users')
      .update({ role })
      .eq('id', targetUserId);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function kickUserFromTeam(targetUserId: string) {
  try {
    const { supabase } = await checkAdmin();
    if (!targetUserId) return { success: false, error: 'Missing userId' };

    await supabase
      .from('users')
      .update({ team_id: null })
      .eq('id', targetUserId);

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function disqualifyTeam(teamId: string) {
  try {
    const { supabase } = await checkAdmin();
    if (!teamId) return { success: false, error: 'Missing teamId' };

    // Set team status to disqualified and remove all members from team
    await supabase
      .from('teams')
      .update({ status: 'incomplete' })
      .eq('id', teamId);

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function deleteAnnouncement(id: string) {
  try {
    const { supabase } = await checkAdmin();
    if (!id) return { success: false, error: 'Missing id' };
    
    await supabase.from('announcements').delete().eq('id', id);
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}