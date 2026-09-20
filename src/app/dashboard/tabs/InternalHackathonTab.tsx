import {
  CheckCircle2,
  CalendarDays,
  Rocket,
  ShieldCheck,
  AlertTriangle,
  Award,
  Phone,
  Mail,
  Layers,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  date: string;
  startDate: Date;
  endDate: Date;
  badge?: string;
  highlight?: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    title: 'Registration & Team Formation Deadline',
    description:
      'Complete onboarding, form a team of exactly 6 UCEOU students (with at least 1 female member), and lock your team roster on the official portal.',
    date: '9 Sep 2026, 11:59 PM (Midnight)',
    startDate: new Date('2026-08-25'),
    endDate: new Date('2026-09-09T23:59:59+05:30'),
    badge: 'Critical Deadline',
  },
  {
    id: 2,
    title: 'Phase 1: Registration & PPT Submission (Concluded)',
    description:
      'Phase 1 team registration and 6-slide PPT submission. Early access round to beat the 500-submission national cap.',
    date: 'Concluded: 2 Sep 2026',
    startDate: new Date('2026-08-29'),
    endDate: new Date('2026-09-02T23:59:59+05:30'),
    highlight: false,
  },
  {
    id: 3,
    title: 'Phase 1 Pitching Day & Early Nominations',
    description:
      'In-person pitching at Assembly Hall, UCEOU. Strict 10-minute slot (5-min pitch + 5-min jury Q&A). Top 5–10 standout teams nominated immediately to national SIH portal by SPOC. All participating teams receive jury feedback.',
    date: '3 Sep 2026 (Completed)',
    startDate: new Date('2026-09-03'),
    endDate: new Date('2026-09-03T23:59:59'),
  },
  {
    id: 4,
    title: 'Phase 2: Registrations & Re-Pitch Prep',
    description:
      'Phase 1 teams re-pitch after incorporating jury feedback. Open to new teams who did not participate in Phase 1. Registrations close strictly on 13 September 2026 at 11:59 PM. Pitching on 16 September 2026.',
    date: 'Closes: 13 Sep 11:59 PM · Pitch: 16 Sep 2026',
    startDate: new Date('2026-09-04'),
    endDate: new Date('2026-09-13T23:59:59'),
    highlight: true,
  },
  {
    id: 5,
    title: 'Phase 2 Final Pitching & Internal Campus Awards',
    description:
      'Final jury evaluations at Assembly Hall on 16 September 2026. Best performances across Phase 1 and Phase 2 considered for internal campus prizes. Top 50 teams (40–45 regular nominated + up to 5 waitlisted) finalized for national portal upload.',
    date: '16 Sep 2026',
    startDate: new Date('2026-09-16'),
    endDate: new Date('2026-09-16T23:59:59'),
  },
  {
    id: 6,
    title: 'Final SIH National Portal Team Nomination',
    description:
      'SPOC uploads finalized team rosters and ideas to the national Smart India Hackathon portal (sih.gov.in). Nominated team leaders receive login credentials.',
    date: '17–20 Sep 2026',
    startDate: new Date('2026-09-17'),
    endDate: new Date('2026-09-20T23:59:59'),
  },
];

const EVALUATION_CRITERIA = [
  { name: 'Novelty / Originality', desc: 'Uniqueness of the concept, creative problem solving, and distinct competitive edge.' },
  { name: 'Complexity & Technical Challenge', desc: 'Depth of technical architecture, algorithmic sophistication, and system design.' },
  { name: 'Clarity & Format Completeness', desc: 'Strict adherence to prescribed 6-slide structure, completeness, and clarity.' },
  { name: 'Feasibility', desc: 'Real-world viability, operational logic, and feasibility under real constraints.' },
  { name: 'Practicability & Ease of Implementation', desc: 'Ease of implementation, workflow usability, and deployment readiness.' },
  { name: 'Sustainability', desc: 'Long-term adoption roadmap, environmental, operational, and economic sustainability.' },
  { name: 'Scale of Impact', desc: 'Direct measurable benefit to target users and quantifiable social/industry ROI.' },
  { name: 'User Experience (UX)', desc: 'Intuitive interface design, user journey simplicity, and accessibility.' },
  { name: 'Potential for Future Work & Scalability', desc: 'Extensibility into commercial/enterprise solutions and nationwide scaling.' },
];

