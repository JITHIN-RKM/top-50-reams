'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  createTeam,
  joinTeamByCode,
  leaveTeam,
  removeMember,
  toggleLookingForMembers,
  updateOpenSlotRequirement,
  finalizeTeam,
  unfinalizeTeam,
  respondToJoinRequest,
  requestToJoinTeam,
  updateTeamName,
} from '@/lib/actions/team-actions';
import {
  Users,
  UserPlus,
  LogOut,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Shield,
  X,
  Plus,
  Megaphone,
  MessageSquare,
  UserCog,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ProblemStatementCard } from '@/components/ProblemStatementCard';
import { formatYear } from '@/lib/constants';
import { ManageProfileModal } from '@/components/ManageProfileModal';

export default function TeamTab({ user, team, members, clerkId, openTeams, joinRequests, psTitles = {} }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditTeamNameOpen, setIsEditTeamNameOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamNameError, setTeamNameError] = useState('');

  // Open slot requirement state
  const [showRequirements, setShowRequirements] = useState(false);
  const [openTeamSearch, setOpenTeamSearch] = useState('');
  const [requirements, setRequirements] = useState<string[]>(() => {
    if (!team?.open_slot_requirement) return [''];
    try {
      const parsed = JSON.parse(team.open_slot_requirement);
      return Array.isArray(parsed) ? [...parsed, ''] : [''];
    } catch {
      return [team.open_slot_requirement || ''];
    }
  });

  // Student pitch state (for join request modal)
  const [joinTargetId, setJoinTargetId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState('');

  const refresh = () => router.refresh();

  const handleUpdateTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTeamName.trim();
    if (!trimmed) {
      setTeamNameError('Team name cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setTeamNameError('Team name must be at least 3 characters.');
      return;
    }
    if (trimmed === team?.name) {
      setIsEditTeamNameOpen(false);
      return;
    }
    setTeamNameError('');
    const toastId = toast.loading('Updating team name...');
    startTransition(async () => {
      const res = await updateTeamName(team.id, trimmed);
      if (res.success) {
        toast.success(`Team name updated to "${res.newName}"!`, { id: toastId });
        setIsEditTeamNameOpen(false);
        refresh();
      } else {
        toast.error(res.error || 'Failed to update team name.', { id: toastId });
        setTeamNameError(res.error || 'Failed to update team name.');
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await createTeam(teamName.trim());
      if (res.success) { toast.success('Team created! Share the invite code.', { id: toastId }); refresh(); }
      else toast.error(res.error || 'Failed to create team.', { id: toastId });
    });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.length !== 6) return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await joinTeamByCode(inviteCode);
      if (res.success) { toast.success('You joined the team!', { id: toastId }); refresh(); }
      else toast.error(res.error || 'Invalid invite code.', { id: toastId });
    });
  };

  const handleLeave = async () => {
    if (team?.status === 'finalized') return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await leaveTeam();
      if (res.success) { toast.success('You left the team.', { id: toastId }); refresh(); }
      else toast.error(res.error || 'Failed to leave team.', { id: toastId });
    });
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await removeMember(team.id, memberId);
      if (res.success) { toast.success(`${memberName} removed from team.`, { id: toastId }); refresh(); }
      else toast.error(res.error || 'Failed to remove member.', { id: toastId });
    });
  };

  const handleToggleLFM = async () => {
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await toggleLookingForMembers(team.id, team.status !== 'open_for_members');
      if (res.success) {
        toast.success(team.status === 'open_for_members' ? 'Removed from board.' : 'Listed on Open Slots board!', { id: toastId });
        refresh();
      } else toast.error(res.error || 'Failed.', { id: toastId });
    });
  };

  const handleSaveRequirements = async () => {
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await updateOpenSlotRequirement(team.id, requirements.filter(r => r.trim()));
      if (res.success) { toast.success('Requirements updated.', { id: toastId }); setShowRequirements(false); refresh(); }
      else toast.error(res.error || 'Failed to save requirements.', { id: toastId });
    });
  };

  const handleFinalize = async () => {
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await finalizeTeam(team.id);
      if (res.success) {
        toast.success('Team finalized successfully!', { id: toastId });
        refresh();
      } else toast.error(res.error || 'Failed to finalize.', { id: toastId });
    });
  };

  const handleUnfinalize = async () => {
    if (!confirm('Are you sure you want to un-finalize your team? This will allow you to make changes to your roster and slots again.')) return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await unfinalizeTeam(team.id);
      if (res.success) {
        toast.success('Team un-finalized.', { id: toastId });
        refresh();
      } else toast.error(res.error || 'Failed to un-finalize.', { id: toastId });
    });
  };

  const handleRespond = async (reqId: string, accept: boolean) => {
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await respondToJoinRequest(reqId, accept);
      if (res.success) { toast.success(accept ? 'Member accepted!' : 'Request declined.', { id: toastId }); refresh(); }
      else toast.error(res.error || 'Action failed.', { id: toastId });
    });
  };

  const handleOpenJoinModal = (teamId: string) => {
    setJoinTargetId(teamId);
    setJoinMessage('');
  };

  const handleSubmitJoin = async () => {
    if (!joinTargetId) return;
    const toastId = toast.loading('Processing...'); startTransition(async () => {
      const res = await requestToJoinTeam(joinTargetId, joinMessage);
      if (res.success) {
        toast.success('Join request sent!', { id: toastId });
        setJoinTargetId(null);
      } else toast.error(res.error || 'Failed to send request.', { id: toastId });
    });
  };

  const sizeValid = members?.length === 6;
  const hasFemale = members?.some((m: any) => m.gender === 'female');
  const rulesValid = sizeValid && hasFemale;
  const isLeader = team?.leader_id === clerkId;
  const isFinalized = team?.status === 'finalized';

  // Parse requirements for display
  const parsedRequirements: string[] = (() => {
    if (!team?.open_slot_requirement) return [];
    try {
      const p = JSON.parse(team.open_slot_requirement);
      return Array.isArray(p) ? p.filter((r: string) => r.trim()) : [];
    } catch {
      return team.open_slot_requirement ? [team.open_slot_requirement] : [];
    }
  })();

  // ==============================
  // VIEW: User HAS a team
  // ==============================
  if (team) {
    return (
      <div className="space-y-6">

        {/* Team Header */}
        <div className="bg-white border-2 border-gray-100 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Team</p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="heading-display text-2xl text-sih-dark">{team.name}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setNewTeamName(team.name);
                    setTeamNameError('');
                    setIsEditTeamNameOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-sih-blue hover:bg-sih-darkBlue text-white px-3 py-1.5 transition-all active:scale-[0.97] cursor-pointer shadow-xs"
                  title="Change team name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Change Team Name</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Invite Code */}
              <div className="px-4 py-2 bg-sih-gray border-2 border-gray-200 text-sm font-mono tracking-widest text-gray-700 font-bold">
                {team.invite_code}
              </div>
              {/* Leave Team */}
              {!isFinalized && (
                <button
                  onClick={handleLeave}
                  disabled={isPending}
                  title="Leave Team"
                  className="p-2 text-gray-400 hover:text-red-600 transition-[color,transform] duration-150 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map((m: any) => (
              <div
                key={m.id}
                className="card-enter stagger-item flex items-center gap-4 p-4 border-2 border-gray-100 bg-sih-gray/50"
              >
                <div className="w-10 h-10 bg-sih-blue flex items-center justify-center text-white font-display text-lg flex-shrink-0">
                  {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{m.full_name}</p>
                    {m.id === clerkId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-sm">You</span>
                        <button
                          onClick={() => setIsEditProfileOpen(true)}
                          className="text-[10px] text-sih-blue hover:text-sih-darkBlue font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                          title="Edit your profile (Branch, Year, Roll No, Phone)"
                        >
                          <UserCog className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5 font-semibold">
                    {m.branch} &middot; {formatYear(m.year)}
                  </p>
                  {m.roll_number && (
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Roll:</span> {m.roll_number}
                    </p>
                  )}
                  {m.phone_number && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 font-mono">
                      <span>📞</span> {m.phone_country_code} {m.phone_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {m.id === team.leader_id && (
                    <span className="text-[10px] uppercase font-bold text-sih-blue bg-blue-50 border border-blue-200 px-2 py-1">
                      Leader
                    </span>
                  )}
                  {isLeader && !isFinalized && m.id !== clerkId && (
                    <button
                      onClick={() => handleRemoveMember(m.id, m.full_name)}
                      disabled={isPending}
                      title={`Remove ${m.full_name}`}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-[color,transform] duration-150 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - members.length) }).map((_, i) => (
              <div key={'e' + i} className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200">
                <div className="w-10 h-10 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-lg">
                  {/* removed + icon to keep UI clean */}
                </div>
                <p className="text-sm text-gray-400">Open slot</p>
              </div>
            ))}
          </div>

          {/* Member count callout */}
          <p className="text-xs text-gray-400 mt-4 font-medium">
            {members.length}/6 members &middot; SIH requires exactly 6
          </p>
        </div>

        {/* SIH Compliance Widget */}
        <div className="bg-white border-2 border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">SIH Compliance</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {sizeValid
                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              <span className="font-medium text-sm text-gray-700">
                Team size: {members.length}/6{' '}
                <span className="text-gray-400">(exactly 6 required)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {hasFemale
                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              <span className="font-medium text-sm text-gray-700">
                Gender diversity{' '}
                <span className="text-gray-400">(at least 1 female required)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(team.ps1_id || team.ps2_id)
                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-amber-500 flex-shrink-0">ℹ️</span>}
              <span className="font-medium text-sm text-gray-700">
                Problem Statement:{' '}
                {(team.ps1_id || team.ps2_id) ? (
                  <span className="text-green-700 font-bold">Selected</span>
                ) : (
                  <span className="text-amber-700">Can be selected or changed anytime</span>
                )}
              </span>
            </div>
          </div>

          {rulesValid && !isFinalized && isLeader && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100 flex items-start justify-between gap-6">
              <div>
                <p className="font-bold text-green-800">Team squad ready!</p>
                <p className="text-sm text-green-700 mt-0.5">Finalize your squad roster. You can select or change your Problem Statement anytime.</p>
              </div>
              <button onClick={handleFinalize} disabled={isPending} className="btn-primary shrink-0 text-sm">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Finalize Squad
              </button>
            </div>
          )}

          {isFinalized && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="font-bold text-green-800">Team finalized. Good luck!</p>
              </div>
              {isLeader && (
                <button
                  onClick={handleUnfinalize}
                  disabled={isPending}
                  className="px-3 py-1.5 border-2 border-gray-200 text-gray-600 text-xs font-bold transition-[transform,background-color] duration-150 hover:bg-gray-50 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                >
                  Un-finalize Team
                </button>
              )}
            </div>
          )}
        </div>

        {/* Problem Statement Card */}
        <ProblemStatementCard team={team} isLeader={isLeader} isFinalized={isFinalized} psTitles={psTitles} />



        {/* Open Slot Board (leader controls) */}
        {isLeader && !isFinalized && (
          <div className="bg-white border-2 border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-bold text-gray-900">Open Slots Board</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {team.status === 'open_for_members'
                    ? 'Your team is listed publicly. Students can request to join.'
                    : 'List your team to attract more members.'}
                </p>
              </div>
              <button
                onClick={handleToggleLFM}
                disabled={isPending}
                className={cn(
                  'px-4 py-2 text-sm font-bold border-2 transition-[transform,background-color,border-color] duration-150 active:scale-[0.97] disabled:opacity-50 flex items-center gap-2 cursor-pointer',
                  team.status === 'open_for_members'
                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                    : 'border-sih-blue bg-sih-blue text-white hover:bg-sih-darkBlue'
                )}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <Megaphone className="w-4 h-4" />
                {team.status === 'open_for_members' ? 'Unlist Team' : 'List Team'}
              </button>
            </div>

            {/* What are you looking for? */}
            {team.status === 'open_for_members' && (
              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                {!showRequirements ? (
                  <div>
                    {parsedRequirements.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {parsedRequirements.map((req: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sih-orange font-bold text-sm mt-0.5">?</span>
                            <p className="text-sm text-gray-700">{req}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3">No requirements added yet.</p>
                    )}
                    <button
                      onClick={() => {
                        setRequirements(parsedRequirements.length > 0 ? [...parsedRequirements, ''] : ['']);
                        setShowRequirements(true);
                      }}
                      className="text-sm text-sih-blue font-semibold hover:underline cursor-pointer"
                    >
                      {parsedRequirements.length > 0 ? 'Edit requirements' : '+ Add what you\'re looking for'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      What are you looking for? (up to 3)
                    </p>
                    {requirements.map((req, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const updated = [...requirements];
                            updated[i] = e.target.value;
                            setRequirements(updated);
                          }}
                          placeholder={`e.g. "Need someone who can code in React"`}
                          className="input-base text-sm flex-1"
                          maxLength={120}
                        />
                        {requirements.length > 1 && (
                          <button
                            onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                            className="p-2 text-gray-400 hover:text-red-500 transition-[color,transform] duration-150 active:scale-[0.97] cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {requirements.length < 3 && (
                      <button
                        onClick={() => setRequirements([...requirements, ''])}
                        className="text-sm text-sih-blue font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add another requirement
                      </button>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveRequirements}
                        disabled={isPending}
                        className="btn-primary text-sm"
                      >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                      </button>
                      <button
                        onClick={() => setShowRequirements(false)}
                        className="px-4 py-2 text-sm font-bold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-[transform,background-color] duration-150 active:scale-[0.97] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Join Requests (leader only) */}
        {isLeader && joinRequests?.length > 0 && (
          <div className="bg-white border-2 border-gray-100 p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Pending Join Requests
              </span>
              <span className="bg-sih-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {joinRequests.length}
              </span>
            </div>

            <div className="space-y-4">
              {joinRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="border-2 border-sih-blue/30 bg-white p-4 sm:p-5 shadow-xs transition-all duration-150"
                >
                  {/* Requester Profile Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-sih-blue text-white font-display text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {req.users?.full_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {req.users?.full_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] uppercase font-bold bg-blue-50 text-sih-blue px-2 py-0.5 border border-blue-100">
                            {req.users?.branch}
                          </span>
                          <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-700 px-2 py-0.5 border border-gray-200">
                            {formatYear(req.users?.year)}
                          </span>
                          <span className="text-[10px] uppercase font-bold bg-purple-50 text-purple-700 px-2 py-0.5 border border-purple-100 capitalize">
                            {req.users?.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <button
                        disabled={isPending}
                        onClick={() => handleRespond(req.id, true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept Member
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => handleRespond(req.id, false)}
                        className="px-3.5 py-2 border-2 border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600 text-xs font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  {/* Pitch Message — Full width! */}
                  {req.message ? (
                    <div className="my-3 p-3.5 bg-sih-gray/70 border border-gray-200 w-full">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-sih-blue" />
                        Student Pitch / Message
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap break-words">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="my-2 text-xs text-gray-400 italic">No custom pitch message provided.</p>
                  )}

                  {/* Mobile Action Buttons — Full-width and touch-friendly */}
                  <div className="flex sm:hidden items-center gap-2 pt-2 mt-2 border-t border-gray-100">
                    <button
                      disabled={isPending}
                      onClick={() => handleRespond(req.id, true)}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Member
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleRespond(req.id, false)}
                      className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600 text-xs font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 min-h-[40px] cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manage Profile Modal (within team view) */}
        {user && (
          <ManageProfileModal
            user={user}
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
          />
        )}
      </div>
    );
  }

  // ==============================
  // VIEW: User has NO team
  // ==============================
  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Create / Join */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Create Team */}
        <div className="card-enter bg-white border-2 border-gray-100 p-8 flex flex-col">
          <div className="w-12 h-12 bg-sih-blue flex items-center justify-center text-white mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="heading-display text-2xl text-sih-dark mb-2">Create a Team</h2>
          <p className="text-gray-500 text-sm mb-8 flex-1 leading-relaxed">
            Start a new squad of 6. You become the team leader and can invite others via invite code.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Team Name</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="input-base"
                placeholder="e.g. CodeHunters"
              />
            </div>
            <button type="submit" disabled={isPending || !teamName.trim()} className="btn-primary w-full">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>

        {/* Join Team */}
        <div className="card-enter bg-white border-2 border-gray-100 p-8 flex flex-col" style={{ animationDelay: '50ms' }}>
          <div className="w-12 h-12 bg-sih-orange flex items-center justify-center text-white mb-6">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="heading-display text-2xl text-sih-dark mb-2">Join a Team</h2>
          <p className="text-gray-500 text-sm mb-8 flex-1 leading-relaxed">
            Have an invite code from your team leader? Enter it below to join the roster.
          </p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Invite Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="input-base font-mono tracking-[0.3em] uppercase text-center text-lg"
                placeholder="A1B2C3"
              />
            </div>
            <button type="submit" disabled={isPending || inviteCode.length !== 6} className="btn-accent w-full">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Joining...' : 'Join Team'}
            </button>
          </form>
        </div>
      </div>

      {/* Open Slots Board */}
      {openTeams?.length > 0 ? (
        <div className="card-enter bg-white border-2 border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b-2 border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-sih-blue flex items-center justify-center font-bold flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="heading-display text-xl sm:text-2xl text-sih-dark">Open Slots Board</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Teams actively looking for teammates to complete their 6-member squad
                </p>
              </div>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by team name..."
                value={openTeamSearch}
                onChange={(e) => setOpenTeamSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white text-sm outline-none transition-all duration-150 w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            {openTeams.filter((ot: any) => ot.name.toLowerCase().includes(openTeamSearch.toLowerCase())).map((ot: any) => {
              const reqs: string[] = (() => {
                if (!ot.open_slot_requirement) return [];
                try {
                  const p = JSON.parse(ot.open_slot_requirement);
                  return Array.isArray(p) ? p.filter((r: string) => r.trim()) : [];
                } catch {
                  return ot.open_slot_requirement ? [ot.open_slot_requirement] : [];
                }
              })();

              const openCount = 6 - (ot.users?.length || 0);

              return (
                <div key={ot.id} className="border-2 border-gray-100 hover:border-sih-blue/40 p-5 sm:p-6 bg-white transition-all duration-150 shadow-xs">
                  {/* Team Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg tracking-tight truncate">{ot.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-sih-orange border border-orange-200 px-2 py-0.5">
                          {openCount} Slot{openCount > 1 ? 's' : ''} Open
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {ot.users?.length || 0}/6 roster filled
                      </p>
                    </div>

                    <button
                      disabled={isPending}
                      onClick={() => handleOpenJoinModal(ot.id)}
                      className="px-5 py-2.5 bg-sih-blue hover:bg-sih-darkBlue text-white text-xs sm:text-sm font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 flex-shrink-0 cursor-pointer w-full sm:w-auto text-center"
                    >
                      Request to Join
                    </button>
                  </div>

                  {/* Looking For Requirements */}
                  {reqs.length > 0 && (
                    <div className="my-4 p-3.5 bg-sih-gray/70 border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Looking For:
                      </p>
                      <div className="space-y-1.5">
                        {reqs.map((req: string, i: number) => (
                          <div key={i} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-sih-orange font-bold flex-shrink-0 mt-0.5">&rarr;</span>
                            <span className="leading-relaxed">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Roster */}
                  {ot.users && ot.users.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        Current Roster ({ot.users.length}/6)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {ot.users.map((cm: any) => (
                          <div key={cm.id} className="flex items-center gap-2.5 bg-sih-gray/40 border border-gray-200 p-2.5 min-w-0">
                            <div className="w-7 h-7 bg-sih-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {cm.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-900 truncate">{cm.full_name}</span>
                                {cm.id === ot.leader_id && (
                                  <span className="text-[8px] uppercase bg-blue-50 text-sih-blue px-1 py-[1px] font-bold border border-blue-100 flex-shrink-0">Leader</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 truncate">
                                {cm.branch} &middot; {formatYear(cm.year)}
                              </p>
                              {cm.id === ot.leader_id && cm.phone_number && (
                                <p className="mt-1 text-[10px] font-mono text-gray-700 bg-white px-1.5 py-0.5 border border-gray-200 inline-block truncate max-w-full font-medium">
                                  {cm.phone_country_code || '+91'} {cm.phone_number}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {openTeams.filter((ot: any) => ot.name.toLowerCase().includes(openTeamSearch.toLowerCase())).length === 0 && (
              <div className="text-center py-10 text-gray-500 font-bold text-sm bg-sih-gray border border-gray-200">
                No teams matched your search &ldquo;{openTeamSearch}&rdquo;.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="card-enter bg-white border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center"
          style={{ animationDelay: '100ms' }}
        >
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-500 text-base">No Open Teams Right Now</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your own team above or check back later.</p>
        </div>
      )}

      {/* Student Pitch Modal */}
      {joinTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-gray-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="heading-display text-xl text-sih-dark">Request to Join Team</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Introduce yourself to the team leader and mention what skills you bring.
                </p>
              </div>
              <button
                onClick={() => setJoinTargetId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors active:scale-[0.97] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Your Pitch / Message (Optional)
              </label>
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="e.g. Hi! I'm from CSE 3rd year. Strong in Next.js, backend APIs, and UI design. Excited to contribute to your problem statement..."
                className="w-full border-2 border-gray-200 p-3.5 text-sm font-body text-sih-dark placeholder:text-gray-400 focus:border-sih-blue focus:outline-none resize-none transition-colors duration-150 min-h-[120px]"
                maxLength={400}
              />
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>The team leader will review your request.</span>
                <span>{joinMessage.length}/400</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setJoinTargetId(null)}
                className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all duration-150 active:scale-[0.97] cursor-pointer w-full sm:w-auto text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitJoin}
                disabled={isPending}
                className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Join Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Team Name Modal */}
      {isEditTeamNameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border-2 border-sih-dark p-6 sm:p-7 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start gap-4 mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-50 border border-blue-200 text-sih-blue flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Settings</p>
                  <h3 className="heading-display text-xl text-sih-dark">Change Team Name</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTeamNameOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeamName} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => {
                    setNewTeamName(e.target.value);
                    if (teamNameError) setTeamNameError('');
                  }}
                  maxLength={50}
                  placeholder="e.g. CodeSwitch, NeuroNest"
                  autoFocus
                  className="w-full border-2 border-gray-200 focus:border-sih-blue focus:bg-white bg-sih-gray px-3.5 py-2.5 text-sm font-bold text-sih-dark outline-none transition-colors"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Between 3 and 50 characters</span>
                  <span>{newTeamName.length}/50</span>
                </div>
              </div>

              {teamNameError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 p-2.5">
                  ⚠️ {teamNameError}
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
                  onClick={() => setIsEditTeamNameOpen(false)}
                  className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.97] cursor-pointer w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newTeamName.trim()}
                  className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Team Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Profile Modal */}
      {user && (
        <ManageProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}
    </div>
  );
}
