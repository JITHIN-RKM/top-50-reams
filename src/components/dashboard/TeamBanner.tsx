'use client';

import { useState, useTransition } from 'react';
import { Pencil, CheckCircle2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateTeamName } from '@/lib/actions/team-actions';
import { useRouter } from 'next/navigation';

interface TeamBannerProps {
  team: {
    id: string;
    name: string;
    status: string;
    leader_id?: string;
  };
  clerkId?: string;
}

export function TeamBanner({ team, clerkId }: TeamBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newName, setNewName] = useState(team.name);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Team name cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Team name must be at least 3 characters.');
      return;
    }
    if (trimmed === team.name) {
      setIsEditOpen(false);
      return;
    }

    setError('');
    const toastId = toast.loading('Updating team name...');
    startTransition(async () => {
      const res = await updateTeamName(team.id, trimmed);
      if (res.success) {
        toast.success(`Team name updated to "${res.newName}"!`, { id: toastId });
        setIsEditOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update team name.', { id: toastId });
        setError(res.error || 'Failed to update team name.');
      }
    });
  };

  return (
    <>
      <div className="bg-white border-2 border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 w-full sm:w-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Your Team
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {team.name}
            </h2>
            <button
              type="button"
              onClick={() => {
                setNewName(team.name);
                setError('');
                setIsEditOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-sih-blue hover:bg-sih-darkBlue text-white font-bold text-xs px-3 py-1.5 rounded-xs transition-all active:scale-[0.97] cursor-pointer shadow-xs shrink-0"
              title="Change your team name"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Change Team Name</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${
              team.status === 'finalized'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-orange-50 text-sih-orange border-orange-200'
            }`}
          >
            {team.status === 'finalized' ? 'Finalized' : 'Drafting Roster'}
          </span>
        </div>
      </div>

      {/* Change Team Name Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border-2 border-sih-dark p-6 sm:p-7 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start gap-4 mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-50 border border-blue-200 text-sih-blue flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Team Settings
                  </p>
                  <h3 className="heading-display text-xl text-sih-dark">
                    Change Team Name
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Team Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (error) setError('');
                  }}
                  maxLength={50}
                  placeholder="e.g. CodeSwitch, NeuroNest"
                  autoFocus
                  className="w-full border-2 border-gray-200 focus:border-sih-blue focus:bg-white bg-sih-gray px-3.5 py-2.5 text-sm font-bold text-sih-dark outline-none transition-colors"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Between 3 and 50 characters</span>
                  <span>{newName.length}/50</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 p-2.5">
                  ⚠️ {error}
                </p>
              )}

              <div className="bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
                <p className="font-bold">💡 Official SIH Naming Guidelines:</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Team names should be unique and must not contain the institute or college name in any form. The new name will automatically update across your pitch cards, Phase 1 dashboard, and attendance lists.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.97] cursor-pointer w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newName.trim()}
                  className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Save Team Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
