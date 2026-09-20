import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, BookOpen, AlertTriangle, CheckCircle2, FileText, Download, ExternalLink, Rocket } from 'lucide-react';
import { Phase2JoinButton } from './Phase2JoinButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Phase 2 — OUCE SIH 2026 Internal Hackathon',
  description: 'Phase 2 rules, guidelines, and registration for the OUCE SIH 2026 Internal Hackathon.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const PHASE2_RULES = [
  {
    icon: ShieldCheck,
    title: 'Ethical Conduct & Originality',
    description: 'Strict academic integrity is required. All work must be original. Plagiarism or misleading jury members will result in immediate disqualification.',
  },
  {
    icon: BookOpen,
    title: 'AI & Tools Permitted',
    description: 'AI tools (LLMs, code assistants) are permitted. However, every team member must have complete technical comprehension of every component presented.',
  },
  {
    icon: ShieldCheck,
    title: 'Team & PS Eligibility',
    description: 'Strictly 6 members from UCEOU with at least 1 female member. Open to Phase 1 teams re-pitching and new teams who did not participate in Phase 1.',
  },
  {
    icon: BookOpen,
    title: 'Official 6-Slide Format',
    description: 'Mandatory 6-slide structure: 1. Title Page, 2. Idea & Proposed Solution, 3. Technical Approach, 4. Feasibility & Viability, 5. Impact & Benefits, 6. Research & References.',
  },
  {
    icon: Clock,
    title: 'Pitching Guidelines',
    description: 'Each team is allocated 5 minutes for presentation followed by 5 minutes of jury defense at Assembly Hall, UCEOU on 16 Sep 2026.',
  },
  {
    icon: CheckCircle2,
    title: 'PDF Submission on Event Day',
    description: 'Upload your Phase 2 presentation PDF (max 2MB) on this portal. Registered teams can submit or update on the event day itself (16 Sep).',
  },
];

