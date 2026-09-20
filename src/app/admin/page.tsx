import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postAnnouncement, deleteAnnouncement } from "@/lib/actions/admin-actions";
import { Shield, Trash2 } from "lucide-react";
import { AdminStudentsTable, AdminTeamsTable } from "./AdminTables";
import { AdminPhase1Table } from "./AdminPhase1Table";
import { AdminPhase2Table } from "./AdminPhase2Table";
import { formatIST } from "@/lib/utils";
import psDataRaw from '@/data/sih-2026-data.json';

const ALL_PS = psDataRaw as any[];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();
  if (user?.role !== "super_admin") redirect("/dashboard");

  const [
    { count: userCount },
    { count: teamCount },
    { count: finalTeamCount },
    { count: halfFilledTeamCount },
    { count: freeAgentsCount },
    { data: allUsers },
    { data: allTeams },
    { data: announcements },
    { data: phase1Regs },
    { data: phase2Regs },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }).eq("status", "finalized"),
    supabase.from("teams").select("*", { count: "exact", head: true }).in("status", ["forming", "open_for_members"]),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("onboarding_complete", true).is("team_id", null),
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("teams").select("*, users!fk_users_team(id, full_name, email, gender, branch, year, phone_number, phone_country_code)").order("created_at", { ascending: false }),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("phase1_registrations").select("*").order("created_at", { ascending: false }),
    supabase.from("phase2_registrations").select("*").order("created_at", { ascending: false }),
  ]);

  const targetRegistrations = 500;
  const progressPercent = Math.min(100, Math.round(((userCount || 0) / targetRegistrations) * 100));

  const phase1RegisteredTeamIds = new Set(
    (phase1Regs || []).map((r: any) => r.team_id)
  );
  const phase2RegisteredTeamIds = new Set(
    (phase2Regs || []).map((r: any) => r.team_id)
  );

  const teamsWithTitles = (allTeams || []).map((t: any) => ({
    ...t,
    ps1_title: t.ps1_id ? ALL_PS.find(ps => ps.id === t.ps1_id)?.title : undefined,
    ps2_title: t.ps2_id ? ALL_PS.find(ps => ps.id === t.ps2_id)?.title : undefined,
    phase1_registered: phase1RegisteredTeamIds.has(t.id),
    phase2_registered: phase2RegisteredTeamIds.has(t.id),
  }));

  // Build Phase 1 teams data for admin table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { data: phase1Files } = await supabase.storage.from('phase1_pdfs').list();
  const uploadedPdfTeamIds = new Set(
    (phase1Files || []).map((f: any) => f.name.replace(/\.pdf$/i, ''))
  );

  const phase1Teams = (phase1Regs || []).map((reg: any) => {
    const teamData = (allTeams || []).find((t: any) => t.id === reg.team_id);
    const users = (teamData?.users as any[]) || [];
    const leader = users.find((u: any) => u.id === teamData?.leader_id);
    const fileObj = (phase1Files || []).find((f: any) => f.name === `${reg.team_id}.pdf`);
    const fileTime = fileObj?.updated_at || fileObj?.created_at || '';
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/phase1_pdfs/${reg.team_id}.pdf${fileTime ? `?t=${new Date(fileTime).getTime()}` : ''}`;
    return {
      team_id: reg.team_id,
      team_name: teamData?.name || 'Unknown',
      leader_name: leader?.full_name || 'Unknown',
      leader_email: leader?.email || '',
      leader_phone: leader ? `${leader.phone_country_code || ''} ${leader.phone_number || ''}`.trim() : '',
      member_count: users.length,
      members: users.map((u: any) => ({
        id: u.id,
        name: u.full_name || 'Unnamed',
        isLeader: u.id === teamData?.leader_id,
        branch: u.branch,
        year: u.year,
      })),
      registered_at: reg.created_at,
      has_pdf: uploadedPdfTeamIds.has(reg.team_id),
      pdf_url: pdfUrl,
      ps1_id: teamData?.ps1_id,
      ps1_title: teamData?.ps1_id ? ALL_PS.find((ps: any) => ps.id === teamData.ps1_id)?.title : undefined,
    };
  });

  const pdfChecks = phase1Teams;

  // Build Phase 2 teams data
  const { data: phase2Files } = await supabase.storage.from('phase2_pdfs').list();
  const uploadedPhase2PdfTeamIds = new Set(
    (phase2Files || []).map((f: any) => f.name.replace(/\.pdf$/i, ''))
  );

  const phase2Teams = (phase2Regs || []).map((reg: any) => {
    const teamData = (allTeams || []).find((t: any) => t.id === reg.team_id);
    const users = (teamData?.users as any[]) || [];
    const leader = users.find((u: any) => u.id === teamData?.leader_id);
    const fileObj = (phase2Files || []).find((f: any) => f.name === `${reg.team_id}.pdf`);
    const fileTime = fileObj?.updated_at || fileObj?.created_at || '';
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/phase2_pdfs/${reg.team_id}.pdf${fileTime ? `?t=${new Date(fileTime).getTime()}` : ''}`;
    return {
      team_id: reg.team_id,
      team_name: teamData?.name || 'Unknown',
      leader_name: leader?.full_name || 'Unknown',
      leader_email: leader?.email || '',
      leader_phone: leader ? `${leader.phone_country_code || ''} ${leader.phone_number || ''}`.trim() : '',
      member_count: users.length,
      members: users.map((u: any) => ({
        id: u.id,
        name: u.full_name || 'Unnamed',
        isLeader: u.id === teamData?.leader_id,
        branch: u.branch,
        year: u.year,
      })),
      registered_at: reg.created_at,
      has_pdf: uploadedPhase2PdfTeamIds.has(reg.team_id),
      pdf_url: pdfUrl,
      ps1_id: teamData?.ps1_id,
      ps1_title: teamData?.ps1_id ? ALL_PS.find((ps: any) => ps.id === teamData.ps1_id)?.title : undefined,
      category: teamData?.ps1_id ? ALL_PS.find((ps: any) => ps.id === teamData.ps1_id)?.category : undefined,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Progress Ring Card */}
        <div className="bg-sih-dark border-2 border-sih-dark p-5 flex flex-col items-center justify-center gap-2 col-span-2 md:col-span-1 lg:col-span-1 text-center">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-sih-orange" strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <div className="absolute font-display text-white text-lg">{progressPercent}%</div>
          </div>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Reg Goal ({targetRegistrations})</p>
        </div>

        {[
          { label: "Total Students", value: userCount || 0, color: "text-sih-blue" },
          { label: "Total Teams", value: teamCount || 0, color: "text-sih-dark" },
          { label: "Finalized", value: finalTeamCount || 0, color: "text-green-600" },
          { label: "In Progress", value: halfFilledTeamCount || 0, color: "text-sih-orange" },
          { label: "Free Agents", value: freeAgentsCount || 0, color: "text-red-500" },
        ].map((m, i) => (
          <div key={i} className="bg-white border-2 border-gray-100 p-5 flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
            <p className={"font-display text-5xl " + m.color}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-100 p-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Broadcast Announcement</p>
          <form action={async (formData) => { "use server"; const res = await postAnnouncement(formData); if (!res.success) { console.error(res.error); } }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Title</label>
              <input name="title" type="text" required className="input-base" placeholder="e.g. Phase 1 Deadline Extended" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Message</label>
              <textarea name="content" required rows={3} className="input-base resize-none" placeholder="Write your announcement..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="adminOnlyAnnouncement" name="adminOnly" className="w-4 h-4 rounded border-gray-300 text-sih-blue focus:ring-sih-blue" />
              <label htmlFor="adminOnlyAnnouncement" className="text-sm text-gray-700 font-medium">
                Send only to admins
              </label>
            </div>
            <button type="submit" className="btn-primary w-full">
              <Shield className="w-4 h-4" />
              Broadcast Announcement
            </button>
          </form>
        </div>

        <div className="bg-white border-2 border-gray-100 p-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Recent Broadcasts</p>
          <div className="space-y-3">
            {!announcements?.length ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No announcements yet.</p>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className="p-4 border-2 border-gray-100 bg-sih-gray">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {item.title}
                        {item.admin_only && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Admin Only
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.content}</p>
                    </div>
                    <form action={async () => { "use server"; await deleteAnnouncement(item.id); }}>
                      <button type="submit" title="Delete Announcement" className="p-1.5 text-gray-400 hover:text-red-500 transition-[color,transform] duration-150 active:scale-[0.97] cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{formatIST(item.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>



      {/* Phase 1 Registered Teams */}
      <AdminPhase1Table phase1Teams={pdfChecks} />

      {/* Phase 2 Registered Teams */}
      <AdminPhase2Table phase2Teams={phase2Teams} />

      {/* Interactive Tables */}
      <AdminTeamsTable teams={teamsWithTitles} />
      <AdminStudentsTable users={allUsers || []} currentUserId={userId} />
    </div>
  );
}
