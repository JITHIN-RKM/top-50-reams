import { NextRequest, NextResponse } from 'next/server';
import { buildPhase2GuidelinesEmail } from '@/lib/emails/phase2-guidelines-email';
import { buildPhase2BroadcastEmail } from '@/lib/emails/phase2-broadcast-email';
import { buildPhase2ConfirmationEmail } from '@/lib/emails/phase2-email';
import { escapeHtml, isSafeHttpsUrl } from '@/lib/security';

const DEFAULT_WHATSAPP = 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamName = searchParams.get('team') || 'Byte Bandits';
  const leaderName = searchParams.get('leader') || 'Arjun Reddy';
  const rawWhatsapp = searchParams.get('whatsapp');
  const emailType = searchParams.get('type') || 'guidelines';

  const whatsappLink = (rawWhatsapp && isSafeHttpsUrl(rawWhatsapp)) ? rawWhatsapp : DEFAULT_WHATSAPP;

  const isRegisteredParam = searchParams.get('registered');
  const isRegistered = isRegisteredParam !== null ? isRegisteredParam === 'true' : false;
  const registeredCount = parseInt(searchParams.get('regCount') || '48', 10);
  const totalTeams = parseInt(searchParams.get('totalTeams') || '73', 10);

  let html: string;
  if (emailType === 'confirmation') {
    html = buildPhase2ConfirmationEmail({
      teamName,
      leaderName,
      whatsappLink,
    });
  } else if (emailType === 'broadcast') {
    html = buildPhase2BroadcastEmail({
      teamName,
      leaderName,
      isRegistered,
      registeredCount,
      totalTeams,
      whatsappLink,
    });
  } else {
    html = buildPhase2GuidelinesEmail({
      teamName,
      leaderName,
      whatsappLink,
    });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