export default async function Phase2Page() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, team_id, onboarding_complete')
    .eq('id', userId)
    .maybeSingle();

  if (!user || !user.onboarding_complete) redirect('/onboarding');

  let team: any = null;
  let isLeader = false;
  let isRegistered = false;
  let isEligible = false;
  let memberCount = 0;

  if (user.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*, users!fk_users_team(id, gender)')
      .eq('id', user.team_id)
      .maybeSingle();
    team = teamData;

    if (team) {
      isLeader = team.leader_id === userId;

      const { data: reg } = await supabase
        .from('phase2_registrations')
        .select('id')
        .eq('team_id', team.id)
        .maybeSingle();
      isRegistered = !!reg;

      const users = (team.users as any[]) || [];
      memberCount = users.length;
      const hasFemale = users.some((u: any) => u.gender === 'female');
      isEligible = team.status === 'finalized' || (users.length === 6 && hasFemale);
    }
  }

  // Phase 2 registrations are explicitly KEPT OPEN by organizers until manually closed
  const isRegistrationClosed = false;
  const canJoin = team && isLeader && isEligible && !isRegistered && !isRegistrationClosed;

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

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-sih-blue flex items-center justify-center text-white font-display text-xl">
              02
            </div>
            <div>
              <p className="text-[10px] font-bold text-sih-blue uppercase tracking-widest">
                Internal Hackathon
              </p>
              <h1 className="heading-display text-3xl md:text-4xl text-sih-dark">
                Phase 2
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mt-4">
            The final round of the OUCE SIH 2026 Internal Hackathon. Phase 1 teams re-pitch after
            incorporating jury feedback. New teams who did not participate in Phase 1 are also
            welcome to register.
          </p>
          {isRegistrationClosed ? (
            <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 w-fit border border-gray-300">
              <Clock className="w-4 h-4 text-gray-600" />
              Phase 2 Event: 16 September 2026 &middot; Registrations Closed
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 w-fit border border-emerald-200">
              <Rocket className="w-4 h-4 text-emerald-600" />
              Phase 2 Event: 16 September 2026 &middot; Registrations Open
            </div>
          )}
        </div>

        {/* Rules Grid */}
        <div className="mb-16">
          <h2 className="heading-display text-2xl text-sih-dark mb-6">
            Rules & Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PHASE2_RULES.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div
                  key={index}
                  className="card-enter bg-white border-2 border-gray-100 p-6 hover:border-sih-blue/30 transition-[border-color] duration-200"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-sih-blue flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {rule.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PPT Template Section */}
        <div className="mb-16 border-2 border-sih-blue bg-white overflow-hidden">
          <div className="bg-sih-blue px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                Official SIH 2026
              </p>
              <h2 className="heading-display text-2xl text-white">
                Idea Presentation Template
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="https://sih.gov.in/letters/2026/SIH2026-IDEA-Presentation-Format.pptx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-sih-blue text-white font-bold px-5 py-3 text-sm hover:bg-sih-blue/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PPT Template (.pptx)
              </a>
              <a
                href="https://sih.gov.in/letters/2026/SIH%202026%20Guidelines.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-2 border-sih-blue text-sih-blue font-bold px-5 py-3 text-sm hover:bg-sih-blue hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View SIH 2026 Guidelines PDF
              </a>
            </div>

            <div className="bg-orange-50 border-l-4 border-sih-orange px-5 py-4 mb-8 space-y-1.5">
              <p className="text-sm font-bold text-orange-900">
                ⚠️ IMPORTANT: Official Presentation Submission Rules
              </p>
              <ul className="text-xs sm:text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Convert your presentation to <strong>PDF format (≤ 2MB)</strong>. PPT/Word files are not accepted.</li>
                <li><strong>Strictly 6 slides:</strong> Ensure your final presentation contains only 6 slides adhering to the official standard.</li>
                <li><strong>Visuals over Text:</strong> Use architecture diagrams, flowcharts, infographics, and bullet points.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phase 2 Status Section */}
        <div className="border-t-2 border-gray-200 pt-10">
          <h2 className="heading-display text-2xl text-sih-dark mb-2">
            Phase 2 Registration Status
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Official registration status for Phase 2.
          </p>

          {isRegistered ? (
            <div className="bg-green-50 border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-800 text-lg">
                  Your team is registered for Phase 2!
                </h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Team <strong>{team?.name}</strong> is registered for Phase 2. Pitching is on <strong>16 September 2026</strong> at Assembly Hall, UCEOU. You can access your Phase 2 dashboard to view your details and submit your PDF.
              </p>
              <Link
                href="/phase2/dashboard"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-6 py-3 hover:bg-green-700 transition-colors"
              >
                Go to Phase 2 Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : isRegistrationClosed ? (
            <div className="bg-gray-100 border-2 border-gray-300 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="heading-display text-xl text-gray-900 mb-1">
                    Phase 2 Registrations Closed
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                    Registrations for Phase 2 are now closed. Pitching evaluations will take place on <strong>16 September 2026</strong> at Assembly Hall, UCEOU.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard?tab=internal-hackathon"
                      className="inline-flex items-center gap-1.5 bg-gray-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-gray-900"
                    >
                      View Hackathon Timeline &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : canJoin ? (
            <Phase2JoinButton
              teamId={team.id}
              teamName={team.name}
              initialPs1Id={team.ps1_id}
              initialPs2Id={team.ps2_id}
            />
          ) : !team ? (
            <div className="bg-amber-50 border-2 border-amber-200 p-6">
              <p className="font-bold text-amber-900 text-base mb-1">Team Required</p>
              <p className="text-sm text-amber-700 mb-3">
                You must join or create a finalized team to register for Phase 2.
              </p>
              <Link
                href="/dashboard?tab=team"
                className="inline-flex items-center gap-2 bg-sih-blue text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-sih-darkBlue"
              >
                Go to Team Management &rarr;
              </Link>
            </div>
          ) : !isEligible ? (
            <div className="bg-amber-50 border-2 border-amber-200 p-6">
              <p className="font-bold text-amber-900 text-base mb-1">6-Member Squad Required</p>
              <p className="text-sm text-amber-700 mb-3">
                Team <strong>{team.name}</strong> currently has {memberCount}/6 members. Under official SIH rules, your team must have exactly 6 members with at least 1 female participant to register for Phase 2.
              </p>
              <Link
                href="/dashboard?tab=team"
                className="inline-flex items-center gap-2 bg-sih-blue text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-sih-darkBlue"
              >
                Manage Team Roster &rarr;
              </Link>
            </div>
          ) : !isLeader ? (
            <div className="bg-blue-50 border-2 border-blue-200 p-6">
              <p className="font-bold text-blue-900 text-base mb-1">Leader Action Required</p>
              <p className="text-sm text-blue-700">
                Only your team leader can complete Phase 2 registration for <strong>{team.name}</strong>. Please ask your leader to visit this page and register.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
