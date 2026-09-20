'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Rocket, AlertCircle, X, ArrowRight } from 'lucide-react';
import { registerForPhase1 } from '@/lib/actions/phase1-actions';
import Link from 'next/link';

export function Phase1JoinButton({
  teamId,
  teamName,
  isDeadlineClosed = false,
}: {
  teamId: string;
  teamName: string;
  isDeadlineClosed?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);

  const handleButtonClick = () => {
    if (isDeadlineClosed) {
      setShowClosedModal(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleJoin = () => {
    startTransition(async () => {
      const res = await registerForPhase1(teamId);
      if (res.success) {
        toast.success('Successfully registered for Phase 1!');
        router.push('/phase1/dashboard');
      } else {
        if (res.error?.includes('deadline is finished')) {
          setShowConfirm(false);
          setShowClosedModal(true);
        } else {
          toast.error(res.error || 'Failed to register');
        }
      }
    });
  };

  return (
    <>
      {/* Closed Deadline Pop-up Modal */}
      {showClosedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-gray-200 p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowClosedModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors active:scale-[0.97]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 bg-orange-50 border border-orange-200 text-sih-orange flex items-center justify-center font-bold flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="heading-display text-xl text-sih-dark">
                  Registration Closed
                </h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
                  Phase 1 Deadline Reached
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed bg-sih-gray/70 p-4 border border-gray-200">
              Sorry, registration deadline is finished. You can register for the second phase as well.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              <button
                onClick={() => setShowClosedModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 text-gray-600 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.97]"
              >
                Close
              </button>
              <Link
                href="/dashboard?tab=internal-hackathon"
                onClick={() => setShowClosedModal(false)}
                className="btn-primary flex-1 text-xs sm:text-sm py-2.5 flex items-center justify-center gap-1.5 active:scale-[0.97]"
              >
                View Phase 2 Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Join Card */}
      {!showConfirm ? (
        <div
          className={
            isDeadlineClosed
              ? 'bg-gray-50 border-2 border-gray-200 p-6 transition-colors'
              : 'bg-white border-2 border-sih-blue/20 hover:border-sih-blue/40 p-6 transition-colors'
          }
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={
                    isDeadlineClosed
                      ? 'text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-200 px-2 py-0.5'
                      : 'text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100'
                  }
                >
                  {isDeadlineClosed ? 'Registration Closed' : 'Registration Open'}
                </span>
              </div>
              <p className="font-bold text-gray-900 text-base">
                Register <span className="text-sih-blue">{teamName}</span> for Phase 1
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {isDeadlineClosed
                  ? 'The Phase 1 registration deadline has closed. Phase 2 registration will open soon.'
                  : 'As the team leader, you can register your finalized team for Phase 1 competitions.'}
              </p>
            </div>

            {/* Button stays Blue color in all cases */}
            <button
              onClick={handleButtonClick}
              className="btn-primary text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 cursor-pointer py-2.5 px-5 active:scale-[0.97]"
            >
              <Rocket className="w-4 h-4" />
              Join Phase 1
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-sih-blue p-6">
          <p className="font-bold text-sih-dark mb-1">Confirm Registration</p>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            You are about to register <strong>{teamName}</strong> for Phase 1. All team members will get access to the Phase 1 dashboard.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="btn-primary text-xs sm:text-sm flex items-center gap-2 py-2 px-4 cursor-pointer active:scale-[0.97]"
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
              className="px-4 py-2 border-2 border-gray-300 text-gray-600 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.97]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}