function getStepStatus(step: TimelineStep, now: Date): 'completed' | 'current' | 'pending' {
  if (now > step.endDate) return 'completed';
  if (now >= step.startDate && now <= step.endDate) return 'current';
  return 'pending';
}

const STUDENT_COORDINATORS = [
  { name: 'Kanneganti Sreeshanth Babu', phone: '+91 9494041525' },
  { name: 'Kothakapu Om Akshay Reddy', phone: '+91 6304136939' },
  { name: 'Jithin Rokkam', phone: '+91 9030669013' },
  { name: 'Tejas Reddy Tandra', phone: '+91 9573583219' },
  { name: 'Ananya Dhage', phone: '+91 8331995757' },
  { name: 'Spoorthi Thota', phone: '+91 9966559662' },
  { name: 'Meenakshi Thumma', phone: '+91 8125245695' },
  { name: 'Chris Preetham Sangabathuni', phone: '+91 9110532767' },
  { name: 'Mohd Nouman Ahmed', phone: '+91 8310701254' },
];

export default function InternalHackathonTab({
  isPhase1Registered = false,
  isPhase2Registered = false,
}: {
  isPhase1Registered?: boolean;
  isPhase2Registered?: boolean;
}) {
  const now = new Date();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="border-b-2 border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-bold text-sih-blue uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            UCEOU Selection Rulebook 2026
          </span>
        </div>
        <h1 className="heading-display text-2xl sm:text-3xl md:text-4xl text-sih-dark tracking-tight">
          Internal Hackathon Guidelines &amp; Directives
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
          The mandatory campus-level screening stage for University College of Engineering, Osmania University (UCEOU) to identify, refine, and nominate the <strong>Top 50 teams</strong> (40–45 regular nominated + up to 5 waitlisted) to the National Smart India Hackathon 2026.
        </p>
      </div>

      {/* Official Notice Card (Date: 02 September 2026) */}
      <div className="bg-white border-2 border-sih-blue p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b-2 border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-1">
              Official Campus Notice
            </span>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark mt-2">
              Internal Hackathon Key Directives
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Issued by Prof. Dr. T. Nagaveni, SPOC &mdash; Smart India Hackathon, UCEOU
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-xs text-gray-600 bg-sih-gray p-3 border border-gray-200">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <Calendar className="w-4 h-4 text-sih-blue" />
              <span>Pitching Date: 03 September 2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4 text-sih-orange" />
              <span>Venue: Assembly Hall, UCEOU</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-sih-gray/70 border border-gray-200 flex items-start gap-3">
            <div className="w-7 h-7 bg-blue-50 text-sih-blue flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-100">
              1
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 mb-1">Strict 6 Slides Max (PDF Format)</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Teams must strictly follow the official SIH Idea Submission Template. Maximum 6 slides only &mdash; exceeding this limit is not permitted. Export and submit in PDF format (max 2MB).
              </p>
            </div>
          </div>

          <div className="p-4 bg-sih-gray/70 border border-gray-200 flex items-start gap-3">
            <div className="w-7 h-7 bg-blue-50 text-sih-blue flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-100">
              2
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 mb-1">10-Minute Strict Slot (5m Pitch + 5m Q&amp;A)</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Each team is allotted exactly 10 minutes: <strong>5 minutes for presentation</strong> and <strong>5 minutes for jury defense</strong>. Pitch timer will be strictly enforced.
              </p>
            </div>
          </div>

          <div className="p-4 bg-sih-gray/70 border border-gray-200 flex items-start gap-3">
            <div className="w-7 h-7 bg-blue-50 text-sih-blue flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-100">
              3
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 mb-1">Only Presentation Required (No Prototype Yet)</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                For the internal campus hackathon, <strong>only the Idea Submission Presentation deck is required</strong>. Prototype development and hardware builds may be taken up after qualifying for subsequent rounds.
              </p>
            </div>
          </div>

          <div className="p-4 bg-sih-gray/70 border border-gray-200 flex items-start gap-3">
            <div className="w-7 h-7 bg-blue-50 text-sih-blue flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-100">
              4
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 mb-1">Dual PS Preparation &mdash; 1 Presented</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Teams are advised to prepare 2 suitable problem statements (Primary &amp; Secondary) to avoid collisions with other teams. However, <strong>only ONE idea/problem statement</strong> will be presented during pitching.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Action Items Banner */}
      <div className="bg-red-50/80 border-2 border-red-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-red-900 text-sm sm:text-base uppercase tracking-wide">
              Critical Action Items &amp; Official Hub
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-red-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span><strong>Official Hub:</strong> All announcements, registrations, team formations, and PDF submissions happen <strong>ONLY</strong> on this portal (<span className="font-mono font-semibold">sih-ouce.meetthealtezza.tech</span>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span><strong>Roster &amp; Team Formation Deadline:</strong> <strong>2nd September 2026, 11:59 PM (Midnight tonight)</strong>. Teams must have exactly 6 members with &ge;1 female participant.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600">&bull;</span>
                <span><strong>Beat the National 500-Idea Cap:</strong> Phase 1 provides early access pitching on Sep 3 so the SPOC can nominate top 5–10 standout teams immediately before problem statements freeze nationally.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Event Timeline / Roadmap */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Campus Schedule
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              Hackathon Timeline &amp; Milestones
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {TIMELINE_STEPS.map((step, index) => {
            const status = getStepStatus(step, now);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <div
                key={step.id}
                className={cn(
                  'card-enter flex flex-col sm:flex-row items-start gap-4 sm:gap-5 p-4 sm:p-5 border-2 transition-all duration-150',
                  step.highlight
                    ? 'border-sih-blue bg-blue-50/30'
                    : isCompleted
                    ? 'border-sih-blue/20 bg-blue-50/20'
                    : isCurrent
                    ? 'border-sih-orange bg-orange-50/20'
                    : 'border-gray-100 bg-white'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Step Indicator */}
                <div
                  className={cn(
                    'w-9 h-9 flex items-center justify-center flex-shrink-0 border-2 text-xs font-bold font-mono',
                    isCompleted
                      ? 'bg-sih-blue border-sih-blue text-white'
                      : step.highlight
                      ? 'bg-sih-blue border-sih-blue text-white'
                      : isCurrent
                      ? 'bg-sih-orange border-sih-orange text-white'
                      : 'bg-sih-gray border-gray-300 text-gray-500'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span>0{step.id}</span>}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={cn(
                          'font-bold text-sm sm:text-base',
                          isCompleted ? 'text-sih-blue' : isCurrent ? 'text-sih-dark' : 'text-gray-900'
                        )}
                      >
                        {step.title}
                      </h3>
                      {step.badge && (
                        <span className="text-[9px] uppercase font-bold bg-red-100 text-red-700 px-1.5 py-0.5 border border-red-200">
                          {step.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 flex-shrink-0 flex items-center gap-1 self-start sm:self-auto',
                        step.highlight
                          ? 'border-sih-blue text-sih-blue bg-white'
                          : 'border-gray-200 text-gray-500 bg-sih-gray'
                      )}
                    >
                      <CalendarDays className="w-3 h-3" />
                      {step.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {step.description}
                  </p>

                  {step.id === 2 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                      {isPhase1Registered ? (
                        <Link
                          href="/phase1/dashboard"
                          className="inline-flex items-center gap-1.5 bg-green-600 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 hover:bg-green-700 transition-all active:scale-[0.97]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Phase 1 Dashboard
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-wider bg-gray-100 border border-gray-200 px-3 py-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Phase 1 Concluded &bull; Closed
                        </span>
                      )}
                    </div>
                  )}

                  {step.id === 4 && (
                    <div className="mt-3 pt-3 border-t border-blue-100/60 flex flex-wrap items-center gap-3">
                      {isPhase2Registered ? (
                        <Link
                          href="/phase2/dashboard"
                          className="inline-flex items-center gap-1.5 bg-green-600 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 hover:bg-green-700 transition-all active:scale-[0.97]"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Phase 2 Dashboard
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : now > new Date('2026-09-13T23:59:59+05:30') ? (
                        <Link
                          href="/phase2"
                          className="inline-flex items-center gap-1.5 text-gray-700 font-bold text-xs uppercase tracking-wider bg-gray-100 border border-gray-300 px-3 py-1.5 hover:bg-gray-200 transition-all active:scale-[0.97]"
                        >
                          View Phase 2 Details &rarr;
                        </Link>
                      ) : (
                        <Link
                          href="/phase2"
                          className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-50 border border-emerald-300 px-3 py-1.5 hover:bg-emerald-100 transition-all active:scale-[0.97]"
                        >
                          <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                          Register for Phase 2 (Closes 13 Sep) &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Phase Mechanics Grid */}
      {(() => {
        const isPhase1Closed = now > new Date('2026-09-09T23:59:59+05:30');
        const isPhase2Closed = now > new Date('2026-09-13T23:59:59+05:30');
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Phase 1 Card */}
            <div className="p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors bg-gray-50 border-2 border-gray-300">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border bg-gray-200 text-gray-700 border-gray-300">
                    Phase 1 &middot; Concluded
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    Pitch: 3 Sep (Completed)
                  </span>
                </div>
                <h3 className="heading-display text-lg sm:text-xl text-sih-dark mb-2">
                  Early Access Pitching
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  Designed to help standout teams beat the 500-submission national portal cap. Top standout teams nominated early by the SPOC, and all participating teams received direct jury feedback.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700 mb-5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sih-blue flex-shrink-0 mt-0.5" />
                    <span>Early nominations submitted to national SIH portal</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sih-blue flex-shrink-0 mt-0.5" />
                    <span>Direct jury critique &amp; actionable technical feedback delivered</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sih-blue flex-shrink-0 mt-0.5" />
                    <span>Eligible to re-pitch in Phase 2 with improved solution</span>
                  </li>
                </ul>
              </div>

              <Link
                href={isPhase1Registered ? "/phase1/dashboard" : "/phase1"}
                className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 transition-all active:scale-[0.97]"
              >
                {isPhase1Registered ? "View Phase 1 Dashboard →" : "View Phase 1 Overview →"}
              </Link>
            </div>

            {/* Phase 2 Card */}
            <div className={`bg-white border-2 p-5 sm:p-6 shadow-xs flex flex-col justify-between ${
              isPhase2Closed ? 'border-gray-300' : 'border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                    isPhase2Closed
                      ? 'bg-gray-100 text-gray-600 border-gray-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {isPhase2Closed ? 'Phase 2 · Registrations Closed' : 'Phase 2 · Registrations Open'}
                  </span>
                  <span className="text-xs font-bold text-sih-blue">Pitch: 16 Sep @ Assembly Hall</span>
                </div>
                <h3 className="heading-display text-lg sm:text-xl text-sih-dark mb-2">
                  Final Pitching &amp; Nominations
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  Open to both Phase 1 teams (re-pitching with feedback improvements) and new teams. Strongest performances across both phases are selected for internal campus prizes and the Top 50 national nominations.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700 mb-5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Top 40–45 teams nominated to National SIH portal</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Up to 5 waitlisted reserve teams nominated</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Internal campus awards &amp; prize distribution</span>
                  </li>
                </ul>
              </div>

              <Link
                href={isPhase2Registered ? "/phase2/dashboard" : "/phase2"}
                className="inline-flex items-center justify-center gap-2 bg-sih-blue text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 hover:bg-sih-darkBlue transition-all active:scale-[0.97]"
              >
                {isPhase2Registered
                  ? "View Phase 2 Dashboard →"
                  : isPhase2Closed
                  ? "View Phase 2 Overview →"
                  : "Register for Phase 2 →"}
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Internal Selection Rules & Pitching Mechanics */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-orange-50 border border-orange-100 text-sih-orange flex items-center justify-center font-bold flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Core Regulations
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              Team Formation &amp; Pitching Rules
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              1. Team Composition
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Exactly <strong>6 members</strong> including Team Leader. All members must be enrolled UCEOU students. At least <strong>1 female participant</strong> is mandatory.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              2. Problem Statements
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Teams can select a <strong>maximum of 2 Problem Statements</strong> (Primary &amp; Secondary). Only the primary selected idea is presented during the pitch.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              3. Presentation Format
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Strictly <strong>6 slides</strong> exported as <strong>PDF (Max 2MB)</strong> matching official Ministry template (1. Title, 2. Idea &amp; Proposed Solution, 3. Tech Approach, 4. Feasibility, 5. Impact &amp; Benefits, 6. Research &amp; References). Delete instruction slide 7 before saving.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              4. Pitching Time Limit
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>5 minutes presentation</strong> + <strong>5 minutes jury Q&amp;A</strong>. Teams must defend tech stack choices, scalability, and risk mitigations.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              5. Tools &amp; AI Policy
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              No restrictions on tools/libraries. AI tools are permitted, but all team members must have complete technical comprehension of every component.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              6. Team Names &amp; Integrity
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Team names must be unique and must <strong>not</strong> contain the institute name. Plagiarism or misleading the jury leads to immediate disqualification.
            </p>
          </div>
        </div>
      </div>

      {/* Official 9 Evaluation Criteria (Rulebook Section 12) */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Jury Assessment
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              Evaluation Criteria
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {EVALUATION_CRITERIA.map((crit, idx) => (
            <div key={idx} className="p-4 bg-sih-gray/50 border border-gray-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 bg-sih-blue text-white text-[10px] font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <p className="text-xs font-bold text-gray-900">{crit.name}</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{crit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Helpdesk & Student Coordinators Contacts */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Official Directory
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              SPOC &amp; Student Coordinators
            </h2>
          </div>
        </div>

        {/* Faculty SPOC */}
        <div className="mb-6 p-4 sm:p-5 bg-blue-50/60 border-2 border-sih-blue/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sih-blue">
              College SPOC / Faculty Coordinator
            </span>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mt-0.5">
              Prof. Dr. T. Nagaveni
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Professor, Dept. of Mechanical Engineering, UCE(A), Osmania University
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:9966998860"
              className="inline-flex items-center gap-2 bg-sih-blue text-white text-xs font-bold px-4 py-2 hover:bg-sih-darkBlue transition-colors active:scale-[0.97]"
            >
              <Phone className="w-3.5 h-3.5" />
              9966998860
            </a>
          </div>
        </div>

        {/* Official Email */}
        <div className="mb-6 p-4 bg-sih-gray border border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Mail className="w-4 h-4 text-sih-blue flex-shrink-0" />
            <div className="truncate">
              <p className="text-xs font-bold text-gray-900">Official Internal Helpdesk Email</p>
              <p className="text-xs text-gray-600 truncate font-mono">sihuceou@gmail.com</p>
            </div>
          </div>
          <a
            href="mailto:sihuceou@gmail.com"
            className="text-xs font-bold text-sih-blue hover:underline flex-shrink-0"
          >
            Email Us &rarr;
          </a>
        </div>

        {/* Student Coordinators Grid */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Student Coordinators Helpline
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {STUDENT_COORDINATORS.map((sc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-sih-gray/50 border border-gray-200 text-xs">
                <span className="font-semibold text-gray-800 truncate mr-2">{sc.name}</span>
                <a
                  href={`tel:${sc.phone.replace(/[^0-9+]/g, '')}`}
                  className="font-mono text-sih-blue hover:underline flex-shrink-0 font-bold"
                >
                  {sc.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}