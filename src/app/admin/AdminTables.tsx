'use client';

import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { assignRole, kickUserFromTeam, disqualifyTeam } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { formatIST } from '@/lib/utils';
import { formatYear } from '@/lib/constants';
import { AdminTeamDetailModal } from '@/components/admin/AdminTeamDetailModal';

const sanitizeCSVField = (field: string | number | null | undefined) => {
  if (field == null) return '""';
  const str = String(field);
  const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
};

export function AdminStudentsTable({ users, currentUserId }: { users: any[], currentUserId: string }) {
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  
  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    u.branch?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = "Name,Roll Number,Email,Branch,Year,Gender,Role,Joined\n";
    const rows = filtered.map(u => [
      u.full_name, u.roll_number || '', u.email, u.branch, u.year, u.gender, u.role, formatIST(u.created_at)
    ].map(sanitizeCSVField).join(",")).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sih-students.csv";
    a.click();
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered Students</p>
          <p className="heading-display text-2xl text-sih-dark">{users.length} Students</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, email, roll no..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setDisplayCount(50); }}
              className="pl-9 pr-4 py-2 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white text-sm outline-none transition-[border-color,background-color] w-full sm:w-72"
            />
          </div>
          <button onClick={exportCSV} className="btn-outline px-4 py-2 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto shrink-0">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {["Name & Roll No", "Branch / Year", "Gender", "Role", "Joined", "Actions"].map(h => (
                <th key={h} className="pb-3 pr-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.slice(0, displayCount).map((u) => (
              <tr key={u.id} className="hover:bg-sih-gray/50 transition-[background-color] duration-100">
                <td className="py-4 pr-6">
                  <p className="font-bold text-gray-900">{u.full_name}</p>
                  {u.roll_number && (
                    <p className="text-[11px] text-sih-blue font-mono font-bold mt-0.5">
                      {u.roll_number}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                </td>
                <td className="py-4 pr-6 text-gray-700 text-xs font-bold">{u.branch} - {formatYear(u.year)}</td>
                <td className="py-4 pr-6 text-gray-700 text-xs capitalize">{u.gender}</td>
                <td className="py-4 pr-6">
                  <span className={"inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border-2 " +
                    (u.role === "super_admin" ? "border-sih-orange bg-orange-50 text-sih-orange" : "border-gray-200 bg-gray-50 text-gray-500")}>
                    {u.role || "student"}
                  </span>
                </td>
                <td className="py-4 pr-6 text-gray-400 text-xs">{formatIST(u.created_at)}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {u.team_id && u.id !== currentUserId && (
                      <button 
                        onClick={() => {
                          const promise = new Promise(async (resolve, reject) => {
                            const res = await kickUserFromTeam(u.id);
                            if (res.success) resolve(res);
                            else reject(new Error(res.error));
                          });
                          toast.promise(promise, { loading: "Processing...", success: "Kicked user from team", error: (err) => err.message });
                        }}
                        className="text-[10px] font-bold text-red-500 border-2 border-red-200 px-2 py-1 hover:bg-red-50 transition-[background-color,transform] duration-100 active:scale-[0.97]"
                        title="Remove student from their current team"
                      >
                        Kick from Team
                      </button>
                    )}
                    {u.id !== currentUserId && (
                      <button 
                        onClick={() => {
                          const promise = new Promise(async (resolve, reject) => {
                            const newRole = u.role === "super_admin" ? "student" : "super_admin";
                            const res = await assignRole(u.id, newRole);
                            if (res.success) resolve(res);
                            else reject(new Error(res.error));
                          });
                          toast.promise(promise, { loading: "Processing...", success: "Role updated", error: (err) => err.message });
                        }}
                        className={"text-[10px] font-bold px-2 py-1 border-2 transition-[background-color,transform] duration-100 active:scale-[0.97] " +
                          (u.role === "super_admin" ? "border-red-300 text-red-600 hover:bg-red-50" : "border-sih-orange text-sih-orange hover:bg-orange-50")}
                      >
                        {u.role === "super_admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > displayCount && (
          <div className="flex justify-center mt-6 mb-2">
            <button 
              onClick={() => setDisplayCount(prev => prev + 50)}
              className="px-6 py-2 border-2 border-gray-200 hover:border-sih-blue hover:text-sih-blue text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors bg-gray-50 hover:bg-blue-50"
            >
              Load More ({filtered.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminTeamsTable({ teams }: { teams: any[] }) {
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  
  const filtered = teams.filter(t => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const leader = (t.users as any[])?.find(u => u.id === t.leader_id);
    const p1Status = t.phase1_registered ? "registered" : "didn't register";
    const p2Status = t.phase2_registered ? "registered" : "didn't register";
    return (
      t.name?.toLowerCase().includes(q) ||
      leader?.full_name?.toLowerCase().includes(q) ||
      leader?.email?.toLowerCase().includes(q) ||
      p1Status.includes(q) ||
      p2Status.includes(q) ||
      t.ps1_id?.toLowerCase().includes(q) ||
      t.ps2_id?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = "Team Name,Leader,Leader Email,Leader Phone,Status,Members Count,Phase 1,Phase 2\n";
    const rows = filtered.map(t => {
      const leader = (t.users as any[])?.find(u => u.id === t.leader_id);
      return [
        t.name, 
        leader ? leader.full_name : 'Unknown', 
        leader ? leader.email : '',
        leader ? `${leader.phone_country_code || ''} ${leader.phone_number || ''}`.trim() : '',
        t.status, 
        t.users?.length || 0, 
        t.phase1_registered ? 'Registered' : "Didn't Register",
        t.phase2_registered ? 'Registered' : "Didn't Register"
      ].map(sanitizeCSVField).join(",")
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sih-teams.csv";
    a.click();
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teams Oversight</p>
          <p className="heading-display text-2xl text-sih-dark">{teams.length} Teams</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search teams..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setDisplayCount(50); }}
              className="pl-9 pr-4 py-2 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white text-sm outline-none transition-[border-color,background-color] w-full sm:w-64"
            />
          </div>
          <button onClick={exportCSV} className="btn-outline px-4 py-2 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto shrink-0">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {["S. No.", "Team", "Status", "Members", "Phase 1", "Phase 2", "Actions"].map(h => (
                <th key={h} className="pb-3 pr-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.slice(0, displayCount).map((team, index) => {
              const users = (team.users as any[]) || [];
              const leader = users.find(u => u.id === team.leader_id);
              
              return (
              <tr key={team.id} className="hover:bg-sih-gray/50 transition-[background-color] duration-100 cursor-pointer" onClick={() => setSelectedTeam(team)}>
                <td className="py-4 pr-6 text-gray-500 font-mono text-sm font-bold">
                  {index + 1}
                </td>
                <td className="py-4 pr-6">
                  <p className="font-bold text-gray-900">{team.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] uppercase font-bold bg-blue-50 text-sih-blue px-1.5 py-0.5 rounded-sm border border-blue-100">
                      Leader
                    </span>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      {leader ? leader.full_name : 'Unknown Leader'}
                    </p>
                  </div>
                </td>
                <td className="py-4 pr-6">
                  <span className={"inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border-2 " +
                    (team.status === "finalized" ? "border-green-200 bg-green-50 text-green-700" :
                    team.status === "open_for_members" ? "border-blue-200 bg-blue-50 text-blue-700" :
                    "border-orange-200 bg-orange-50 text-orange-700")}>
                    {team.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 pr-6">
                  <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-200">
                    {users.length}/6
                  </span>
                </td>
                <td className="py-4 pr-6 whitespace-nowrap">
                  {team.phase1_registered ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-green-200 bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></span>
                      Registered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-red-200 bg-red-50 text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      Didn&apos;t Register
                    </span>
                  )}
                </td>
                <td className="py-4 pr-6 whitespace-nowrap">
                  {team.phase2_registered ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-green-200 bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></span>
                      Registered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-red-200 bg-red-50 text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      Didn&apos;t Register
                    </span>
                  )}
                </td>
                <td className="py-4" onClick={(e) => e.stopPropagation()}>
                  {team.status !== "finalized" && (
                    <button 
                      onClick={() => {
                        const promise = new Promise(async (resolve, reject) => {
                          const res = await disqualifyTeam(team.id);
                          if (res.success) resolve(res);
                          else reject(new Error(res.error));
                        });
                        toast.promise(promise, { loading: "Processing...", success: "Team disqualified", error: (err) => err.message });
                      }}
                      className="text-[10px] font-bold text-red-500 border-2 border-red-200 px-2 py-1 hover:bg-red-50 transition-[background-color,transform] duration-100 active:scale-[0.97]"
                    >
                      Disqualify
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">No teams found.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > displayCount && (
          <div className="flex justify-center mt-6 mb-2">
            <button 
              onClick={() => setDisplayCount(prev => prev + 50)}
              className="px-6 py-2 border-2 border-gray-200 hover:border-sih-blue hover:text-sih-blue text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors bg-gray-50 hover:bg-blue-50"
            >
              Load More ({filtered.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>

      {selectedTeam && (
        <AdminTeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  );
}
