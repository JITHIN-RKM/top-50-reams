import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ShieldCheck, Clock, BookOpen, AlertTriangle, CheckCircle2, Download, FileText, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Phase 1 — OUCE SIH 2026 Internal Hackathon',
  description: 'Phase 1 rules, guidelines, and registration for the OUCE SIH 2026 Internal Hackathon.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const PHASE1_RULES = [
  {
    icon: ShieldCheck,
    title: 'Ethical Conduct & Originality',
    description: 'Strict academic integrity is required. Plagiarism, misrepresentation, or intentionally misleading jury members will result in immediate disqualification.',
  },
  {
    icon: BookOpen,
    title: 'AI & Tools Permitted',
    description: 'AI tools (LLMs, code assistants) are permitted. However, every team member must have complete technical comprehension of every component presented.',
  },
  {
    icon: ShieldCheck,
    title: 'Team & PS Eligibility',
    description: 'Strictly 6 members from UCEOU with at least 1 female member. Teams can select their problem statement(s) from the SIH portal.',
  },
  {
    icon: BookOpen,
    title: 'Official 6-Slide Format',
    description: 'Mandatory 6-slide structure: 1. Title Page, 2. Idea & Proposed Solution, 3. Technical Approach, 4. Feasibility & Viability, 5. Impact & Benefits, 6. Research & References.',
  },
  {
    icon: Clock,
    title: 'Pitching Guidelines',
    description: 'Each team is strictly allocated 5 minutes for presentation followed by 5 minutes of jury Q&A at Assembly Hall, UCEOU on 3 Sep 2026.',
  },
  {
    icon: CheckCircle2,
    title: 'Evaluation & Early Nominations',
    description: 'Evaluated on Novelty, Complexity, Clarity, Feasibility, Sustainability, and Impact. Top 5–10 teams get early nomination. All teams receive jury feedback and can re-pitch in Phase 2.',
  },
];

