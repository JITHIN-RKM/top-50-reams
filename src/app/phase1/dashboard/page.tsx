import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Users, PartyPopper } from 'lucide-react';
import { Phase1PDFSubmission } from '@/components/dashboard/Phase1PDFSubmission';
import { formatYear } from '@/lib/constants';

export const metadata = {
  title: 'Phase 1 Dashboard — OUCE SIH 2026',
  description: 'Phase 1 registered team dashboard with PDF submission.',
};

export default async function Phase1DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id, team_id, onboarding_complete')
    .eq('id', userId)
    .single();

  if (!user || !user.onboarding_complete) redirect('/onboarding');
  if (!user.team_id) redirect('/phase1');

  // Get team
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, leader_id, status')
    .eq('id', user.team_id)
    .single();

  if (!team) redirect('/phase1');

  // Check if registered for Phase 1
  const { data: registration } = await supabase
    .from('phase1_registrations')
    .select('id, created_at')
    .eq('team_id', team.id)
    .single();

  if (!registration) redirect('/phase1');

  // Get team members
  const { data: members } = await supabase
    .from('users')
    .select('id, full_name, branch, year, gender')
    .eq('team_id', team.id);

  // Check if PDF is uploaded
  const { data: files } = await supabase.storage.from('phase1_pdfs').list('', {
    search: `${team.id}.pdf`,
  });
  const hasUploaded = (files || []).some((f: any) => f.name === `${team.id}.pdf`);

  const isLeader = team.leader_id === userId;
  const registeredAt = new Date(registration.created_at).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-sih-gray font-body text-sih-dark">
      {/* Top bar */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard?tab=internal-hackathon"
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-sih-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="font-display text-lg tracking-wide text-sih-blue">
            SIH<span className="text-sih-orange">2026</span>
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-8">
        {/* Success Banner */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 md:p-10 relative overflow-hidden">
          {/* Decorative dots */}
          <div className="absolute top-4 right-4 grid grid-cols-3 gap-1.5 opacity-30">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500" />
            ))}
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 className="heading-display text-2xl md:text-3xl text-green-900 mb-2">
                Successfully Registered for Phase 1!
              </h1>
              <p className="text-green-700 text-base md:text-lg font-medium leading-relaxed">
                Team <strong>{team.name}</strong> is now registered for the Phase 1 Internal Hackathon.
                Submit your presentation PDF below before the deadline.
              </p>
              <p className="text-xs text-green-600 mt-3 font-bold uppercase tracking-widest">
                Registered on {registeredAt}
              </p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white border-2 border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sih-blue flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Registered Team
              </p>
              <h2 className="heading-display text-xl text-sih-dark">
                {team.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {members?.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 border-2 border-gray-100 bg-sih-gray/50"
              >
                <div className="w-9 h-9 bg-sih-blue flex items-center justify-center text-white font-display text-sm flex-shrink-0">
                  {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {m.full_name}
                    </p>
                    {m.id === team.leader_id && (
                      <span className="text-[8px] uppercase font-bold bg-blue-50 text-sih-blue px-1.5 py-0.5 border border-blue-100 flex-shrink-0">
                        Leader
                      </span>
                    )}
                    {m.id === userId && (
                      <span className="text-[8px] uppercase font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                    {m.branch} · {formatYear(m.year)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500 font-medium">
              {members?.length || 0}/6 members · Phase 1 registered
            </p>
          </div>
        </div>

        {/* PDF Submission */}
        <Phase1PDFSubmission teamId={team.id} userId={userId!} isLeader={isLeader} initialHasUploaded={hasUploaded} />
      </div>
    </div>
  );
}
