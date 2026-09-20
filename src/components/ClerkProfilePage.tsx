'use client';

import { useState, useEffect, useTransition } from 'react';
import { BRANCHES, YEARS, COUNTRY_CODES, isRollNumberRequired } from '@/lib/constants';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClerkProfilePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFullName(data.user.full_name || '');
          setEmail(data.user.email || '');
          setRollNumber(data.user.roll_number || '');
          setBranch(data.user.branch || '');
          setYear(data.user.year || '');
          setPhoneCountryCode(data.user.phone_country_code || '+91');
          setPhoneNumber(data.user.phone_number || '');
          setGender(data.user.gender || 'male');
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const requiresRollNo = isRollNumberRequired(year);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    if (!fullName.trim()) return toast.error('Full name is required');
    if (!branch) return toast.error('Please select branch');
    if (!year) return toast.error('Please select year / role');

    if (requiresRollNo && (!rollNumber || !rollNumber.trim())) {
      return toast.error(`Roll number is mandatory for ${year}`);
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      return toast.error('Valid phone number required');
    }

    const toastId = toast.loading('Saving college profile...');

    startTransition(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName.trim(),
            roll_number: rollNumber.trim() || null,
            branch,
            year,
            phone_country_code: phoneCountryCode,
            phone_number: phoneNumber.trim(),
            gender,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('College profile saved!', { id: toastId });
          setSaved(true);
          router.refresh();
        } else {
          toast.error(data.error || 'Failed to update profile', { id: toastId });
        }
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong', { id: toastId });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a47de]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">SIH College Profile</h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage your OUCE branch, year of study, roll number, and contact details.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Changes saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Email <span className="text-gray-400 font-normal">(Google Account)</span>
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Branch / Dept *
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
            >
              <option value="">Select Branch</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Year / Role *
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
            >
              <option value="">Select Year / Role</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Roll Number {requiresRollNo ? '*' : '(Optional)'}
            </label>
            <span className="text-[10px] text-gray-400">
              {requiresRollNo ? 'Mandatory' : 'Optional for 1st Year, Testing, & Coordinator'}
            </span>
          </div>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
            placeholder={requiresRollNo ? 'e.g. 100525733001' : 'Freshers can leave blank or add later'}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Phone / WhatsApp Number *
          </label>
          <div className="flex gap-2">
            <select
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
              className="w-24 px-2 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
            >
              {COUNTRY_CODES.map((cc) => (
                <option key={cc.code} value={cc.code}>
                  {cc.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-600"
              placeholder="9876543210"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Gender *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as const).map((g) => (
              <label
                key={g}
                className={`flex items-center justify-center p-2 border text-xs cursor-pointer capitalize ${
                  gender === g ? 'border-blue-600 bg-blue-50 font-bold text-blue-700' : 'border-gray-200 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="clerk_gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="sr-only"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 bg-[#0a47de] hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save College Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