export default async function Phase1Page() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createAdminClient();

  // Get user info + team
  const { data: user } = await supabase
    .from('users')
    .select('id, team_id, onboarding_complete')
    .eq('id', userId)
    .single();

  if (!user || !user.onboarding_complete) redirect('/onboarding');

  let team: any = null;
  let isLeader = false;
  let isRegistered = false;

  if (user.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', user.team_id)
      .single();
    team = teamData;

    if (team) {
      isLeader = team.leader_id === userId;

      // Check if already registered
      const { data: reg } = await supabase
        .from('phase1_registrations')
        .select('id')
        .eq('team_id', team.id)
        .single();
      isRegistered = !!reg;
    }
  }

  const isFinalized = team?.status === 'finalized';
  const canJoin = team && isLeader && isFinalized && !isRegistered;

  const PHASE1_DEADLINE = new Date('2026-09-09T23:59:59+05:30');
  const isDeadlineClosed = new Date() > PHASE1_DEADLINE;

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
            <div className="w-12 h-12 bg-gray-600 flex items-center justify-center text-white font-display text-xl">
              01
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Internal Hackathon • Phase 1 Concluded
              </p>
              <h1 className="heading-display text-3xl md:text-4xl text-sih-dark">
                Phase 1
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mt-4">
            The initial round of the OUCE SIH 2026 Internal Hackathon. Teams presented their initial
            concepts and presentations to the jury on 3 September 2026.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm font-bold text-gray-700 bg-gray-200/80 px-3 py-1.5 w-fit border border-gray-300">
            <Clock className="w-4 h-4 text-gray-600" />
            Phase 1 Completed &middot; Registrations Concluded
          </div>
        </div>

        {/* Rules Grid */}
        <div className="mb-16">
          <h2 className="heading-display text-2xl text-sih-dark mb-6">
            Rules & Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PHASE1_RULES.map((rule, index) => {
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

        {/* ─── PPT Template Section ─────────────────────────────────────── */}
        <div className="mb-16 border-2 border-sih-blue bg-white overflow-hidden">
          {/* Header banner */}
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
            {/* Download buttons row */}
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

            {/* Important note */}
            <div className="bg-orange-50 border-l-4 border-sih-orange px-5 py-4 mb-8 space-y-1.5">
              <p className="text-sm font-bold text-orange-900">
                ⚠️ IMPORTANT: Official Presentation Submission Rules
              </p>
              <ul className="text-xs sm:text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Convert your presentation to <strong>PDF format (&le; 2MB)</strong>. PPT/Word files are not accepted.</li>
                <li><strong>Delete Slide 7:</strong> The downloaded `.pptx` template includes an extra instruction slide at the end (Slide 7). Delete this slide before exporting to PDF so your final submission has <strong>strictly 6 slides</strong>.</li>
                <li><strong>Visuals over Text:</strong> Use architecture diagrams, flowcharts, infographics, and bullet points. Avoid dense paragraphs.</li>
              </ul>
            </div>

            {/* 6-slide format */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Official 6-Slide Structure — Ministry of Education / AICTE Standard
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    slide: '01',
                    title: 'Title Page (Team & Problem Statement)',
                    points: [
                      'Problem Statement ID & Official Problem Statement Title',
                      'Theme & Category (Software / Hardware Edition)',
                      'Team ID & Team Name (as registered on portal)',
                      'Team Leader & Team Members (Name, Branch, Year)',
                    ],
                  },
                  {
                    slide: '02',
                    title: 'Idea Title & Proposed Solution',
                    points: [
                      'Idea Title / Project Name',
                      'Proposed Solution: Describe your Idea / Solution / Prototype',
                      'Detailed explanation of how your solution addresses the problem',
                      'Innovation and uniqueness of the solution (Novelty / USP)',
                    ],
                  },
                  {
                    slide: '03',
                    title: 'Technical Approach',
                    points: [
                      'Technologies to be used (programming languages, frameworks, DBs, cloud, hardware)',
                      'Methodology and process for implementation',
                      'System architecture flowcharts, diagrams, and working prototype design',
                    ],
                  },
                  {
                    slide: '04',
                    title: 'Feasibility and Viability',
                    points: [
                      'Analysis of the feasibility of the idea (technical, operational, economic)',
                      'Potential challenges and identified risks',
                      'Strategies and mitigation plans for overcoming these challenges',
                    ],
                  },
                  {
                    slide: '05',
                    title: 'Impact and Benefits',
                    points: [
                      'Potential impact on the target audience and end-users',
                      'Benefits of the solution (social, economic, environmental, industrial)',
                      'Long-term sustainability, financial viability, and scalability potential',
                    ],
                  },
                  {
                    slide: '06',
                    title: 'Research and References',
                    points: [
                      'Details and direct links of reference and prior research work',
                      'Scientific papers, datasets, patents, or benchmark standards consulted',
                      'Prior art survey and supporting market data',
                    ],
                  },
                ].map((s) => (
                  <div key={s.slide} className="flex gap-4 p-4 bg-sih-gray border-2 border-gray-100 hover:border-sih-blue/30 transition-[border-color]">
                    <div className="w-10 h-10 bg-sih-blue text-white font-display text-sm flex items-center justify-center flex-shrink-0">
                      {s.slide}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
                      <ul className="space-y-1">
                        {s.points.map((pt, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-sih-blue font-bold mt-0.5 flex-shrink-0">›</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom rules row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-gray-100">
              <div className="text-center p-4 bg-blue-50 border border-blue-100">
                <p className="heading-display text-3xl text-sih-blue mb-1">6</p>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Max Slides</p>
              </div>
              <div className="text-center p-4 bg-blue-50 border border-blue-100">
                <p className="heading-display text-3xl text-sih-blue mb-1">2MB</p>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Max File Size</p>
              </div>
              <div className="text-center p-4 bg-blue-50 border border-blue-100">
                <p className="heading-display text-3xl text-sih-blue mb-1">PDF</p>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Required Format</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Status Section */}
        <div className="border-t-2 border-gray-200 pt-10">
          <h2 className="heading-display text-2xl text-sih-dark mb-2">
            Phase 1 Registration Status
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Official participation status for Phase 1.
          </p>

          {isRegistered ? (
            <div className="bg-green-50 border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-800 text-lg">
                  Your team participated in Phase 1!
                </h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Team <strong>{team?.name}</strong> registered and participated in Phase 1. You can access your Phase 1 dashboard to view your submission.
              </p>
              <Link
                href="/phase1/dashboard"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-6 py-3 hover:bg-green-700 transition-colors"
              >
                Go to Phase 1 Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-300 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="heading-display text-xl text-gray-800 mb-1">
                    Phase 1 Registration is Closed
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                    Phase 1 has concluded. No new registrations are being accepted for this round. Stay tuned for announcements regarding Phase 2 registration.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/dashboard?tab=internal-hackathon"
                      className="inline-flex items-center gap-1.5 bg-sih-blue text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-sih-darkBlue transition-all active:scale-[0.97]"
                    >
                      View Timeline &amp; Next Steps &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
