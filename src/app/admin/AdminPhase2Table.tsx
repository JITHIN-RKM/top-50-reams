'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Layers,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Users,
  Rocket,
} from 'lucide-react';
import { formatIST } from '@/lib/utils';

// Teams that should always appear LAST in pitch order (organizer teams)
export function isPanchajanyaTeam(t: { team_id?: string; team_name?: string; leader_name?: string; leader_email?: string }): boolean {
  const id = t.team_id || '';
  const name = (t.team_name || '').toLowerCase();
  const leader = (t.leader_name || '').toLowerCase();
  const email = (t.leader_email || '').toLowerCase();

  return (
    id === '2f0fac48-3e98-4e10-b674-5422cba92a32' ||
    name.includes('panch') ||
    leader.includes('om akshay') ||
    leader.includes('akshay reddy') ||
    email.includes('omakshayreddy')
  );
}

export function isOrganizerTeam(t: { team_id?: string; team_name?: string; leader_name?: string; leader_email?: string }): boolean {
  const id = t.team_id || '';
  const name = (t.team_name || '').toLowerCase();
  const leader = (t.leader_name || '').toLowerCase();
  const email = (t.leader_email || '').toLowerCase();

  if (
    id === 'e6897095-49ec-4f7c-b909-23020ea0f3bd' ||
    name.includes('altezza') ||
    leader.includes('jithin') ||
    email.includes('jithin')
  ) {
    return true;
  }

  return isPanchajanyaTeam(t);
}

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

interface Phase2Member {
  id: string;
  name: string;
  isLeader: boolean;
  branch?: string;
  year?: string;
}

interface Phase2Team {
  team_id: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  member_count: number;
  members?: Phase2Member[];
  registered_at: string;
  has_pdf: boolean;
  pdf_url: string;
  ps1_id?: string;
  ps1_title?: string;
  category?: string; // 'Software' | 'Hardware'
}

function getPitchOrder(teams: Phase2Team[]): Phase2Team[] {
  const normal = teams.filter((t) => !isOrganizerTeam(t));
  const organizers = teams.filter((t) => isOrganizerTeam(t));

  // Sort normal teams: software first, then hardware
  const software = normal.filter((t) => (t.category || '').toLowerCase() !== 'hardware');
  const hardware = normal.filter((t) => (t.category || '').toLowerCase() === 'hardware');

  // Sort organizers so that Altezza is second-to-last and Panchajanya is strictly LAST
  organizers.sort((a, b) => {
    if (isPanchajanyaTeam(a) && !isPanchajanyaTeam(b)) return 1;
    if (!isPanchajanyaTeam(a) && isPanchajanyaTeam(b)) return -1;
    return 0;
  });

  return [...software, ...hardware, ...organizers];
}

