'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Rocket,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Users,
  Layers,
} from 'lucide-react';
import { formatIST } from '@/lib/utils';

const sanitizeCSVField = (field: string | number | null | undefined) => {
  if (field == null) return '""';
  const str = String(field).trim();
  const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
};

const CRITERIA = [
  'Novelty / Originality',
  'Complexity & Technical Challenge',
  'Clarity & Format Completeness',
  'Feasibility',
  'Practicability & Ease of Implementation',
  'Sustainability',
  'Scale of Impact',
  'User Experience (UX)',
  'Potential for Future Work & Scalability',
];

interface Phase1Member {
  id: string;
  name: string;
  isLeader: boolean;
  branch?: string;
  year?: string;
}

interface Phase1Team {
  team_id: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  member_count: number;
  members?: Phase1Member[];
  registered_at: string;
  has_pdf: boolean;
  pdf_url: string;
  ps1_id?: string;
  ps1_title?: string;
}

export function AdminPhase1Table({ phase1Teams }: { phase1Teams: Phase1Team[] }) {
  const [search, setSearch] = useState('');

  const filtered = phase1Teams.filter(
    (t) =>
      t.team_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.leader_name?.toLowerCase().includes(search.toLowerCase())
  );

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // 1) Attendance Sheet (sno, team name, team members name, signature)
  const exportAttendanceSheet = (mode: 'members' | 'teams' = 'members') => {
    if (mode === 'members') {
      const headers = ['sno', 'team name', 'team members name', 'signature']
        .map(sanitizeCSVField)
        .join(',');
      let sno = 1;
      const rows = filtered.flatMap((t) => {
        const mems =
          t.members && t.members.length > 0
            ? [...t.members].sort((a, b) =>
                a.isLeader ? -1 : b.isLeader ? 1 : 0
              )
            : [{ id: '1', name: t.leader_name, isLeader: true }];

        return mems.map((m) =>
          [
            sno++,
            t.team_name,
            m.isLeader ? `${m.name} (Team Leader)` : m.name,
            '', // Blank for physical signature
          ]
            .map(sanitizeCSVField)
            .join(',')
        );
      });
      downloadBlob([headers, ...rows].join('\n'), 'attendance_sheet.csv');
    } else {
      const headers = ['sno', 'team name', 'team members name', 'signature']
        .map(sanitizeCSVField)
        .join(',');
      const rows = filtered.map((t, idx) => {
        const memsStr =
          t.members && t.members.length > 0
            ? [...t.members]
                .sort((a, b) => (a.isLeader ? -1 : b.isLeader ? 1 : 0))
                .map((m, i) => `${i + 1}. ${m.name}${m.isLeader ? ' (Leader)' : ''}`)
                .join('; ')
            : t.leader_name;

        return [idx + 1, t.team_name, memsStr, ''].map(sanitizeCSVField).join(',');
      });
      downloadBlob([headers, ...rows].join('\n'), 'attendance_sheet_by_team.csv');
    }
  };

  // 2) Scoring Sheet (sno, team name, team ps id and title selected, 9 criteria, total for 100)
  const exportScoringSheet = () => {
    const headers = [
      'sno',
      'team name',
      'team ps id and title selected',
      ...CRITERIA,
      'total for (100)',
    ]
      .map(sanitizeCSVField)
      .join(',');

    const rows = filtered.map((t, idx) => {
      const psText = t.ps1_id
        ? `${t.ps1_id} - ${t.ps1_title || ''}`
        : 'Not Selected';

      return [
        idx + 1,
        t.team_name,
        psText,
        '', // Novelty / Originality
        '', // Complexity & Technical Challenge
        '', // Clarity & Format Completeness
        '', // Feasibility
        '', // Practicability & Ease of Implementation
        '', // Sustainability
        '', // Scale of Impact
        '', // User Experience (UX)
        '', // Potential for Future Work & Scalability
        '', // total for (100)
      ]
        .map(sanitizeCSVField)
        .join(',');
    });
    downloadBlob([headers, ...rows].join('\n'), 'scoring_sheet.csv');
  };

  // 3) Registered Teams (sno, team name, team leader, are/did you presenting in phase 1, interest for phase 2)
  const exportRegisteredTeams = () => {
    const headers = [
      'sno',
      'team name',
      'team leader',
      'are/did you presenting in phase 1',
      'interest for phase 2',
    ]
      .map(sanitizeCSVField)
      .join(',');

    const rows = filtered.map((t, idx) => {
      return [
        idx + 1,
        t.team_name,
        t.leader_name,
        '', // are/did you presenting in phase 1 (blank)
        '', // interest for phase 2 (blank)
      ]
        .map(sanitizeCSVField)
        .join(',');
    });
    downloadBlob([headers, ...rows].join('\n'), 'registered_teams.csv');
  };

  // Download All 3 Sheets with staggered delay so browser permits multi-downloads
  const exportAllSheets = () => {
    exportAttendanceSheet('members');
    setTimeout(() => exportScoringSheet(), 300);
    setTimeout(() => exportRegisteredTeams(), 600);
  };

  // Full Raw CSV
  const exportFullCSV = () => {
    const headers =
      'Team Name,Leader,Leader Email,Leader Phone,Members,Registered At,PDF Submitted,PDF URL,PS ID,PS Title\n';
    const rows = filtered
      .map((t) =>
        [
          t.team_name,
          t.leader_name,
          t.leader_email,
          t.leader_phone,
          t.member_count,
          t.registered_at,
          t.has_pdf ? 'Yes' : 'No',
          t.has_pdf ? t.pdf_url : '',
          t.ps1_id || 'None',
          t.ps1_title || '',
        ]
          .map(sanitizeCSVField)
          .join(',')
      )
      .join('\n');
    downloadBlob(headers + rows, 'sih-phase1-full-teams.csv');
  };

  const pdfCount = phase1Teams.filter((t) => t.has_pdf).length;

  return (
    <div className="bg-white border-2 border-gray-100 p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-4 h-4 text-sih-blue" />
            <p className="text-[10px] font-bold text-sih-blue uppercase tracking-widest">
              Phase 1 Registrations
            </p>
          </div>
          <p className="heading-display text-2xl text-sih-dark">
            {phase1Teams.length} Teams Registered
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {pdfCount} / {phase1Teams.length} PDFs submitted
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams or leaders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white text-sm outline-none transition-[border-color,background-color] w-full sm:w-72"
          />
        </div>
      </div>

      {/* Official Pitch Day CSV Downloads Bar */}
      <div className="bg-sih-gray/70 border-2 border-gray-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sih-blue" />
            <span className="text-xs font-bold text-sih-dark uppercase tracking-wider">
              Download Official Pitch Day CSV Sheets
            </span>
          </div>
          <button
            onClick={exportAllSheets}
            className="inline-flex items-center justify-center gap-1.5 bg-sih-blue text-white font-bold text-xs px-3.5 py-1.5 hover:bg-sih-darkBlue transition-all active:scale-[0.97] self-start sm:self-auto cursor-pointer"
            title="Downloads attendance_sheet.csv, scoring_sheet.csv, and registered_teams.csv"
          >
            <Download className="w-3.5 h-3.5" />
            Download All 3 CSVs
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Attendance Sheet */}
          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <CheckSquare className="w-3.5 h-3.5 text-green-600" />
                <span>1. Attendance Sheet</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                sno, team name, team members name, signature
              </p>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => exportAttendanceSheet('members')}
                className="flex-1 bg-gray-50 hover:bg-sih-blue hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center"
                title="Per member sign-in rows (ideal for printed physical signatures)"
              >
                Sign-in (Per Member)
              </button>
              <button
                onClick={() => exportAttendanceSheet('teams')}
                className="bg-gray-50 hover:bg-gray-200 border border-gray-300 text-gray-600 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center"
                title="Per team summary row with all 6 members"
              >
                By Team
              </button>
            </div>
          </div>

          {/* 2. Scoring Sheet */}
          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Award className="w-3.5 h-3.5 text-sih-orange" />
                <span>2. Scoring Sheet</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                sno, team, PS ID &amp; Title, 9 criteria, total (100)
              </p>
            </div>
            <button
              onClick={exportScoringSheet}
              className="w-full bg-gray-50 hover:bg-sih-orange hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download scoring_sheet.csv
            </button>
          </div>

          {/* 3. Registered Teams */}
          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Registered Teams</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                sno, team, leader, presenting in P1, interest P2
              </p>
            </div>
            <button
              onClick={exportRegisteredTeams}
              className="w-full bg-gray-50 hover:bg-purple-600 hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download registered_teams.csv
            </button>
          </div>

          {/* 4. Full Data Export */}
          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Layers className="w-3.5 h-3.5 text-gray-600" />
                <span>4. Complete Records</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Includes leader emails, phones, PDF URLs, timestamps
              </p>
            </div>
            <button
              onClick={exportFullCSV}
              className="w-full bg-gray-50 hover:bg-gray-800 hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download Full Raw CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {[
                'S. No.',
                'Team',
                'Leader',
                'Members',
                'PS',
                'Registered',
                'PDF',
              ].map((h) => (
                <th
                  key={h}
                  className="pb-3 pr-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((team, index) => (
              <tr
                key={team.team_id}
                className="hover:bg-sih-gray/50 transition-[background-color] duration-100"
              >
                <td className="py-4 pr-6 text-gray-500 font-mono text-sm font-bold">
                  {index + 1}
                </td>
                <td className="py-4 pr-6">
                  <p className="font-bold text-gray-900">{team.team_name}</p>
                </td>
                <td className="py-4 pr-6">
                  <p className="font-bold text-gray-900 text-xs">
                    {team.leader_name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {team.leader_email}
                  </p>
                  {team.leader_phone && (
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {team.leader_phone}
                    </p>
                  )}
                </td>
                <td className="py-4 pr-6">
                  <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-200">
                    {team.member_count}/6
                  </span>
                </td>
                <td className="py-4 pr-6 text-gray-500 text-xs font-mono font-bold max-w-[200px] truncate">
                  {team.ps1_id
                    ? `${team.ps1_id} — ${team.ps1_title || 'Unknown'}`
                    : 'Not Selected'}
                </td>
                <td className="py-4 pr-6 text-gray-400 text-xs">
                  {formatIST(team.registered_at)}
                </td>
                <td className="py-4 pr-6">
                  {team.has_pdf ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <a
                        href={team.pdf_url}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`${team.pdf_url.split('?')[0]}?t=${Date.now()}`, '_blank', 'noopener,noreferrer');
                        }}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-sih-blue border-2 border-sih-blue/30 px-2 py-1 hover:bg-sih-blue hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Not Submitted
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-400 text-sm font-bold uppercase tracking-widest"
                >
                  No Phase 1 teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
