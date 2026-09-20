'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

type Tab = 'internal-hackathon' | 'all-about-sih' | 'team' | 'announcements' | 'profile';

interface DashboardShellProps {
  internalHackathonContent: React.ReactNode;
  allAboutSIHContent: React.ReactNode;
  teamContent: React.ReactNode;
  announcementsContent: React.ReactNode;
  profileContent?: React.ReactNode;
  teamBanner?: React.ReactNode;
  initialTab?: string;
  adminShortcut?: boolean;
}

export default function DashboardShell({
  internalHackathonContent,
  allAboutSIHContent,
  teamContent,
  announcementsContent,
  profileContent,
  teamBanner,
  initialTab = 'internal-hackathon',
  adminShortcut = false,
}: DashboardShellProps) {
  const valid: Tab[] = ['internal-hackathon', 'all-about-sih', 'team', 'announcements', 'profile'];
  
  // Backward compatibility mapping for old links:
  let effectiveTab: Tab = 'internal-hackathon';
  if (initialTab === 'guidelines' || initialTab === 'all-about-sih') {
    effectiveTab = 'all-about-sih';
  } else if (initialTab === 'roadmap' || initialTab === 'internal-hackathon') {
    effectiveTab = 'internal-hackathon';
  } else if (initialTab === 'profile') {
    effectiveTab = 'profile';
  } else if (valid.includes(initialTab as Tab)) {
    effectiveTab = initialTab as Tab;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Admin shortcut banner — always visible for super admins */}
      {adminShortcut && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-4 mb-6 px-5 py-3 bg-sih-dark border-2 border-sih-orange/40 hover:border-sih-orange transition-all duration-150 hover:bg-[#1a1a1a] active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-sih-orange flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-sih-orange uppercase tracking-widest">Super Admin</p>
              <p className="text-sm font-bold text-white">Open Admin Panel</p>
            </div>
          </div>
          <span className="text-sih-orange font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-150">
            Manage &rarr;
          </span>
        </Link>
      )}

      {/* Persistent team status banner */}
      {teamBanner && <div className="mb-6">{teamBanner}</div>}

      {/* Tab Panels — all rendered, hidden via CSS to avoid remounting */}
      <div className={effectiveTab === 'internal-hackathon' ? 'block animate-in fade-in duration-150' : 'hidden'} role="tabpanel">
        {internalHackathonContent}
      </div>
      <div className={effectiveTab === 'all-about-sih' ? 'block animate-in fade-in duration-150' : 'hidden'} role="tabpanel">
        {allAboutSIHContent}
      </div>
      <div className={effectiveTab === 'team' ? 'block animate-in fade-in duration-150' : 'hidden'} role="tabpanel">
        {teamContent}
      </div>
      <div className={effectiveTab === 'announcements' ? 'block animate-in fade-in duration-150' : 'hidden'} role="tabpanel">
        {announcementsContent}
      </div>
      {profileContent && (
        <div className={effectiveTab === 'profile' ? 'block animate-in fade-in duration-150' : 'hidden'} role="tabpanel">
          {profileContent}
        </div>
      )}
    </div>
  );
}