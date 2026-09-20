import {
  Download,
  FileText,
  ExternalLink,
  Globe,
  Layers,
  Clock,
  Sparkles,
  Lightbulb,
  Cpu,
  Leaf,
  Activity,
  Wheat,
  Plane,
  Shield,
  Palette,
  Compass,
  Zap,
  Building,
  TrendingUp,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const SIH_THEMES = [
  { name: 'Smart Automation', icon: Cpu, desc: 'AI-driven systems, automated workflows, and intelligent computing.' },
  { name: 'MedTech / HealthTech', icon: Activity, desc: 'Diagnostic tools, patient tracking, and healthcare innovations.' },
  { name: 'Clean & Green Tech', icon: Leaf, desc: 'Waste management, water sanitation, and renewable energy solutions.' },
  { name: 'Agriculture & FoodTech', icon: Wheat, desc: 'Crop yield optimization, supply chain, and post-harvest tech.' },
  { name: 'Space Technology', icon: Plane, desc: 'Satellites, aerospace navigation, and planetary data processing.' },
  { name: 'Robotics & Drones', icon: Zap, desc: 'Autonomous rescue drones, industrial robotics, and robotic aids.' },
  { name: 'Blockchain & Cyber Security', icon: Shield, desc: 'Decentralized trust, encrypted workflows, and threat defense.' },
  { name: 'Heritage & Culture', icon: Palette, desc: 'Preserving and digitizing India’s monuments and traditions.' },
  { name: 'Disaster Management', icon: Compass, desc: 'Early warning systems, rescue coordination, and flood models.' },
  { name: 'Smart Vehicles', icon: TrendingUp, desc: 'EV efficiency, traffic monitoring, and intelligent transit.' },
  { name: 'Smart Education', icon: Lightbulb, desc: 'Adaptive learning tools, digital classrooms, and literacy platforms.' },
  { name: 'Fintech', icon: Building, desc: 'Financial inclusion, fraud detection, and digital transactions.' },
];

const MANDATORY_SLIDES = [
  {
    num: '01',
    title: 'Title Page (Team & Problem Statement)',
    points: [
      'Problem Statement ID & Official Problem Statement Title',
      'Theme & PS Category (Software / Hardware Edition)',
      'Team ID & Team Name (as registered on portal)',
      'Team Leader & Team Members (Name, Branch, Year)',
    ],
  },
  {
    num: '02',
    title: 'Idea Title & Proposed Solution',
    points: [
      'Idea Title / Project Name',
      'Proposed Solution: Describe your Idea / Solution / Prototype',
      'Detailed explanation of how your solution addresses the problem',
      'Innovation and uniqueness of the solution (Novelty / USP)',
    ],
  },
  {
    num: '03',
    title: 'Technical Approach',
    points: [
      'Technologies to be used (programming languages, frameworks, DBs, cloud, hardware)',
      'Methodology and process for implementation',
      'System architecture flowcharts, diagrams, and working prototype design',
    ],
  },
  {
    num: '04',
    title: 'Feasibility and Viability',
    points: [
      'Analysis of the feasibility of the idea (technical, operational, economic)',
      'Potential challenges and identified risks',
      'Strategies and mitigation plans for overcoming these challenges',
    ],
  },
  {
    num: '05',
    title: 'Impact and Benefits',
    points: [
      'Potential impact on the target audience and end-users',
      'Benefits of the solution (social, economic, environmental, industrial)',
      'Long-term sustainability, financial viability, and scalability potential',
    ],
  },
  {
    num: '06',
    title: 'Research and References',
    points: [
      'Details and direct links of reference and prior research work',
      'Scientific papers, datasets, patents, or benchmark standards consulted',
      'Prior art survey and supporting market data',
    ],
  },
];

const NATIONAL_PROCESS_STEPS = [
  {
    step: '01',
    title: 'National Problem Statements Released',
    desc: 'Central & State Ministries, PSUs, and leading industries publish real-world challenges on the national portal (sih.gov.in).',
  },
  {
    step: '02',
    title: 'Campus Internal Selection (Our Current Stage)',
    desc: 'Each college conducts an internal screening to evaluate ideas, shortlisting the Top 50 teams (40–45 direct + up to 5 waitlisted).',
  },
  {
    step: '03',
    title: 'SPOC Nominates Teams on SIH Portal',
    desc: 'The College SPOC officially registers and uploads the selected team rosters and pitch decks to the national portal before the deadline.',
  },
  {
    step: '04',
    title: 'National Technical Evaluation',
    desc: 'Ministry and industry jury panels evaluate all submitted proposals across thousands of participating institutes in India.',
  },
  {
    step: '05',
    title: 'Grand Finale Shortlist Published',
    desc: 'The top 4–6 teams per Problem Statement nationally are invited to designated Nodal Centers across the country for the finale.',
  },
  {
    step: '06',
    title: '36-Hour Continuous Grand Finale',
    desc: 'Intense non-stop hackathon with live ministry mentoring, multi-round jury evaluations, and national champion awards (₹1 Lakh/PS).',
  },
];

export default function AllAboutSIHTab() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="border-b-2 border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-bold text-sih-blue uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 border border-blue-100">
            <Globe className="w-3.5 h-3.5" />
            National Innovation Ecosystem
          </span>
        </div>
        <h1 className="heading-display text-2xl sm:text-3xl md:text-4xl text-sih-dark tracking-tight">
          All About Smart India Hackathon
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
          Everything you need to know about the world&apos;s largest open innovation initiative &mdash; official SIH 2026 templates, national process flow, national 500-idea cap mechanism, and innovation themes.
        </p>
      </div>

      {/* Campus Context Callout Box */}
      <div className="bg-blue-50/70 border-2 border-sih-blue/30 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sih-blue flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sih-dark text-sm sm:text-base">
                Looking for UCEOU Campus Screening &amp; Venue Details?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                This page explains the <strong>National SIH Ecosystem</strong>. For UCEOU&apos;s campus schedule (Sep 3 Phase 1 pitching at Assembly Hall), 10-minute presentation slots, campus evaluation criteria, and coordinator contacts, visit the Internal Hackathon section.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard?tab=internal-hackathon"
            className="inline-flex items-center gap-1.5 bg-sih-blue text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-sih-darkBlue transition-all active:scale-[0.97] flex-shrink-0 self-start sm:self-auto"
          >
            Internal Hackathon Hub
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Official Downloads Hero Card */}
      <div className="bg-sih-dark border-2 border-sih-blue text-white p-5 sm:p-7 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3 sm:gap-4 mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sih-blue/20 border border-sih-blue/40 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sih-blue" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest">
              Official SIH 2026 Portal Files
            </p>
            <h2 className="heading-display text-lg sm:text-xl md:text-2xl text-white mt-0.5">
              Download Official Presentation Template &amp; Guidelines
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <a
            href="https://sih.gov.in/letters/2026/SIH2026-IDEA-Presentation-Format.pptx"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 p-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-150 active:scale-[0.98] group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-sih-orange/20 border border-sih-orange/40 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-sih-orange" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold truncate">SIH 2026 PPT Template</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wider">.PPTX Format &middot; Official Ministry Template</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-y-0.5 transition-all flex-shrink-0" />
          </a>

          <a
            href="https://sih.gov.in/letters/2026/SIH%202026%20Guidelines.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 p-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-150 active:scale-[0.98] group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-300" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold truncate">SIH 2026 Guidelines PDF</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wider">Official Institutes &amp; University Rules</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white transition-all flex-shrink-0" />
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/80">
          <span>Official Ministry of Education (MoE) Innovation Cell &amp; AICTE</span>
          <a
            href="https://sih.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-sih-orange hover:underline font-bold inline-flex items-center gap-1"
          >
            Visit Official SIH Portal (sih.gov.in) &rarr;
          </a>
        </div>
      </div>

      {/* What is SIH & Nationwide Impact */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Overview
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              What is Smart India Hackathon?
            </h2>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Smart India Hackathon (SIH) is a premier nationwide initiative by the <strong>Ministry of Education&apos;s Innovation Cell (MIC)</strong> and <strong>AICTE</strong>. It provides undergraduate and postgraduate students across India a platform to solve pressing challenges faced in daily governance, public sector undertakings (PSUs), government ministries, and industries.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 text-center">
          <div className="p-3 bg-sih-gray border border-gray-200">
            <p className="heading-display text-xl sm:text-2xl text-sih-blue">18+ Lakh</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-1">Students Engaged</p>
          </div>
          <div className="p-3 bg-sih-gray border border-gray-200">
            <p className="heading-display text-xl sm:text-2xl text-sih-blue">9,400+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-1">Institutes</p>
          </div>
          <div className="p-3 bg-sih-gray border border-gray-200">
            <p className="heading-display text-xl sm:text-2xl text-sih-blue">50+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-1">Govt Ministries</p>
          </div>
          <div className="p-3 bg-sih-gray border border-gray-200">
            <p className="heading-display text-xl sm:text-2xl text-sih-blue">₹1 Lakh+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-1">Prize Per PS</p>
          </div>
        </div>
      </div>

      {/* National 500-Idea Submission Cap Explanation */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-orange-50 border border-orange-100 text-sih-orange flex items-center justify-center font-bold flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              National Cap Mechanics
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              The 500-Idea Submission Cap on National Portal
            </h2>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          On the official national portal (<code>sih.gov.in</code>), every Problem Statement has a strict <strong>submission ceiling of 500 ideas nationally</strong>. Once 500 teams across India submit proposals for a specific Problem Statement, that PS is instantly frozen and accepts no further submissions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              1. Live Public Counters
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              The submitted-idea count and ideas-left counter are publicly visible alongside each Problem Statement on <code>sih.gov.in</code>.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              2. First-Come Submission
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Once the 500 cap is reached, the portal freezes that PS. Colleges cannot submit ideas for frozen problem statements.
            </p>
          </div>

          <div className="p-4 bg-sih-gray border border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              3. Early Campus Pitching
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              UCEOU conducts <strong>Phase 1 Early Access Pitching</strong> specifically so standout teams can be nominated by the SPOC early before caps fill up.
            </p>
          </div>
        </div>
      </div>

      {/* SIH 6-Step National Process Flow */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              From College to National Finale
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              National SIH Process Journey
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NATIONAL_PROCESS_STEPS.map((ps) => (
            <div key={ps.step} className="p-4 bg-sih-gray/50 border-2 border-gray-100 hover:border-sih-blue/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-sih-blue text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {ps.step}
                </span>
                <h3 className="font-bold text-gray-900 text-sm">{ps.title}</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{ps.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory 6-Slide Pitch Structure (National Standard) */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              National Ministry Standard Deck
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              Official 6-Slide Presentation Guide
            </h2>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-bold text-sih-blue border border-sih-blue/30 bg-blue-50 px-2.5 py-1 uppercase tracking-wider">
            Strict 6 Slides Max
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MANDATORY_SLIDES.map((slide) => (
            <div
              key={slide.num}
              className="flex items-start gap-3.5 p-4 bg-sih-gray border border-gray-200 hover:border-sih-blue/30 transition-colors"
            >
              <span className="w-8 h-8 bg-sih-blue text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                {slide.num}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1.5">{slide.title}</p>
                <ul className="space-y-1">
                  {slide.points.map((pt, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-sih-blue font-bold flex-shrink-0">&rsaquo;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Official SIH PPT Submission Notes */}
        <div className="mt-6 pt-6 border-t border-gray-100 bg-orange-50/70 border border-orange-200 p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-bold text-orange-900 uppercase tracking-wide mb-2 flex items-center gap-2">
            <span>⚠️ Official Ministry Guidelines for Idea PPT:</span>
          </p>
          <ul className="text-xs sm:text-sm text-orange-800 space-y-1.5 list-disc list-inside">
            <li><strong>Strict 6-Slide Maximum:</strong> The final uploaded PDF must contain strictly up to 6 slides including the title slide.</li>
            <li><strong>Delete Slide 7 (Instructions Slide):</strong> The downloaded `.pptx` template contains an instruction slide at the end (Slide 7). Delete this slide before exporting to PDF.</li>
            <li><strong>Visuals over Paragraphs:</strong> Avoid long paragraphs. Present your architecture, flowcharts, infographics, and bullet points clearly.</li>
            <li><strong>Template Integrity:</strong> Use the official template structure without altering the core slide pointers.</li>
          </ul>
        </div>
      </div>

      {/* SIH Key Themes Showcase */}
      <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Innovation Verticals
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">
              Smart India Hackathon Themes
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SIH_THEMES.map((theme, i) => {
            const Icon = theme.icon;
            return (
              <div key={i} className="p-3.5 bg-sih-gray/50 border border-gray-200 hover:border-sih-blue/30 transition-colors flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900">{theme.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{theme.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}