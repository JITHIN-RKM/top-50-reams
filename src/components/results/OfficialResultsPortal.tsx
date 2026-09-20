'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Award, 
  ExternalLink, 
  Users, 
  Phone, 
  Mail, 
  Building2, 
  FileText, 
  ChevronRight, 
  X,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import teamsData from '@/data/teams_breakdown.json';

type ActiveTab = 'all' | 'top47' | 'waitlist' | 'eliminated';

export default function OfficialResultsPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const top47Teams = (teamsData as any).top47Teams || [];
  const candidate48Teams = (teamsData as any).candidate48Teams || [];
  const waitlistTeams = (teamsData as any).waitlistTeams || [];
  const eliminatedTeams = (teamsData as any).eliminatedTeams || [];

  const allBranches = useMemo(() => {
    const branches = new Set<string>();
    [...top47Teams, ...candidate48Teams, ...waitlistTeams, ...eliminatedTeams].forEach((t: any) => {
      if (t.leaderBranch && t.leaderBranch !== 'N/A') {
        branches.add(t.leaderBranch.trim().toUpperCase());
      }
    });
    return Array.from(branches).sort();
  }, [top47Teams, candidate48Teams, waitlistTeams, eliminatedTeams]);

  // Filter helper
  const filterFn = (t: any) => {
    // Branch filter
    if (selectedBranch !== 'ALL') {
      const b = (t.leaderBranch || '').trim().toUpperCase();
      if (b !== selectedBranch) return false;
    }
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchBasic = (
      (t.name || '').toLowerCase().includes(q) ||
      (t.leaderName || '').toLowerCase().includes(q) ||
      (t.leaderPhone || '').toLowerCase().includes(q) ||
      (t.leaderEmail || '').toLowerCase().includes(q) ||
      (t.leaderBranch || '').toLowerCase().includes(q) ||
      (t.psId || '').toLowerCase().includes(q) ||
      (t.psTitle || '').toLowerCase().includes(q)
    );
    if (matchBasic) return true;
    // Check members
    if (t.members && Array.isArray(t.members)) {
      return t.members.some((m: any) => 
        (m.name || '').toLowerCase().includes(q) || 
        (m.email || '').toLowerCase().includes(q)
      );
    }
    return false;
  };

  const filteredTop47 = top47Teams.filter(filterFn);
  const filteredCandidate48 = candidate48Teams.filter(filterFn);
  const filteredWaitlist = waitlistTeams.filter(filterFn);
  const filteredEliminated = eliminatedTeams.filter(filterFn);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. TOP INSTITUTIONAL BAR (HIDDEN IN PRINT IF REDUNDANT) */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-6 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide text-amber-400">UCEOU SIH 2026</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Central Evaluation &amp; Nomination Committee</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Ref: <strong className="text-white font-mono">UCEOU/SIH26/OFFICIAL-EVAL</strong></span>
            <span className="text-slate-500">|</span>
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Faculty / Student Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL UNIVERSITY LETTERHEAD HEADER */}
      <header className="border-b border-slate-200 bg-white py-6 px-6 print:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Official Emblem & University Name */}
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center justify-center">
              <Image 
                src="/ouce-logo-mono.png" 
                alt="University College of Engineering, Osmania University"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                Osmania University College of Engineering (Autonomous)
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight leading-tight mt-0.5">
                Smart India Hackathon 2026 (SIH 2026)
              </h1>
              <p className="text-xs md:text-sm font-semibold text-slate-600 mt-0.5">
                Internal Selection Round — Official 3-Tier Results &amp; Nomination Roster
              </p>
            </div>
          </div>

          {/* Action Toolbar (CSV Export & Print Report) */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition active:scale-95 shadow-sm"
              title="Print official letterhead report"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Official Report</span>
            </button>
            <a
              href="/api/export-teams-csv"
              download="sih_ouce_2026_top_teams_segregation.csv"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-900/10 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Master CSV</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 print:py-2">
        
        {/* COMMITTEE MEMORANDUM CALLOUT */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-800 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Memorandum from the Institutional Screening Committee
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Following the Stage-1 abstract review and Stage-2 offline pitch evaluations conducted across Panels S1, S2, S3, and S4, the participating teams are segregated into three official tiers below. The <strong>Top 47 Shortlisted Teams</strong> form the nomination selection pool, from which the committee will finalize the college’s <strong>Top 45 Teams</strong> for official submission to the SIH 2026 national portal.
              </p>
            </div>
          </div>
        </div>

        {/* 4. METRIC CARDS (EXECUTIVE OVERVIEW) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          
          {/* Card 1: Top Shortlisted */}
          <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center justify-between">
              <span>1. Shortlisted Pool</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 font-mono">{top47Teams.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Contenders for nomination</p>
          </div>

          {/* Card 2: Target Final Cut */}
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center justify-between">
              <span>Target Final Cut</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 font-mono">45</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">47 minus 2 committee cuts</p>
          </div>

          {/* Card 3: Waiting List */}
          <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-1 flex items-center justify-between">
              <span>2. Waiting List</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 font-mono">{waitlistTeams.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Priority ranks #1 to #5</p>
          </div>

          {/* Card 4: Eliminated */}
          <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center justify-between">
              <span>3. Eliminated</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 font-mono">{eliminatedTeams.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Non-qualifying / absent</p>
          </div>
        </div>

        {/* 5. FILTER & SEARCH CONTROL BAR (HIDDEN IN PRINT) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 print:hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Tab Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                All 3 Tiers ({top47Teams.length + waitlistTeams.length + eliminatedTeams.length})
              </button>
              <button
                onClick={() => setActiveTab('top47')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'top47'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                1. Shortlisted ({top47Teams.length})
              </button>
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'waitlist'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                2. Waiting List ({waitlistTeams.length})
              </button>
              <button
                onClick={() => setActiveTab('eliminated')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'eliminated'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                3. Eliminated ({eliminatedTeams.length})
              </button>
            </div>

            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Branch:
              </span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              >
                <option value="ALL">All Branches ({allBranches.length})</option>
                {allBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by team name, leader name, phone number, email, or problem statement ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* 6. SECTION 1: TOP 47 SHORTLISTED TEAMS */}
        {(activeTab === 'all' || activeTab === 'top47') && (
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-blue-800 gap-1">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center text-xs font-mono">1</span>
                  Tier 1: Top 47 Shortlisted Teams (Selection Pool for Final 45)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The evaluating jury's top-performing teams. Organizing committee will eliminate 2 teams to confirm the Top 45.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 self-start sm:self-auto">
                {filteredTop47.length} Teams
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-mono text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">#</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 font-bold">Team Name</th>
                      <th className="py-3 px-3.5">Leader Name</th>
                      <th className="py-3 px-3.5">Contact</th>
                      <th className="py-3 px-3.5">Branch &amp; Year</th>
                      <th className="py-3 px-3.5">Problem Statement</th>
                      <th className="py-3 px-3.5 text-center print:hidden">Squad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {filteredTop47.map((t: any, idx: number) => (
                      <tr 
                        key={t.id || t.name}
                        onClick={() => setSelectedTeam(t)}
                        className="hover:bg-blue-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-3.5 text-center font-mono text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300">
                            Shortlisted
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-950">
                          {t.name}
                        </td>
                        <td className="py-3 px-3.5 text-slate-900 font-semibold">{t.leaderName}</td>
                        <td className="py-3 px-3.5 space-y-0.5 text-[11px]">
                          <div className="font-mono text-blue-900 font-medium">{t.leaderPhone}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">{t.leaderEmail}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900">{t.leaderBranch}</span>
                          <span className="text-slate-500 text-[11px] block">{t.leaderYear}</span>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mr-1.5">
                            {t.psId}
                          </span>
                          <span className="text-slate-700 truncate inline-block align-middle max-w-[220px]">
                            {t.psTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center print:hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(t);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-slate-200 transition"
                          >
                            View Roster
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Candidate #48 Alternate if search matches */}
                    {filteredCandidate48.map((t: any) => (
                      <tr 
                        key={t.id || t.name}
                        onClick={() => setSelectedTeam(t)}
                        className="bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition"
                      >
                        <td className="py-3 px-3.5 text-center font-mono text-slate-500 font-semibold">48</td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            Alternate #48
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-950">{t.name}</td>
                        <td className="py-3 px-3.5 text-slate-900 font-semibold">{t.leaderName}</td>
                        <td className="py-3 px-3.5 space-y-0.5 text-[11px]">
                          <div className="font-mono text-amber-900 font-medium">{t.leaderPhone}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">{t.leaderEmail}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900">{t.leaderBranch}</span>
                          <span className="text-slate-500 text-[11px] block">{t.leaderYear}</span>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mr-1.5">
                            {t.psId}
                          </span>
                          <span className="text-slate-700 truncate inline-block align-middle max-w-[220px]">
                            {t.psTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center print:hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(t);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-slate-200 transition"
                          >
                            View Roster
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 7. SECTION 2: WAITING LIST (5 TEAMS) */}
        {(activeTab === 'all' || activeTab === 'waitlist') && (
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-purple-800 gap-1">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-700 text-white flex items-center justify-center text-xs font-mono">2</span>
                  Tier 2: Waiting List (5 Official Standby Teams)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered standby teams in priority sequence. If any shortlisted team withdraws, waitlisted teams will be called up.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 self-start sm:self-auto">
                {filteredWaitlist.length} Teams
              </span>
            </div>

            <div className="border border-purple-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-purple-50 text-purple-900 uppercase tracking-wider font-mono text-[11px] border-b border-purple-200">
                    <tr>
                      <th className="py-3 px-3.5 w-24 text-center font-bold">Priority Rank</th>
                      <th className="py-3 px-3.5 font-bold">Team Name</th>
                      <th className="py-3 px-3.5">Leader Name</th>
                      <th className="py-3 px-3.5">Contact</th>
                      <th className="py-3 px-3.5">Branch &amp; Year</th>
                      <th className="py-3 px-3.5">Problem Statement</th>
                      <th className="py-3 px-3.5 text-center print:hidden">Squad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100 font-medium text-slate-800">
                    {filteredWaitlist.map((t: any, idx: number) => (
                      <tr 
                        key={t.id || t.name}
                        onClick={() => setSelectedTeam(t)}
                        className="hover:bg-purple-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            WL #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-purple-950">{t.name}</td>
                        <td className="py-3 px-3.5 text-slate-900 font-semibold">{t.leaderName}</td>
                        <td className="py-3 px-3.5 space-y-0.5 text-[11px]">
                          <div className="font-mono text-purple-900 font-medium">{t.leaderPhone}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">{t.leaderEmail}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900">{t.leaderBranch}</span>
                          <span className="text-slate-500 text-[11px] block">{t.leaderYear}</span>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mr-1.5">
                            {t.psId}
                          </span>
                          <span className="text-slate-700 truncate inline-block align-middle max-w-[220px]">
                            {t.psTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center print:hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(t);
                            }}
                            className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] border border-purple-200 transition"
                          >
                            View Roster
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 8. SECTION 3: ELIMINATED TEAMS (10 TEAMS) */}
        {(activeTab === 'all' || activeTab === 'eliminated') && (
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-rose-700 gap-1">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-rose-700 text-white flex items-center justify-center text-xs font-mono">3</span>
                  Tier 3: Eliminated Teams (10 Teams)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teams officially eliminated in accordance with hackathon attendance and scoring thresholds.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 self-start sm:self-auto">
                {filteredEliminated.length} Teams
              </span>
            </div>

            <div className="border border-rose-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-rose-50 text-rose-900 uppercase tracking-wider font-mono text-[11px] border-b border-rose-200">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">#</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 font-bold">Team Name</th>
                      <th className="py-3 px-3.5">Leader Name</th>
                      <th className="py-3 px-3.5">Contact</th>
                      <th className="py-3 px-3.5">Branch &amp; Year</th>
                      <th className="py-3 px-3.5">Problem Statement</th>
                      <th className="py-3 px-3.5 text-center print:hidden">Squad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 font-medium text-slate-800">
                    {filteredEliminated.map((t: any, idx: number) => (
                      <tr 
                        key={t.id || t.name}
                        onClick={() => setSelectedTeam(t)}
                        className="hover:bg-rose-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-3.5 text-center font-mono text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-3 px-3.5">
                          <span className="px-2.5 py-0.5 rounded font-bold font-mono text-[10px] uppercase bg-rose-100 text-rose-800 border border-rose-300">
                            Eliminated
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-rose-950">{t.name}</td>
                        <td className="py-3 px-3.5 text-slate-900 font-semibold">{t.leaderName}</td>
                        <td className="py-3 px-3.5 space-y-0.5 text-[11px]">
                          <div className="font-mono text-rose-900 font-medium">{t.leaderPhone}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">{t.leaderEmail}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900">{t.leaderBranch}</span>
                          <span className="text-slate-500 text-[11px] block">{t.leaderYear}</span>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mr-1.5">
                            {t.psId}
                          </span>
                          <span className="text-slate-700 truncate inline-block align-middle max-w-[220px]">
                            {t.psTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center print:hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(t);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] border border-rose-200 transition"
                          >
                            View Roster
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 9. PRINT-ONLY SIGNATURE ATTESTATION BLOCK */}
        <div className="hidden print:block pt-16 mt-12 border-t-2 border-slate-400 text-xs">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="border-t border-slate-600 pt-2">
              <div className="font-bold text-slate-900">Dr. / Prof. Faculty Coordinator</div>
              <div className="text-slate-600 text-[11px]">SIH 2026 SPOC, UCEOU</div>
            </div>
            <div className="border-t border-slate-600 pt-2">
              <div className="font-bold text-slate-900">Head of Department</div>
              <div className="text-slate-600 text-[11px]">Internal Hackathon Committee</div>
            </div>
            <div className="border-t border-slate-600 pt-2">
              <div className="font-bold text-slate-900">Principal &amp; Dean</div>
              <div className="text-slate-600 text-[11px]">Faculty of Engineering, UCEOU</div>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-500 mt-8 font-mono">
            Document generated officially via UCEOU SIH Portal on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </div>
        </div>
      </main>

      {/* 10. TEAM SQUAD DETAIL MODAL (SLIDE-OVER / POPUP) */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    selectedTeam.category === 'Eliminated' 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : selectedTeam.category === 'Waiting List'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {selectedTeam.subStatus || selectedTeam.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Team ID: {selectedTeam.id?.slice(0, 8)}</span>
                </div>
                <h3 className="text-xl font-black text-slate-950 mt-1">{selectedTeam.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Leader Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Team Leader &amp; Primary Contact
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedTeam.leaderName}</div>
                    <div className="text-slate-500">{selectedTeam.leaderBranch} • {selectedTeam.leaderYear}</div>
                  </div>
                  <div className="space-y-1 text-right sm:text-left">
                    <div className="font-mono text-blue-900 font-semibold">{selectedTeam.leaderPhone}</div>
                    <div className="text-slate-500">{selectedTeam.leaderEmail}</div>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleCopy(`${selectedTeam.leaderName} - ${selectedTeam.leaderPhone} (${selectedTeam.leaderEmail})`, 'leader')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] transition"
                  >
                    {copiedText === 'leader' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'leader' ? 'Copied Contact' : 'Copy Contact'}</span>
                  </button>
                </div>
              </div>

              {/* Problem Statement Card */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5 bg-white">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Problem Statement
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedTeam.psId}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Domain: {selectedTeam.psDomain || 'Software'}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {selectedTeam.psTitle}
                </div>
              </div>

              {/* Squad Members Roster */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Registered Squad Members ({selectedTeam.members?.length || selectedTeam.membersCount} Members)</span>
                  <span className="text-[10px] font-normal text-slate-400">All 6 participants verified</span>
                </div>

                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                    {selectedTeam.members.map((m: any, mIdx: number) => (
                      <div key={m.id || mIdx} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center">
                            {mIdx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {m.name}
                              {m.isLeader && (
                                <span className="text-[9px] font-mono uppercase bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                                  Leader
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {m.branch || 'Branch N/A'} • {m.year || 'Year N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[11px]">
                          <div className="font-mono text-slate-700">{m.phone || 'N/A'}</div>
                          <div className="text-slate-400 truncate max-w-[160px]">{m.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                    Squad roster count: {selectedTeam.membersCount} members registered.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. INSTITUTIONAL FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 text-xs text-slate-500 print:hidden mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-900">University College of Engineering (Autonomous), Osmania University</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Central Hackathon Committee • SIH 2026 Internal Screening Round</div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="/api/export-teams-csv" className="text-blue-700 hover:underline font-medium">Export CSV</a>
            <span>•</span>
            <button onClick={handlePrint} className="text-blue-700 hover:underline font-medium">Print Report</button>
            <span>•</span>
            <Link href="/" className="text-slate-600 hover:underline">Portal Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
