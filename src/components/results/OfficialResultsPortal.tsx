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
  Award, 
  ExternalLink, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight, 
  X,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import teamsData from '@/data/teams_breakdown.json';

type ActiveTab = 'all' | 'top45' | 'waitlist';

export default function OfficialResultsPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const top45Teams = useMemo(() => {
    const list = [...((teamsData as any).top45Teams || (teamsData as any).top47Teams || [])];
    return list.sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true })
    );
  }, []);

  const waitlistTeams = useMemo(() => {
    const list = [...((teamsData as any).waitlistTeams || [])];
    return list.sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true })
    );
  }, []);

  const allBranches = useMemo(() => {
    const branches = new Set<string>();
    [...top45Teams, ...waitlistTeams].forEach((t: any) => {
      if (t.leaderBranch && t.leaderBranch !== 'N/A') {
        branches.add(t.leaderBranch.trim().toUpperCase());
      }
    });
    return Array.from(branches).sort();
  }, [top45Teams, waitlistTeams]);

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

  const filteredTop45 = top45Teams.filter(filterFn);
  const filteredWaitlist = waitlistTeams.filter(filterFn);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy fallback error', err);
      }
      textArea.remove();
    }
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. TOP INSTITUTIONAL BAR */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 sm:px-6 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="font-bold tracking-wide text-amber-400">UCEOU SIH 2026</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 truncate max-w-[180px] sm:max-w-none">Central Evaluation Committee</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden md:inline text-slate-400">Ref: <strong className="text-white font-mono">UCEOU/SIH26/OFFICIAL-EVAL</strong></span>
            <span className="hidden md:inline text-slate-600">|</span>
            {/* Redirected to live main hackathon platform */}
            <a 
              href="https://sih-ouce.meetthealtezza.tech/sign-in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition active:scale-95 text-xs py-0.5"
              title="Open Official SIH Hackathon Main Portal"
            >
              <span>Faculty / Student Portal</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL UNIVERSITY LETTERHEAD HEADER */}
      <header className="border-b border-slate-200 bg-white py-5 sm:py-6 px-4 sm:px-6 print:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          
          {/* Official Emblem & University Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full md:w-auto">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded-xl p-1 border border-slate-200 shadow-sm flex items-center justify-center">
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
              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-900">
                Osmania University College of Engineering (Autonomous)
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight leading-tight mt-0.5">
                Smart India Hackathon 2026 (SIH 2026)
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                Internal Selection Round — Official Results &amp; Final Nomination Roster
              </p>
            </div>
          </div>

          {/* Action Toolbar (CSV Export & Print Report) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto print:hidden">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition active:scale-95 shadow-sm min-h-[44px]"
              title="Print official letterhead report"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Report</span>
            </button>
            <a
              href="/api/export-teams-csv"
              download="sih_ouce_2026_top_teams_segregation.csv"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-900/10 transition active:scale-95 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Download Master CSV</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 print:py-2">
        
        {/* COMMITTEE MEMORANDUM CALLOUT */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-800 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                Memorandum from the Institutional Screening Committee
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Following the Stage-1 abstract review and Stage-2 offline pitch evaluations conducted across Panels S1, S2, S3, and S4, the participating teams are segregated into the two official tiers below: the <strong>Top 45 Nominated Teams</strong> for official submission to the SIH 2026 national portal, and the <strong>Waiting List (5 Standby Teams)</strong> in strict priority order.
              </p>
            </div>
          </div>
        </div>

        {/* 4. METRIC CARDS (EXECUTIVE OVERVIEW WITH TAP-TO-FILTER) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 print:grid-cols-3">
          
          {/* Card 1: Top 45 Nominated Teams */}
          <div 
            onClick={() => setActiveTab('top45')}
            className={`cursor-pointer rounded-xl p-3.5 sm:p-4 border transition active:scale-95 relative overflow-hidden ${
              activeTab === 'top45'
                ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                : 'bg-white border-blue-200 hover:border-blue-300 shadow-sm'
            }`}
            title="Filter to Top 45 Nominated Teams"
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center justify-between">
              <span className="truncate">1. Top 45 Nominated</span>
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{top45Teams.length}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">SIH National Portal Roster</p>
          </div>

          {/* Card 2: Waiting List */}
          <div 
            onClick={() => setActiveTab('waitlist')}
            className={`cursor-pointer rounded-xl p-3.5 sm:p-4 border transition active:scale-95 relative overflow-hidden ${
              activeTab === 'waitlist'
                ? 'bg-purple-50/80 border-purple-400 shadow-sm'
                : 'bg-white border-purple-200 hover:border-purple-300 shadow-sm'
            }`}
            title="Filter to Waiting List"
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-1 flex items-center justify-between">
              <span className="truncate">2. Waiting List</span>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{waitlistTeams.length}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">Priority ranks #1 to #5</p>
          </div>

          {/* Card 3: Total Official Contenders */}
          <div 
            onClick={() => setActiveTab('all')}
            className={`col-span-2 sm:col-span-1 cursor-pointer rounded-xl p-3.5 sm:p-4 border transition active:scale-95 relative overflow-hidden ${
              activeTab === 'all'
                ? 'bg-emerald-50/80 border-emerald-400 shadow-sm'
                : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-sm'
            }`}
            title="Show All Official Contenders"
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center justify-between">
              <span className="truncate">Total Contenders</span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{top45Teams.length + waitlistTeams.length}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">Top 45 + 5 Standby Teams</p>
          </div>
        </div>

        {/* 5. FILTER & SEARCH CONTROL BAR (HIGHLY OPTIMIZED FOR MOBILE TOUCH) */}
        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-3 print:hidden">
          
          {/* Top Row: Horizontally scrollable tab pills on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Pill Navigation (Native touch swipe on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scroll-smooth no-scrollbar -mx-1 px-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 active:scale-95 min-h-[38px] ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                All Teams ({top45Teams.length + waitlistTeams.length})
              </button>
              <button
                onClick={() => setActiveTab('top45')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 active:scale-95 min-h-[38px] ${
                  activeTab === 'top45'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                1. Top 45 Nominated ({top45Teams.length})
              </button>
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 active:scale-95 min-h-[38px] ${
                  activeTab === 'waitlist'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                2. Waiting List ({waitlistTeams.length})
              </button>
            </div>

            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" /> Branch:
              </span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm min-h-[38px]"
              >
                <option value="ALL">All Branches ({allBranches.length})</option>
                {allBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input with quick clear */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search team, leader name, branch, phone, or PS ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm font-medium min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 6. SECTION 1: TOP 45 SHORTLISTED TEAMS */}
        {(activeTab === 'all' || activeTab === 'top45') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-blue-800 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-700 text-white flex items-center justify-center text-xs font-mono">1</span>
                  <span>Tier 1: Top 45 Shortlisted Teams (Final Nomination Roster)</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  The evaluating jury's top 45 teams confirmed for official submission to the SIH 2026 National Portal (listed in alphabetical order).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 flex-shrink-0">
                {filteredTop45.length} Teams
              </span>
            </div>

            {/* Mobile Card Stack (md:hidden) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredTop45.map((t: any, idx: number) => (
                <div 
                  key={t.id || t.name}
                  onClick={() => setSelectedTeam(t)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-400 transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        Shortlisted
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t.membersCount || 6}
                    </span>
                  </div>

                  <div className="text-base font-black text-slate-950 tracking-tight leading-snug mb-1">
                    {t.name}
                  </div>

                  <div className="text-xs text-slate-600 mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-bold text-slate-900">{t.leaderName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-200/60">
                      {t.leaderBranch}
                    </span>
                    <span className="text-slate-500 text-[11px]">{t.leaderYear}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 mb-2.5 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-100/80 px-1.5 py-0.2 rounded border border-blue-200">
                        {t.psId}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {t.psDomain || 'Software'}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium line-clamp-2 leading-relaxed text-[11px]">
                      {t.psTitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {t.leaderPhone && t.leaderPhone !== 'N/A' && (
                        <a 
                          href={`tel:${t.leaderPhone.replace(/\s+/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 flex items-center justify-center transition border border-slate-200"
                          title={`Call ${t.leaderName}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {t.leaderEmail && t.leaderEmail !== 'N/A' && (
                        <a 
                          href={`mailto:${t.leaderEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 flex items-center justify-center transition border border-slate-200"
                          title={`Email ${t.leaderName}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeam(t);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition active:scale-95 min-h-[36px]"
                    >
                      <span>View Squad</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
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
                    {filteredTop45.map((t: any, idx: number) => (
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
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 7. SECTION 2: WAITING LIST (5 TEAMS) */}
        {(activeTab === 'all' || activeTab === 'waitlist') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-purple-800 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-purple-700 text-white flex items-center justify-center text-xs font-mono">2</span>
                  <span>Tier 2: Waiting List (5 Official Standby Teams)</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Official standby teams for withdrawal call-ups (listed in alphabetical order).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 flex-shrink-0">
                {filteredWaitlist.length} Teams
              </span>
            </div>

            {/* Mobile Card Stack (md:hidden) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredWaitlist.map((t: any, idx: number) => (
                <div 
                  key={t.id || t.name}
                  onClick={() => setSelectedTeam(t)}
                  className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm hover:border-purple-400 transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                        WL #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        Priority Standby
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t.membersCount || 6}
                    </span>
                  </div>

                  <div className="text-base font-black text-purple-950 tracking-tight leading-snug mb-1">
                    {t.name}
                  </div>

                  <div className="text-xs text-slate-600 mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-bold text-slate-900">{t.leaderName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-purple-900 bg-purple-100/70 px-1.5 py-0.5 rounded text-[10px] border border-purple-200/60">
                      {t.leaderBranch}
                    </span>
                    <span className="text-slate-500 text-[11px]">{t.leaderYear}</span>
                  </div>

                  <div className="bg-white border border-purple-200/80 rounded-lg p-2.5 mb-2.5 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        {t.psId}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {t.psDomain || 'Software'}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium line-clamp-2 leading-relaxed text-[11px]">
                      {t.psTitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-100">
                    <div className="flex items-center gap-1.5">
                      {t.leaderPhone && t.leaderPhone !== 'N/A' && (
                        <a 
                          href={`tel:${t.leaderPhone.replace(/\s+/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-purple-800 flex items-center justify-center transition border border-purple-200"
                          title={`Call ${t.leaderName}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {t.leaderEmail && t.leaderEmail !== 'N/A' && (
                        <a 
                          href={`mailto:${t.leaderEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-purple-800 flex items-center justify-center transition border border-purple-200"
                          title={`Email ${t.leaderName}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeam(t);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100/70 hover:bg-purple-200 text-purple-900 font-bold text-xs border border-purple-300 transition active:scale-95 min-h-[36px]"
                    >
                      <span>View Squad</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block border border-purple-200 rounded-xl overflow-hidden shadow-sm bg-white">
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

        {/* 8. PRINT-ONLY SIGNATURE ATTESTATION BLOCK */}
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

      {/* 9. TEAM SQUAD DETAIL MODAL (RESPONSIVE BOTTOM-SHEET ON MOBILE) */}
      {selectedTeam && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden transition-opacity"
          onClick={() => setSelectedTeam(null)}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle for Mobile */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <div className="pr-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    selectedTeam.category === 'Waiting List'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {selectedTeam.subStatus || selectedTeam.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {selectedTeam.id?.slice(0, 8)}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 mt-1 leading-snug">{selectedTeam.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Leader Details Card with One-Tap Mobile Actions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Team Leader &amp; Primary Contact
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedTeam.leaderName}</div>
                    <div className="text-slate-500 text-[11px]">{selectedTeam.leaderBranch} • {selectedTeam.leaderYear}</div>
                  </div>
                  <div className="space-y-0.5 text-left sm:text-right">
                    <div className="font-mono text-blue-900 font-bold">{selectedTeam.leaderPhone}</div>
                    <div className="text-slate-500 truncate max-w-[220px]">{selectedTeam.leaderEmail}</div>
                  </div>
                </div>

                {/* Quick Touch Contact Buttons */}
                <div className="pt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-200/60">
                  {selectedTeam.leaderPhone && selectedTeam.leaderPhone !== 'N/A' && (
                    <a
                      href={`tel:${selectedTeam.leaderPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] transition active:scale-95 min-h-[36px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Leader</span>
                    </a>
                  )}
                  {selectedTeam.leaderEmail && selectedTeam.leaderEmail !== 'N/A' && (
                    <a
                      href={`mailto:${selectedTeam.leaderEmail}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-300 transition active:scale-95 min-h-[36px]"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleCopy(`${selectedTeam.leaderName} - ${selectedTeam.leaderPhone} (${selectedTeam.leaderEmail})`, 'leader')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] transition active:scale-95 min-h-[36px]"
                  >
                    {copiedText === 'leader' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'leader' ? 'Copied' : 'Copy Contact'}</span>
                  </button>
                </div>
              </div>

              {/* Problem Statement Card */}
              <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-1.5 bg-white">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Problem Statement
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedTeam.psId}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Domain: {selectedTeam.psDomain || 'Software'}</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  {selectedTeam.psTitle}
                </div>
              </div>

              {/* Squad Members Roster */}
              <div className="space-y-2.5">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Registered Squad ({selectedTeam.members?.length || selectedTeam.membersCount} Members)</span>
                  <span className="text-[10px] font-normal text-slate-400">Verified participant team</span>
                </div>

                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                    {selectedTeam.members.map((m: any, mIdx: number) => (
                      <div key={m.id || mIdx} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {mIdx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
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
                        <div className="text-left sm:text-right text-[11px] pl-7 sm:pl-0 space-y-0.5">
                          <div className="font-mono text-slate-700 font-medium">{m.phone || 'N/A'}</div>
                          <div className="text-slate-400 truncate max-w-[200px]">{m.email}</div>
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
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition active:scale-95 min-h-[42px]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. INSTITUTIONAL FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 sm:py-8 px-4 sm:px-6 text-xs text-slate-500 print:hidden mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-900">University College of Engineering (Autonomous), Osmania University</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Central Hackathon Committee • SIH 2026 Internal Screening Round</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <a href="/api/export-teams-csv" className="text-blue-700 hover:underline font-semibold py-1">Export CSV</a>
            <span>•</span>
            <button onClick={handlePrint} className="text-blue-700 hover:underline font-semibold py-1">Print Report</button>
            <span>•</span>
            <a 
              href="https://sih-ouce.meetthealtezza.tech" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-600 hover:text-slate-900 font-semibold py-1"
            >
              Main Platform
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
