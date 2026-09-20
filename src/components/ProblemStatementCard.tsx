'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveProblemStatement, removeProblemStatement } from '@/lib/actions/team-actions';
import { Target, Loader2, CheckCircle2, Edit2, Plus, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

export function ProblemStatementCard({ team, isLeader, isFinalized, psTitles }: { team: any; isLeader: boolean; isFinalized: boolean, psTitles: { ps1?: string, ps2?: string } }) {
  const [isPending, startTransition] = useTransition();
  const [editingSlot, setEditingSlot] = useState<1 | 2 | null>(null);
  const [psInput, setPsInput] = useState('');

  const ps1 = team.ps1_id ? { id: team.ps1_id, title: psTitles?.ps1 || 'Unknown Title' } : undefined;
  const ps2 = team.ps2_id ? { id: team.ps2_id, title: psTitles?.ps2 || 'Unknown Title' } : undefined;
  const selectedCount = (team.ps1_id ? 1 : 0) + (team.ps2_id ? 1 : 0);

  const handleSave = async (slot: 1 | 2) => {
    if (psInput.length !== 3) return;
    const fullId = `SIH26${psInput}`;
    const toastId = toast.loading('Saving Problem Statement...');
    
    startTransition(async () => {
      const res = await saveProblemStatement(team.id, fullId, slot);
      if (res.success) {
        toast.success('Problem Statement saved.', { id: toastId });
        setEditingSlot(null);
        setPsInput('');
      } else {
        toast.error(res.error || 'Failed to save Problem Statement.', { id: toastId });
      }
    });
  };

  const handleRemove = async (slot: 1 | 2) => {
    if (!confirm(`Are you sure you want to remove Problem Statement ${slot}?`)) return;
    const toastId = toast.loading('Removing...');
    
    startTransition(async () => {
      const res = await removeProblemStatement(team.id, slot);
      if (res.success) {
        toast.success('Problem Statement removed.', { id: toastId });
      } else {
        toast.error(res.error || 'Failed to remove Problem Statement.', { id: toastId });
      }
    });
  };

  // Helper renderer for a PS slot
  const getSlotName = (slot: 1 | 2) => slot === 1 ? 'PRIMARY PROBLEM STATEMENT' : 'SECONDARY PROBLEM STATEMENT';
  const getAddSlotName = (slot: 1 | 2) => slot === 1 ? 'Primary Problem Statement' : 'Secondary Problem Statement';

  const renderSlot = (slot: 1 | 2, ps: any) => {
    if (ps) {
      return (
        <div className="border-2 border-gray-100 p-4 bg-sih-gray/30 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1 w-full">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{getSlotName(slot)}</p>
            <p className="font-bold text-sih-dark font-mono text-sm">{ps.id}</p>
            <p className="text-sm text-gray-700 mt-1 truncate">{ps.title}</p>
          </div>
          {isLeader && (
            <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => handleRemove(slot)}
                disabled={isPending}
                className="text-sm sm:text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 py-2 sm:py-0 text-left sm:text-right"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      );
    }

    if (editingSlot === slot) {
      return (
        <div className="border-2 border-sih-blue p-4 bg-blue-50/50">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{getSlotName(slot)}</p>
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
            <div className="flex bg-white border border-gray-300 rounded-sm overflow-hidden focus-within:border-sih-blue focus-within:ring-1 focus-within:ring-sih-blue">
              <span className="px-3 py-2 bg-gray-100 text-gray-500 font-mono text-sm font-bold border-r border-gray-300 select-none">SIH26</span>
              <input
                type="text"
                value={psInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setPsInput(val);
                }}
                placeholder="001"
                className="px-3 py-2 text-sm font-mono uppercase w-20 outline-none"
                disabled={isPending}
                maxLength={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave(slot)}
                disabled={isPending || psInput.length !== 3}
                className="btn-primary text-xs px-4 py-2 flex items-center justify-center cursor-pointer active:scale-[0.97] transition-all"
              >
                {isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Save
              </button>
              <button
                onClick={() => {
                  setEditingSlot(null);
                  setPsInput('');
                }}
                disabled={isPending}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer active:scale-[0.97]"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isLeader) {
      // Only show option to add if they have 0 or 1 PS selected and aren't already editing this slot
      return (
        <button
          onClick={() => {
            setEditingSlot(slot);
            setPsInput('');
          }}
          className="w-full border-2 border-dashed border-gray-200 p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-sih-blue hover:border-sih-blue hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">Add {getAddSlotName(slot)}</span>
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target</p>
          <h2 className="heading-display text-xl text-sih-dark">Problem Statement</h2>
        </div>
        <Link 
          href="/problem-statements" 
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold text-sih-blue hover:underline bg-blue-50 px-3 py-1.5 border border-blue-100"
        >
          Open PS Explorer
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      
      {!isLeader && selectedCount < 2 && (
        <p className="text-sm text-gray-500 mb-4 font-medium italic">
          Only the team leader can set the Problem Statement.
        </p>
      )}

      <div className="space-y-3">
        {/* Slot 1 */}
        {renderSlot(1, ps1)}
        
        {/* Slot 2 */}
        {(team.ps1_id || team.ps2_id || (isLeader && editingSlot === 2)) && renderSlot(2, ps2)}
        
        {selectedCount === 2 && (
          <p className="text-xs text-sih-orange font-bold text-right">
            Maximum 2 Problem Statements allowed.
          </p>
        )}
      </div>
    </div>
  );
}