export function AdminPhase2Table({ phase2Teams }: { phase2Teams: Phase2Team[] }) {
  const [search, setSearch] = useState('');
  const [showPitchOrder, setShowPitchOrder] = useState(false);

  const filtered = phase2Teams.filter(
    (t) =>
      t.team_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.leader_name?.toLowerCase().includes(search.toLowerCase())
  );

  const displayTeams = showPitchOrder ? getPitchOrder(filtered) : filtered;

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

  // 1) Attendance Sheet
  const exportAttendanceSheet = (mode: 'members' | 'teams' = 'members') => {
    const orderedTeams = getPitchOrder(filtered);
    if (mode === 'members') {
      const headers = ['sno', 'team name', 'team members name', 'signature']
        .map(sanitizeCSVField)
        .join(',');
      let sno = 1;
      const rows = orderedTeams.flatMap((t) => {
        const mems =
          t.members && t.members.length > 0
            ? [...t.members].sort((a, b) => (a.isLeader ? -1 : b.isLeader ? 1 : 0))
            : [{ id: '1', name: t.leader_name, isLeader: true }];
        return mems.map((m) =>
          [
            sno++,
            t.team_name,
            m.isLeader ? `${m.name} (Team Leader)` : m.name,
            '',
          ]
            .map(sanitizeCSVField)
            .join(',')
        );
      });
      downloadBlob([headers, ...rows].join('\n'), 'p2_attendance_sheet.csv');
    } else {
      const headers = ['sno', 'team name', 'team members name', 'signature']
        .map(sanitizeCSVField)
        .join(',');
      const rows = orderedTeams.map((t, idx) => {
        const memsStr =
          t.members && t.members.length > 0
            ? [...t.members]
                .sort((a, b) => (a.isLeader ? -1 : b.isLeader ? 1 : 0))
                .map((m, i) => `${i + 1}. ${m.name}${m.isLeader ? ' (Leader)' : ''}`)
                .join('; ')
            : t.leader_name;
        return [idx + 1, t.team_name, memsStr, ''].map(sanitizeCSVField).join(',');
      });
      downloadBlob([headers, ...rows].join('\n'), 'p2_attendance_sheet_by_team.csv');
    }
  };

  // 2) Scoring Sheet
  const exportScoringSheet = () => {
    const orderedTeams = getPitchOrder(filtered);
    const headers = [
      'sno',
      'team name',
      'team ps id and title selected',
      ...CRITERIA,
      'total for (100)',
    ]
      .map(sanitizeCSVField)
      .join(',');

    const rows = orderedTeams.map((t, idx) => {
      const psText = t.ps1_id ? `${t.ps1_id} - ${t.ps1_title || ''}` : 'Not Selected';
      return [
        idx + 1,
        t.team_name,
        psText,
        '', '', '', '', '', '', '', '', '',
        '',
      ]
        .map(sanitizeCSVField)
        .join(',');
    });
    downloadBlob([headers, ...rows].join('\n'), 'p2_scoring_sheet.csv');
  };

  // 3) Registered Teams
  const exportRegisteredTeams = () => {
    const orderedTeams = getPitchOrder(filtered);
    const headers = [
      'sno',
      'team name',
      'team leader',
      'pitch slot',
      'pdf submitted',
    ]
      .map(sanitizeCSVField)
      .join(',');

    const rows = orderedTeams.map((t, idx) => {
      return [
        idx + 1,
        t.team_name,
        t.leader_name,
        '',
        t.has_pdf ? 'Yes' : 'No',
      ]
        .map(sanitizeCSVField)
        .join(',');
    });
    downloadBlob([headers, ...rows].join('\n'), 'p2_registered_teams.csv');
  };

  const exportAllSheets = () => {
    exportAttendanceSheet('members');
    setTimeout(() => exportScoringSheet(), 300);
    setTimeout(() => exportRegisteredTeams(), 600);
  };

  const exportFullCSV = () => {
    const orderedTeams = getPitchOrder(filtered);
    const headers =
      'Pitch Order,Team Name,Leader,Leader Email,Leader Phone,Members,Registered At,PDF Submitted,PDF URL,PS ID,PS Title\n';
    const rows = orderedTeams
      .map((t, idx) =>
        [
          idx + 1,
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
    downloadBlob(headers + rows, 'sih-phase2-full-teams.csv');
  };

  const pdfCount = phase2Teams.filter((t) => t.has_pdf).length;

  return (
    <div className="bg-white border-2 border-sih-blue/20 p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-sih-blue" />
            <p className="text-[10px] font-bold text-sih-blue uppercase tracking-widest">
              Phase 2 Registrations
            </p>
          </div>
          <p className="heading-display text-2xl text-sih-dark">
            {phase2Teams.length} Teams Registered
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {pdfCount} / {phase2Teams.length} PDFs submitted
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowPitchOrder((v) => !v)}
            className={`text-xs font-bold px-3 py-2 border-2 transition-colors cursor-pointer ${
              showPitchOrder
                ? 'bg-sih-blue text-white border-sih-blue'
                : 'bg-white text-sih-blue border-sih-blue hover:bg-blue-50'
            }`}
          >
            {showPitchOrder ? 'Showing Pitch Order' : 'Show Pitch Order'}
          </button>
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
      </div>

      {showPitchOrder && (
        <div className="bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-medium">
          <strong>Pitch order:</strong> Software teams → Hardware teams → Organizer teams (Altezza → Panchajanya pitching strictly last).
        </div>
      )}

      {/* CSV Download Bar */}
      <div className="bg-sih-gray/70 border-2 border-gray-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sih-blue" />
            <span className="text-xs font-bold text-sih-dark uppercase tracking-wider">
              Download Phase 2 CSV Sheets
            </span>
          </div>
          <button
            onClick={exportAllSheets}
            className="inline-flex items-center justify-center gap-1.5 bg-sih-blue text-white font-bold text-xs px-3.5 py-1.5 hover:bg-sih-darkBlue transition-all active:scale-[0.97] self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download All 3 CSVs
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
              >
                Sign-in (Per Member)
              </button>
              <button
                onClick={() => exportAttendanceSheet('teams')}
                className="bg-gray-50 hover:bg-gray-200 border border-gray-300 text-gray-600 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center"
              >
                By Team
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Award className="w-3.5 h-3.5 text-sih-orange" />
                <span>2. Scoring Sheet</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                sno, team, PS ID & Title, 9 criteria, total (100)
              </p>
            </div>
            <button
              onClick={exportScoringSheet}
              className="w-full bg-gray-50 hover:bg-sih-orange hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download p2_scoring_sheet.csv
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Registered Teams</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                sno, team, leader, pitch slot, pdf submitted
              </p>
            </div>
            <button
              onClick={exportRegisteredTeams}
              className="w-full bg-gray-50 hover:bg-purple-600 hover:text-white border border-gray-300 text-gray-700 text-[11px] font-bold py-1.5 px-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download p2_registered_teams.csv
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-3 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                <Rocket className="w-3.5 h-3.5 text-gray-600" />
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
                showPitchOrder ? 'Pitch #' : 'S. No.',
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
            {displayTeams.map((team, index) => {
              const isOrg = isOrganizerTeam(team);
              const isPanch = isPanchajanyaTeam(team);
              return (
                <tr
                  key={team.team_id}
                  className={`hover:bg-sih-gray/50 transition-[background-color] duration-100 ${
                    isOrg ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <td className="py-4 pr-6 text-gray-500 font-mono text-sm font-bold">
                    {index + 1}
                    {isOrg && showPitchOrder && (
                      <span className="ml-1.5 text-sih-orange text-[9px] font-bold uppercase tracking-wider bg-orange-100 px-1.5 py-0.5 border border-orange-200">
                        {isPanch ? 'LAST' : 'ORGANIZER'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-6">
                    <p className="font-bold text-gray-900">{team.team_name}</p>
                    {isOrg && (
                      <span className="text-[9px] uppercase font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 border border-orange-200">
                        {isPanch ? 'Organizer (Panchajanya)' : 'Organizer (Altezza)'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-6">
                    <p className="font-bold text-gray-900 text-xs">{team.leader_name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{team.leader_email}</p>
                    {team.leader_phone && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{team.leader_phone}</p>
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
                            window.open(
                              `${team.pdf_url.split('?')[0]}?t=${Date.now()}`,
                              '_blank',
                              'noopener,noreferrer'
                            );
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
              );
            })}
            {!displayTeams.length && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-400 text-sm font-bold uppercase tracking-widest"
                >
                  No Phase 2 teams registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
