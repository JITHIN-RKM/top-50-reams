'use client';

import { useState, useTransition } from 'react';
import { Target, CheckCircle2, AlertTriangle, Loader2, Edit2, X, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { saveProblemStatement, removeProblemStatement } from '@/lib/actions/team-actions';
import psQuickList from '@/data/ps-quick-list.json';
import Link from 'next/link';

interface PSItem {
  id: string;
  title: string;
  category?: string;
  theme?: string;
}

export function Phase2ProblemStatementSection({
  team,
  isLeader,
}: {
  team: {
    id: string;
    name: string;
    ps1_id?: string | null;
    ps2_id?: string | null;
  };
  isLeader: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [ps1Id, setPs1Id] = useState<string | null>(team.ps1_id || null);
  const [ps2Id, setPs2Id] = useState<string | null>(team.ps2_id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetSlot, setTargetSlot] = useState<1 | 2>(1);
  const [psInput, setPsInput] = useState('');

  const ps1: PSItem | undefined = ps1Id
    ? psQuickList.find((p) => p.id === ps1Id)
    : undefined;

  const ps2: PSItem | undefined = ps2Id
    ? psQuickList.find((p) => p.id === ps2Id)
    : undefined;

  // Live match as user types 3 digits
  const previewPs = psInput.length === 3
    ? psQuickList.find((p) => p.id === `SIH26${psInput}`)
    : undefined;

  const handleSave = (slot: 1 | 2) => {
    if (psInput.length !== 3) {
      toast.error('Please enter a 3-digit problem statement number (e.g. 042)');
      return;
    }

    const fullId = `SIH26${psInput}`;
    const matched = psQuickList.find((p) => p.id === fullId);
    if (!matched) {
      toast.error('Invalid Problem Statement ID. Check the PS Explorer.');
      return;
    }

    const toastId = toast.loading('Saving Problem Statement...');
    startTransition(async () => {
      const res = await saveProblemStatement(team.id, fullId, slot);
      if (res.success) {
        toast.success(`Problem Statement ${slot} saved!`, { id: toastId });
        if (slot === 1) setPs1Id(fullId);
        else setPs2Id(fullId);
        setIsEditing(false);
        setPsInput('');
      } else {
        toast.error(res.error || 'Failed to save Problem Statement', { id: toastId });
      }
    });
  };

  const handleRemove = (slot: 1 | 2) => {
    if (!confirm(`Are you sure you want to remove Problem Statement ${slot}?`)) return;
    const toastId = toast.loading('Removing Problem Statement...');
    startTransition(async () => {
      const res = await removeProblemStatement(team.id, slot);
      if (res.success) {
        toast.success('Problem Statement removed.', { id: toastId });
        if (slot === 1) setPs1Id(null);
        else setPs2Id(null);
      } else {
        toast.error(res.error || 'Failed to remove Problem Statement', { id: toastId });
      }
    });
  };

  const hasAnyPs = !!ps1Id || !!ps2Id;

  return (
    <div className="bg-white border-2 border-gray-100 p-6 md:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sih-blue flex items-center justify-center text-white flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Phase 2 Evaluation Target
            </p>
            <h2 className="heading-display text-xl text-sih-dark">
              Problem Statement
            </h2>
          </div>
        </div>

        <Link
          href="/problem-statements"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold text-sih-blue hover:underline bg-blue-50 px-3 py-1.5 border border-blue-100 flex-shrink-0"
        >
          <span>PS Explorer (240 Statements)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Warning Callout if NO PS is selected */}
      {!hasAnyPs && !isEditing && (
        <div className="bg-amber-50 border-2 border-amber-300 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900 text-sm">
                No Problem Statement Selected Yet
              </p>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                Your team is registered for Phase 2 pitching, but you haven&apos;t attached your Problem Statement yet.
                Judges require your Problem Statement ID to evaluate your 10-minute presentation on 16 September.
              </p>
            </div>
          </div>

          {isLeader ? (
            <button
              onClick={() => {
                setTargetSlot(1);
                setIsEditing(true);
                setPsInput('');
              }}
              className="btn-primary text-xs flex items-center gap-2 py-2 px-4 cursor-pointer active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              Attach Problem Statement Now
            </button>
          ) : (
            <p className="text-xs text-amber-700 italic">
              Please ask your team leader to attach the Problem Statement using their dashboard.
            </p>
          )}
        </div>
      )}

      {/* Editing Form */}
      {isEditing && (
        <div className="border-2 border-sih-blue p-5 bg-blue-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-sih-dark uppercase tracking-widest">
              {targetSlot === 1 ? 'Primary Problem Statement (PS 1)' : 'Secondary Problem Statement (PS 2)'}
            </p>
            <button
              onClick={() => {
                setIsEditing(false);
                setPsInput('');
              }}
              className="text-gray-400 hover:text-gray-700 p-1"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600">
            Enter the 3-digit problem statement number (e.g. type <strong className="text-sih-blue">042</strong> for SIH26042):
          </p>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="flex bg-white border-2 border-gray-300 rounded-none overflow-hidden focus-within:border-sih-blue">
              <span className="px-3 py-2 bg-gray-100 text-gray-500 font-mono text-sm font-bold border-r border-gray-300 select-none">
                SIH26
              </span>
              <input
                type="text"
                value={psInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setPsInput(val);
                }}
                placeholder="001"
                className="px-3 py-2 text-sm font-mono uppercase w-24 outline-none font-bold text-gray-900"
                disabled={isPending}
                maxLength={3}
                autoFocus
              />
            </div>

            <button
              onClick={() => handleSave(targetSlot)}
              disabled={isPending || psInput.length !== 3 || !previewPs}
              className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Problem Statement
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                setPsInput('');
              }}
              disabled={isPending}
              className="text-xs font-bold text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 bg-white"
            >
              Cancel
            </button>
          </div>

          {/* Live Preview of PS */}
          {previewPs && (
            <div className="bg-white border-2 border-emerald-400 p-4 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-bold text-emerald-800 text-sm">{previewPs.id}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {previewPs.category || 'Software'}
                </span>
                {previewPs.theme && (
                  <span className="text-[10px] font-medium text-gray-500 truncate max-w-xs">
                    &middot; {previewPs.theme}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug">
                {previewPs.title}
              </p>
            </div>
          )}

          {psInput.length === 3 && !previewPs && (
            <p className="text-xs text-red-600 font-medium">
              No problem statement found for SIH26{psInput}. Please verify the number in the PS Explorer.
            </p>
          )}
        </div>
      )}

      {/* Selected PS Cards */}
      {hasAnyPs && !isEditing && (
        <div className="space-y-3">
          {/* PS 1 */}
          {ps1 && (
            <div className="border-2 border-gray-200 p-5 bg-sih-gray/40 flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                    Primary Problem Statement (PS 1)
                  </span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase bg-gray-100 px-2 py-0.5 border border-gray-200">
                    {ps1.category || 'Software'}
                  </span>
                </div>
                <p className="font-mono font-bold text-sih-dark text-base pt-1">
                  {ps1.id}
                </p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {ps1.title}
                </p>
                {ps1.theme && (
                  <p className="text-xs text-gray-500">
                    Theme: <span className="font-semibold text-gray-700">{ps1.theme}</span>
                  </p>
                )}
              </div>

              {isLeader && (
                <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setTargetSlot(1);
                      setIsEditing(true);
                      setPsInput(ps1.id.replace('SIH26', ''));
                    }}
                    className="text-xs font-bold text-sih-blue hover:text-sih-dark flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Change PS
                  </button>
                  <button
                    onClick={() => handleRemove(1)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PS 2 (Secondary if selected) */}
          {ps2 && (
            <div className="border-2 border-gray-200 p-5 bg-sih-gray/40 flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-200">
                    Secondary Problem Statement (PS 2)
                  </span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase bg-gray-100 px-2 py-0.5 border border-gray-200">
                    {ps2.category || 'Software'}
                  </span>
                </div>
                <p className="font-mono font-bold text-sih-dark text-base pt-1">
                  {ps2.id}
                </p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {ps2.title}
                </p>
              </div>

              {isLeader && (
                <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setTargetSlot(2);
                      setIsEditing(true);
                      setPsInput(ps2.id.replace('SIH26', ''));
                    }}
                    className="text-xs font-bold text-sih-blue hover:text-sih-dark flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Change PS
                  </button>
                  <button
                    onClick={() => handleRemove(2)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Option to add secondary PS if only 1 is chosen */}
          {ps1 && !ps2 && isLeader && (
            <button
              onClick={() => {
                setTargetSlot(2);
                setIsEditing(true);
                setPsInput('');
              }}
              className="w-full border-2 border-dashed border-gray-200 p-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-sih-blue hover:border-sih-blue hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Optional Secondary Problem Statement (PS 2)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
