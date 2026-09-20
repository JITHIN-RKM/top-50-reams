import { X, CheckCircle2, XCircle } from 'lucide-react';
import { formatIST } from '@/lib/utils';
import { formatYear } from '@/lib/constants';

export function AdminTeamDetailModal({ team, onClose }: { team: any; onClose: () => void }) {
  const users = (team.users as any[]) || [];
  const leader = users.find(u => u.id === team.leader_id);

  const sizeValid = users.length === 6;
  const hasFemale = users.some(m => m.gender === 'female');
  const psValid = !!(team.ps1_id || team.ps2_id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-gray-200 max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-start justify-between z-10">
          <div>
            <h3 className="heading-display text-2xl text-sih-dark">{team.name}</h3>
            <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-widest">{team.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-[color,transform] duration-150 active:scale-[0.97] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Status & Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Team Status</p>
              <span className={"inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 " +
                (team.status === "finalized" ? "border-green-200 bg-green-50 text-green-700" :
                team.status === "open_for_members" ? "border-blue-200 bg-blue-50 text-blue-700" :
                "border-orange-200 bg-orange-50 text-orange-700")}>
                {team.status.replace("_", " ")}
              </span>
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phase 1:</span>
                  {team.phase1_registered ? (
                    <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] uppercase font-bold">Registered</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] uppercase font-bold">Didn&apos;t Register</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phase 2:</span>
                  {team.phase2_registered ? (
                    <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] uppercase font-bold">Registered</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] uppercase font-bold">Didn&apos;t Register</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-mono">Created: {formatIST(team.created_at)}</p>
            </div>
            
            <div className="border-2 border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Compliance</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {sizeValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-gray-700">Size: {users.length}/6</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasFemale ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-gray-700">Diversity (≥1 Female)</span>
                </div>
                <div className="flex items-center gap-2">
                  {psValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-gray-700">Problem Statement Selected</span>
                </div>
                {team.status === 'finalized' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phase1_pdfs/${team.id}.pdf`} 
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phase1_pdfs/${team.id}.pdf?t=${Date.now()}`, '_blank', 'noopener,noreferrer');
                      }}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-bold text-sih-blue hover:underline flex items-center gap-1"
                    >
                      View Submitted Phase 1 PDF &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem Statements */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Selected Problem Statements</p>
            <div className="space-y-3">
              {team.ps1_id ? (
                <div className="border-2 border-gray-100 p-4 bg-sih-gray/30">
                  <p className="font-bold text-sih-dark font-mono text-sm">{team.ps1_id}</p>
                  <p className="text-sm text-gray-700 mt-1">{team.ps1_title || 'Unknown Title'}</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 p-4 text-gray-400 text-sm font-bold">PS 1 Not Selected</div>
              )}

              {team.ps2_id ? (
                <div className="border-2 border-gray-100 p-4 bg-sih-gray/30">
                  <p className="font-bold text-sih-dark font-mono text-sm">{team.ps2_id}</p>
                  <p className="text-sm text-gray-700 mt-1">{team.ps2_title || 'Unknown Title'}</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 p-4 text-gray-400 text-sm font-bold">PS 2 Not Selected</div>
              )}
            </div>
          </div>

          {/* Roster */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Team Roster</p>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="border-2 border-gray-100 p-3 flex flex-wrap gap-4 items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      {u.full_name}
                      {u.id === team.leader_id && (
                        <span className="text-[10px] uppercase font-bold bg-blue-50 text-sih-blue px-1.5 py-0.5 rounded border border-blue-100">Leader</span>
                      )}
                    </p>
                    {u.roll_number && (
                      <p className="text-xs text-sih-blue font-mono font-bold mt-0.5">
                        {u.roll_number}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {u.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-700 font-bold uppercase">{u.branch} - {formatYear(u.year)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{u.gender}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-xs text-gray-500 font-mono">
                      {u.phone_number ? `${u.phone_country_code || '+91'} ${u.phone_number}` : 'No Phone'}
                    </p>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-gray-500 italic">No members found.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
