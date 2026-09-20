'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/lib/actions/onboarding-actions';
import { BRANCHES, YEARS, COUNTRY_CODES, isRollNumberRequired } from '@/lib/constants';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedYear, setSelectedYear] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get('full_name') as string,
      roll_number: formData.get('roll_number') as string,
      branch: formData.get('branch') as string,
      year: formData.get('year') as string,
      phone_country_code: formData.get('phone_country_code') as string,
      phone_number: formData.get('phone_number') as string,
      gender: formData.get('gender') as string,
    };

    if (!data.full_name.trim()) return toast.error('Full name is required');
    if (!data.branch) return toast.error('Please select your branch');
    if (!data.year) return toast.error('Please select your year');

    // Dynamic Roll Number Validation Logic
    if (isRollNumberRequired(data.year) && (!data.roll_number || !data.roll_number.trim())) {
      return toast.error('Roll Number is mandatory for your selected course and year');
    }

    if (!data.phone_number.trim() || data.phone_number.trim().length < 7) return toast.error('Valid phone number required');
    if (!data.gender) return toast.error('Gender is required for SIH team diversity rules');

    const toastId = toast.loading('Processing...'); startTransition(async () => {
      try {
        const res = await completeOnboarding(data);
        if (res.error) {
          toast.error(res.error, { id: toastId });
        } else {
          toast.success('Profile completed! Redirecting...', { id: toastId });
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong', { id: toastId });
      }
    });
  };

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const userName = user?.fullName ?? '';

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0a47de]" /></div>;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-5/12 bg-sih-dark flex flex-col justify-center px-8 py-12 lg:px-16 relative overflow-hidden">
        <div className="text-sih-orange font-bold text-[10px] uppercase tracking-widest mb-4">
          Step 1 of 1
        </div>
        <h1 className="heading-display text-[clamp(2.5rem,6vw,4.5rem)] text-white">
          COMPLETE <br />
          YOUR <br />
          PROFILE
        </h1>
        <p className="mt-8 text-white/60 text-base max-w-sm leading-relaxed">
          We need a few details to register you for the SIH 2026 Internal Hackathon.
          This is a one-time setup.
        </p>

        <div className="mt-10 space-y-4">
          <div className="flex items-start gap-3 text-white/40 text-sm">
            <span className="text-sih-orange font-bold">01</span>
            <span>Your email is locked from your Google account.</span>
          </div>
          <div className="flex items-start gap-3 text-white/40 text-sm">
            <span className="text-sih-orange font-bold">02</span>
            <span>Gender is required for SIH team diversity rules.</span>
          </div>
          <div className="flex items-start gap-3 text-white/40 text-sm">
            <span className="text-sih-orange font-bold">03</span>
            <span>Roll number is mandatory for 2nd-4th year & M.Tech (1st year, Testing, and Coordinator can skip).</span>
          </div>
        </div>

        <div className="absolute bottom-[-8%] right-[-8%] text-[12vw] font-display text-white/5 select-none pointer-events-none tracking-tighter whitespace-nowrap hidden lg:block">
          OUCE
        </div>
      </div>

      <div className="lg:w-7/12 flex items-center justify-center px-6 py-12 lg:px-16 bg-white">
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
              Full Name *
            </label>
            <input name="full_name" type="text" defaultValue={userName} required className="input-base" placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
              Email <span className="text-sih-dark/40 normal-case">— read-only</span>
            </label>
            <input type="email" value={userEmail} disabled className="input-base bg-sih-gray text-sih-dark/50 cursor-not-allowed border-sih-gray" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">Branch / Dept *</label>
              <select name="branch" required className="input-base">
                <option value="">Select Branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">Year / Role *</label>
              <select
                name="year"
                required
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-base"
              >
                <option value="">Select Year / Role</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
              Roll Number{' '}
              {selectedYear && !isRollNumberRequired(selectedYear) ? (
                <span className="text-gray-400 normal-case font-normal">(Optional for {selectedYear})</span>
              ) : selectedYear ? (
                <span className="text-sih-orange normal-case font-bold">* (Mandatory for {selectedYear})</span>
              ) : (
                <span className="text-sih-dark/40 normal-case font-normal">(Optional for 1st Year, Testing, & Coordinator)</span>
              )}
            </label>
            <input
              name="roll_number"
              type="text"
              className="input-base"
              placeholder={selectedYear && isRollNumberRequired(selectedYear) ? "e.g. 21001-CS-001 (Mandatory)" : "e.g. 21001-CS-001 (Optional)"}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
              Phone / WhatsApp Number *
            </label>
            <div className="flex gap-2">
              <select name="phone_country_code" defaultValue="+91" className="input-base w-28 shrink-0">
                {COUNTRY_CODES.map((cc) => <option key={cc.code} value={cc.code}>{cc.label}</option>)}
              </select>
              <input name="phone_number" type="tel" required className="input-base flex-1" placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
              Gender * <span className="text-sih-dark/40 normal-case font-normal">— required for SIH diversity rule</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label key={g} className="flex-1 flex items-center justify-center gap-2 border-2 border-sih-gray px-4 py-3 sm:py-3 cursor-pointer hover:border-[#0a47de] transition-[border-color,background-color] duration-150 ease-out has-[:checked]:border-[#0a47de] has-[:checked]:bg-[#0a47de]/5">
                  <input type="radio" name="gender" value={g} required className="sr-only" />
                  <span className="font-bold text-sm capitalize text-sih-dark">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full py-4 text-base">
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {isPending ? 'Saving Profile...' : 'Complete Registration'} 
            {!isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
