'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  GraduationCap,
  Phone,
  Mail,
  Hash,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { BRANCHES, YEARS, COUNTRY_CODES, isRollNumberRequired, formatYear } from '@/lib/constants';

interface ProfileTabProps {
  initialUser: {
    id: string;
    full_name: string;
    email: string;
    roll_number?: string | null;
    branch: string;
    year: string;
    phone_country_code?: string;
    phone_number: string;
    gender: string;
    role?: string;
    team_id?: string | null;
  } | null;
}

export default function ProfileTab({ initialUser }: ProfileTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [user, setUser] = useState(initialUser);
  const [fullName, setFullName] = useState(initialUser?.full_name || '');
  const [rollNumber, setRollNumber] = useState(initialUser?.roll_number || '');
  const [branch, setBranch] = useState(initialUser?.branch || '');
  const [year, setYear] = useState(initialUser?.year || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialUser?.phone_country_code || '+91');
  const [phoneNumber, setPhoneNumber] = useState(initialUser?.phone_number || '');
  const [gender, setGender] = useState(initialUser?.gender || 'male');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback: fetch from API if initialUser is missing
  useEffect(() => {
    if (!initialUser) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setFullName(data.user.full_name || '');
            setRollNumber(data.user.roll_number || '');
            setBranch(data.user.branch || '');
            setYear(data.user.year || '');
            setPhoneCountryCode(data.user.phone_country_code || '+91');
            setPhoneNumber(data.user.phone_number || '');
            setGender(data.user.gender || 'male');
          }
        })
        .catch((err) => console.error('Error fetching user profile:', err));
    }
  }, [initialUser]);

  const requiresRollNo = isRollNumberRequired(year);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return toast.error('Full name is required');
    }
    if (!branch) {
      setErrorMessage('Please select your branch / department.');
      return toast.error('Please select your branch');
    }
    if (!year) {
      setErrorMessage('Please select your year / role.');
      return toast.error('Please select your year / role');
    }

    if (requiresRollNo && (!rollNumber || !rollNumber.trim())) {
      const msg = `Roll number is mandatory for ${year}.`;
      setErrorMessage(msg);
      return toast.error(msg);
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
      return toast.error('Valid phone number required');
    }

    if (!gender) {
      setErrorMessage('Please select your gender.');
      return toast.error('Gender is required');
    }

    const toastId = toast.loading('Saving profile changes...');

    startTransition(async () => {
      try {
        const payload = {
          full_name: fullName.trim(),
          roll_number: rollNumber.trim() || null,
          branch,
          year,
          phone_country_code: phoneCountryCode,
          phone_number: phoneNumber.trim(),
          gender,
        };

        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toast.success('Profile updated successfully!', { id: toastId });
          setSaveSuccess(true);
          setUser(data.user);
          router.refresh();
        } else {
          const err = data.error || 'Failed to update profile';
          setErrorMessage(err);
          toast.error(err, { id: toastId });
        }
      } catch (err: any) {
        const errStr = err.message || 'Something went wrong';
        setErrorMessage(errStr);
        toast.error(errStr, { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border-2 border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 border border-blue-200 px-2 py-0.5">
                Manage Profile
              </span>
              {user?.role === 'super_admin' && (
                <span className="text-[10px] font-bold text-sih-orange uppercase tracking-widest bg-orange-50 border border-orange-200 px-2 py-0.5">
                  Super Admin
                </span>
              )}
            </div>
            <h1 className="heading-display text-2xl sm:text-3xl text-sih-dark">
              YOUR SIH PROFILE
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
              Update your department, year of study, roll number, or contact details.
              Freshers and coordinators can add or update their roll numbers anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Identity Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-gray-100 p-6 shadow-xs">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-sih-blue flex items-center justify-center text-white font-display text-2xl flex-shrink-0 shadow-xs">
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">
                  {user?.full_name || 'Loading...'}
                </h2>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-sih-blue px-2 py-0.5 border border-blue-100">
                    {user?.branch || 'No Branch'}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 border border-gray-200">
                    {formatYear(user?.year) || 'No Year'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Attributes List */}
            <div className="py-4 space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-400" /> Roll Number
                </span>
                <span className="font-mono font-bold text-gray-900 text-right">
                  {user?.roll_number ? (
                    <span className="text-sih-blue bg-blue-50 px-2 py-0.5 border border-blue-100">
                      {user.roll_number}
                    </span>
                  ) : (
                    <span className="text-sih-orange bg-orange-50 px-2 py-0.5 border border-orange-200 text-[10px]">
                      Not Added (Optional)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> Department
                </span>
                <span className="font-bold text-gray-900">{user?.branch || '—'}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Year / Role
                </span>
                <span className="font-bold text-gray-900 text-right">{formatYear(user?.year) || '—'}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> Contact
                </span>
                <span className="font-mono font-bold text-gray-900">
                  {user?.phone_country_code || '+91'} {user?.phone_number || '—'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Gender
                </span>
                <span className="font-bold capitalize text-gray-900">{user?.gender || '—'}</span>
              </div>
            </div>

            {/* Note box */}
            <div className="mt-4 p-3.5 bg-gray-50 border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sih-orange" /> Fresher or Tester?
              </p>
              Freshers (1st Year B.Tech), Testing accounts, and Coordinators are not required to provide a roll number during initial signup. You can update it here whenever you like.
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-8">
          <div className="bg-white border-2 border-gray-100 p-6 sm:p-8 shadow-xs">
            <h2 className="heading-display text-xl text-sih-dark mb-1">
              EDIT DETAILS
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Make changes below and click &ldquo;Save Profile Changes&rdquo;. Updates apply immediately across your team roster and admin dashboard.
            </p>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 flex items-center gap-3 text-green-800 text-xs font-bold animate-in fade-in duration-150">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Your profile has been saved successfully!</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 flex items-center gap-3 text-red-800 text-xs font-bold animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-base text-sm"
                  placeholder="Your full name"
                />
              </div>

              {/* Email (Read-Only) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                  Email Address <span className="text-gray-400 normal-case font-normal">— locked to Google sign-in</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-base text-sm bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                />
              </div>

              {/* Branch & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                    Branch / Department *
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    className="input-base text-sm"
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                    Academic Year / Role *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="input-base text-sm"
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

              {/* Roll Number */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark">
                    Roll Number {requiresRollNo ? <span className="text-sih-orange">*</span> : ''}
                  </label>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      requiresRollNo ? 'text-sih-orange' : 'text-gray-400'
                    }`}
                  >
                    {requiresRollNo ? 'Mandatory for this year' : 'Optional (Can add later)'}
                  </span>
                </div>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="input-base text-sm"
                  placeholder={
                    requiresRollNo
                      ? 'e.g. 100525733001 (Mandatory)'
                      : 'e.g. 100525733001 (Optional for freshers & testers)'
                  }
                />
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                  {!requiresRollNo
                    ? '1st Year B.Tech freshers, Testing accounts, and Coordinators do not need a roll number. If you receive your roll number later, enter it here anytime.'
                    : 'Required for 2nd-4th Year B.Tech and M.Tech students.'}
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                  Phone / WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="input-base w-32 shrink-0 text-sm"
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
                    className="input-base flex-1 text-sm"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-2">
                  Gender * <span className="text-gray-400 normal-case font-normal">— required for SIH diversity criteria</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label
                      key={g}
                      className={`flex items-center justify-center gap-2 border-2 px-4 py-3 cursor-pointer transition-all duration-150 ${
                        gender === g
                          ? 'border-sih-blue bg-blue-50/50 text-sih-blue font-bold shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        name="profile_tab_gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="sr-only"
                      />
                      <span className="text-sm capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
