import { createAdminClient } from '@/lib/supabase/admin';
import { Megaphone, CalendarClock, Pin } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { formatIST } from '@/lib/utils';
import MarkAnnouncementsRead from '@/components/MarkAnnouncementsRead';
import PushNotificationManager from '@/components/PushNotificationManager';

export default async function AnnouncementsTab() {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    const supabase = createAdminClient();

    let isSuperAdmin = false;
    if (userId) {
      const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
      isSuperAdmin = user?.role === 'super_admin';
    }

    let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (!isSuperAdmin) {
      query = query.eq('admin_only', false);
    }
    const { data: announcements } = await query;

    return (
    <div className="max-w-3xl">
      <MarkAnnouncementsRead />
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl text-sih-dark">Announcements</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Official broadcasts from the OUCE organizing team.
          </p>
        </div>
        <PushNotificationManager />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {!announcements?.length ? (
          /* Empty State */
          <div className="bg-white border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-sih-gray border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-7 h-7 text-gray-300" />
            </div>
            <p className="heading-display text-sm text-gray-400 mb-1">No Announcements Yet</p>
            <p className="text-xs text-gray-400 font-medium">
              Check back soon — the organizing team will post updates here.
            </p>
          </div>
        ) : (
          announcements.map((item, i) => {
            const isUTC = item.created_at.includes('Z') || item.created_at.includes('+');
            const createdAt = new Date(isUTC ? item.created_at : item.created_at + 'Z');
            const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true });
            const exactTime = formatIST(item.created_at);


            return (
              <div
                key={item.id}
                className="card-enter bg-white border-2 border-gray-100 hover:border-sih-blue/30 transition-[border-color] duration-150 overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Top accent bar — full-width, not side-stripe */}
                <div className="h-1 bg-sih-blue w-full" />

                <div className="p-6">
                  {/* Date chip */}
                  <div
                    className="flex items-center gap-2 mb-4"
                    title={exactTime}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-sih-gray border-2 border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <CalendarClock className="w-3 h-3" />
                      {relativeTime}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:block">{exactTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                    {item.title}
                  </h3>

                  {/* Body */}
                  {item.content && (
                    <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed font-body">
                      {item.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    );
  } catch (err: any) {
    return <div className="p-10 m-10 bg-red-100 text-red-900 border-2 border-red-500 rounded-xl font-mono">
      <h1 className="text-2xl font-bold">RAW ANNOUNCEMENTS ERROR:</h1>
      <pre>{err.message}</pre>
    </div>
  }
}
