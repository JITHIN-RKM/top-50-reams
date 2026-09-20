'use client';

import { useState, useTransition } from 'react';
import { Lightbulb, Activity, CheckCircle2, Check, Loader2 } from 'lucide-react';
import { saveProblemStatement } from '@/lib/actions/team-actions';
import { toast } from 'sonner';

export default function ClientTabs({ ps, team, clerkId }: { ps: any, team: any, clerkId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const [isPending, startTransition] = useTransition();



  return (
    <>
      <div className="flex gap-1 border-b-2 border-gray-100 mb-8">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-1/2 sm:w-auto px-2 sm:px-6 py-3 font-bold text-sm tracking-widest uppercase border-b-2 transition-[colors,transform] duration-150 active:scale-[0.97] text-center ${activeTab === 'overview' ? 'border-sih-blue text-sih-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          OVERVIEW
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`w-1/2 sm:w-auto px-2 sm:px-6 py-3 font-bold text-sm tracking-widest uppercase border-b-2 transition-[colors,transform] duration-150 active:scale-[0.97] text-center ${activeTab === 'analysis' ? 'border-sih-blue text-sih-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          ANALYSIS
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Background</h3>
            <p className="text-gray-700 leading-relaxed font-body">{ps.level1.background}</p>
          </section>
          
          <section>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">The Ask</h3>
            <p className="text-gray-900 leading-relaxed font-bold text-lg font-body">{ps.level1.the_ask}</p>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Real Struggle</h3>
            <p className="text-gray-700 leading-relaxed font-body">{ps.level1.real_struggle}</p>
          </section>

          <section className="bg-sih-gray p-6 border-2 border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Expected Solution</h3>
            <p className="text-gray-900 font-bold leading-relaxed mb-4">{ps.level1.expected_solution}</p>
            <ul className="space-y-3">
              {ps.level1.key_points.map((pt: string, i: number) => (
                <li key={i} className="flex gap-3 text-gray-700 font-body">
                  <CheckCircle2 className="w-5 h-5 text-sih-blue shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-2 border-blue-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white text-sih-blue flex items-center justify-center border-2 border-blue-200">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Innovation Scope</h3>
                </div>
                <p className="text-sm text-gray-600 font-body">Higher scores indicate more room for novel, non-checklist approaches.</p>
              </div>
              <div className="flex items-end gap-2 mt-8">
                <span className="font-display text-5xl text-sih-blue leading-none">{ps.level2?.innovation_scope}</span>
                <span className="text-lg font-bold text-blue-300 mb-1">/ 5</span>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white text-sih-orange flex items-center justify-center border-2 border-orange-200">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Invention Effort</h3>
                </div>
                <p className="text-sm text-gray-600 font-body">Higher scores indicate a heavier technical lift to reach a working prototype.</p>
              </div>
              <div className="flex items-end gap-2 mt-8">
                <span className="font-display text-5xl text-sih-orange leading-none">{ps.level2?.invention_effort}</span>
                <span className="text-lg font-bold text-orange-300 mb-1">/ 5</span>
              </div>
            </div>
          </div>

          {ps.analysis && (
            <div className="space-y-8 mt-12 pt-8 border-t-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-sih-dark text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">AI Strategic Analysis</span>
                <span className="text-sm font-bold text-gray-400">Hormozi &times; Naval &times; Rubin</span>
              </div>
              
              <section>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Innovation & Novelty</h3>
                <p className="text-gray-700 leading-relaxed font-body">{ps.analysis.novelty_and_scope}</p>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Technical Feasibility</h3>
                <p className="text-gray-700 leading-relaxed font-body">{ps.analysis.engineering_complexity}</p>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Impact & Scalability</h3>
                <p className="text-gray-700 leading-relaxed font-body">{ps.analysis.competitive_analysis}</p>
              </section>
            </div>
          )}
        </div>
      )}

      {/* Lock in Action / Status */}
      {team && (team.ps1_id === ps.id || team.ps2_id === ps.id) ? (
        <div className="mt-8 pt-8 border-t-2 border-gray-100 space-y-3">
          <div className="w-full py-4 bg-green-50 text-green-700 border-2 border-green-200 font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
            <Check className="w-5 h-5" /> Team has selected this Problem Statement (PS {team.ps1_id === ps.id ? '1' : '2'})
          </div>
          {team.leader_id === clerkId && (
            <p className="text-xs text-gray-500 text-center font-medium">
              You can manage or change this selection from your <a href="/dashboard?tab=team" className="text-sih-blue underline font-bold">Team Tab</a> or the <a href="/phase2/dashboard" className="text-sih-blue underline font-bold">Phase 2 Dashboard</a>.
            </p>
          )}
        </div>
      ) : team && team.leader_id === clerkId ? (
        <div className="mt-8 pt-8 border-t-2 border-gray-100 space-y-3">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center">Select for Your Team</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              disabled={isPending}
              onClick={() => {
                const toastId = toast.loading('Processing...'); startTransition(async () => {
                  const res = await saveProblemStatement(team.id, ps.id, 1);
                  if (res.success) toast.success('Saved as Primary Problem Statement (PS 1)', { id: toastId });
                  else toast.error(res.error || 'Failed to save.', { id: toastId });
                });
              }}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Save as PS 1 (Primary)
            </button>
            <button 
              disabled={isPending}
              onClick={() => {
                const toastId = toast.loading('Processing...'); startTransition(async () => {
                  const res = await saveProblemStatement(team.id, ps.id, 2);
                  if (res.success) toast.success('Saved as Secondary Problem Statement (PS 2)', { id: toastId });
                  else toast.error(res.error || 'Failed to save.', { id: toastId });
                });
              }}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Save as PS 2 (Secondary)
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
