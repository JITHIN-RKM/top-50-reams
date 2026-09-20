'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BRANCHES, YEARS, COUNTRY_CODES, isRollNumberRequired } from '@/lib/constants';
import { updateUserProfile } from '@/lib/actions/user-actions';

interface ManageProfileModalProps {
  user: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageProfileModal({ user, isOpen, onClose, onSuccess }: ManageProfileModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [rollNumber, setRollNumber] = useState(user?.roll_number || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState(user?.phone_country_code || '+91');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [gender, setGender] = useState(user?.gender || '');

  const [currentUserData, setCurrentUserData] = useState(user);
  const [isLoadingUser, setIsLoadingUser] = useState(!user && isOpen);

  // Sync state whenever user prop changes or modal opens
  useEffect(() => {
    if (user) {
      setCurrentUserData(user);
      setFullName(user.full_name || '');
      setRollNumber(user.roll_number || '');
      setBranch(user.branch || '');
      setYear(user.year || '');
      setPhoneCountryCode(user.phone_country_code || '+91');
      setPhoneNumber(user.phone_number || '');
      setGender(user.gender || 'male');
    } else if (isOpen) {
      setIsLoadingUser(true);
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUserData(data.user);
            setFullName(data.user.full_name || '');
            setRollNumber(data.user.roll_number || '');
            setBranch(data.user.branch || '');
            setYear(data.user.year || '');
            setPhoneCountryCode(data.user.phone_country_code || '+91');
            setPhoneNumber(data.user.phone_number || '');
            setGender(data.user.gender || 'male');
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingUser(false));
    }
  }, [user, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const requiresRollNo = isRollNumberRequired(year);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return toast.error('Full name is required');
    if (!branch) return toast.error('Please select your branch');
    if (!year) return toast.error('Please select your year / role');

    if (requiresRollNo && (!rollNumber || !rollNumber.trim())) {
      return toast.error(`Roll number is mandatory for ${year}`);
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      return toast.error('Valid phone number required (at least 7 digits)');
    }

    if (!gender) return toast.error('Please select your gender');

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
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
        } else {
          toast.error(data.error || 'Failed to update profile', { id: toastId });
        }
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong', { id: toastId });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white border-2 border-gray-200 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b-2 border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5">
                Manage Profile
              </span>
              {currentUserData?.role === 'super_admin' && (
                <span className="text-[10px] font-bold text-sih-orange uppercase tracking-widest bg-orange-50 border border-orange-200 px-2 py-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <h2 className="heading-display text-xl sm:text-2xl text-sih-dark mt-1.5">
              Edit Your Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Change your branch, academic year, roll number, or contact details anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-[color,transform] duration-150 active:scale-[0.97] cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoadingUser ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sih-blue" />
            <p className="text-xs font-semibold text-gray-500">Loading your profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
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

          {/* Email (Read-only) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
              Email Address <span className="text-gray-400 normal-case font-normal">— linked with Google</span>
            </label>
            <input
              type="email"
              value={currentUserData?.email || user?.email || ''}
              disabled
              className="input-base text-sm bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Branch & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
                Branch / Dept *
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
              <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
                Year / Role *
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark">
                Roll Number {requiresRollNo ? <span className="text-sih-orange">*</span> : ''}
              </label>
              <span className={`text-[10px] font-semibold ${requiresRollNo ? 'text-sih-orange' : 'text-gray-400'}`}>
                {requiresRollNo ? 'Mandatory for selected year' : 'Optional (can be added later)'}
              </span>
            </div>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="input-base text-sm"
              placeholder={requiresRollNo ? 'e.g. 21001-CS-001 (Mandatory)' : 'e.g. 21001-CS-001 (Optional for freshers/testers)'}
            />
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              {!requiresRollNo
                ? 'Freshers & coordinators can skip or add their roll number here anytime once assigned.'
                : 'Please enter your college roll number as registered in OUCE records.'}
            </p>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
              Phone / WhatsApp Number *
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="input-base w-28 shrink-0 text-sm"
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-sih-dark mb-1.5">
              Gender * <span className="text-gray-400 normal-case font-normal">— required for team diversity</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-center gap-1.5 border-2 px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                    gender === g
                      ? 'border-sih-blue bg-blue-50/50 text-sih-blue font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender_edit"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="sr-only"
                  />
                  <span className="text-xs capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all active:scale-[0.97] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
