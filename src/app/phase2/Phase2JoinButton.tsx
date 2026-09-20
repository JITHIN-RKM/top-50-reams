'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Rocket, Target, CheckCircle2, AlertTriangle, ExternalLink, Edit2, X } from 'lucide-react';
import { registerForPhase2 } from '@/lib/actions/phase2-actions';
import psQuickList from '@/data/ps-quick-list.json';
import Link from 'next/link';

interface PSItem {
  id: string;
  title: string;
  category?: string;
  theme?: string;
}

export function Phase2JoinButton({
  teamId,
  teamName,
  initialPs1Id,
  initialPs2Id,
}: {
  teamId: string;
  teamName: string;
  initialPs1Id?: string | null;
  initialPs2Id?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active PS state
  const existingPsId = initialPs1Id || initialPs2Id || null;
  const [chosenPsId, setChosenPsId] = useState<string | null>(existingPsId);
  const [isChangingPs, setIsChangingPs] = useState(!existingPsId);
  const [psInput, setPsInput] = useState(existingPsId ? existingPsId.replace('SIH26', '') : '');

  // Look up preview for current input
  const previewPs: PSItem | undefined =
    psInput.length === 3
      ? (psQuickList as PSItem[]).find((p) => p.id === `SIH26${psInput}`)
      : undefined;

  // Resolved active PS (either newly selected or existing)
  const currentPs: PSItem | undefined = chosenPsId
    ? (psQuickList as PSItem[]).find((p) => p.id === chosenPsId)
    : undefined;

  const handleRegister = (psToSubmit?: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await registerForPhase2(teamId, psToSubmit || undefined);
      if (res.success) {
        toast.success('Successfully registered for Phase 2!');
        window.location.href = '/phase2/dashboard';
      } else {
        const err = res.error || 'Failed to register';
        toast.error(err);
        setErrorMessage(err);
        setShowConfirm(false);
      }
    });
  };

  const handleConfirmWithNewPs = () => {
    if (!previewPs) {
      toast.error('Please enter a valid 3-digit Problem Statement ID');
      return;
    }
    setChosenPsId(previewPs.id);
    handleRegister(previewPs.id);
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-300 p-4 text-sm text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Registration Alert</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* CASE 1: Team has NO Problem Statement yet (or is actively picking one) */}
      {!chosenPsId || isChangingPs ? (
        <div className="bg-white border-2 border-sih-blue/30 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sih-blue flex items-center justify-center text-white flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                  {existingPsId ? 'Change Problem Statement' : 'Step 1 of 2: Select Problem Statement'}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-0.5">
                  {existingPsId ? 'Update Target Problem Statement' : 'Choose Your Problem Statement to Register'}
                </h3>
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

          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            Under official SIH rules, your team must declare its Problem Statement before Phase 2 evaluation. Enter the 3-digit problem statement number below (e.g. type <strong className="text-sih-blue">042</strong> for SIH26042).
          </p>

          <div className="space-y-3">
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
                onClick={handleConfirmWithNewPs}
                disabled={isPending || psInput.length !== 3 || !previewPs}
                className="btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                <span>Save PS & Join Phase 2</span>
              </button>

              {existingPsId && (
                <button
                  onClick={() => {
                    setIsChangingPs(false);
                    setPsInput(existingPsId.replace('SIH26', ''));
                  }}
                  disabled={isPending}
                  className="text-xs font-bold text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 bg-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Live Preview Card */}
            {previewPs && (
              <div className="bg-emerald-50/50 border-2 border-emerald-400 p-4 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono font-bold text-emerald-900 text-sm">{previewPs.id}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {previewPs.category || 'Software'}
                  </span>
                  {previewPs.theme && (
                    <span className="text-[10px] font-medium text-gray-600 truncate max-w-xs">
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
                No problem statement found for SIH26{psInput}. Please check the number in the PS Explorer.
              </p>
            )}
          </div>
        </div>
      ) : !showConfirm ? (
        /* CASE 2: Team already has a Problem Statement attached */
        <div className="bg-white border-2 border-sih-blue/20 hover:border-sih-blue/40 p-6 md:p-8 transition-colors space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                  Registration Open
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Register <span className="text-sih-blue">{teamName}</span> for Phase 2
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                As the team leader, you can register your finalized squad for Phase 2 pitching on 16 Sep 2026.
              </p>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="btn-primary text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 cursor-pointer py-2.5 px-6 active:scale-[0.97]"
            >
              <Rocket className="w-4 h-4" />
              Join Phase 2
            </button>
          </div>

          {/* Display attached PS card */}
          {currentPs && (
            <div className="border-2 border-gray-100 bg-sih-gray/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                    Selected Problem Statement
                  </span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase bg-gray-100 px-2 py-0.5 border border-gray-200">
                    {currentPs.category || 'Software'}
                  </span>
                </div>
                <p className="font-mono font-bold text-sih-dark text-sm">
                  {currentPs.id}
                </p>
                <p className="text-xs sm:text-sm text-gray-800 font-medium line-clamp-1">
                  {currentPs.title}
                </p>
              </div>

              <button
                onClick={() => setIsChangingPs(true)}
                className="text-xs font-bold text-sih-blue hover:text-sih-dark flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer flex-shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                Change PS
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Confirm Phase 2 Registration Banner */
        <div className="bg-blue-50 border-2 border-sih-blue p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sih-dark text-base">Confirm Phase 2 Registration</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              You are about to register <strong>{teamName}</strong> for Phase 2 pitching on 16 September 2026.
              {currentPs && (
                <> Pitching under Problem Statement <strong>{currentPs.id}: {currentPs.title}</strong>.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRegister()}
              disabled={isPending}
              className="btn-primary text-xs sm:text-sm flex items-center gap-2 py-2.5 px-5 cursor-pointer active:scale-[0.97]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {isPending ? 'Registering...' : 'Confirm & Register'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 text-xs sm:text-sm font-bold hover:bg-gray-100 transition-colors cursor-pointer active:scale-[0.97]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
