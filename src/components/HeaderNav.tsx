'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Layers, Globe, Users, Bell, FileText, ShieldAlert, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

function HeaderNavInner({ isSuperAdmin, hasUnreadAnnouncements }: { isSuperAdmin: boolean, hasUnreadAnnouncements?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const rawTab = searchParams.get('tab');
  
  // Backward compatibility mapping:
  let activeTab = 'internal-hackathon';
  if (rawTab === 'all-about-sih' || rawTab === 'guidelines') {
    activeTab = 'all-about-sih';
  } else if (rawTab === 'internal-hackathon' || rawTab === 'roadmap') {
    activeTab = 'internal-hackathon';
  } else if (rawTab) {
    activeTab = rawTab;
  }

  const TABS = [
    { id: 'internal-hackathon', label: 'Internal Hackathon', icon: Layers, href: '/dashboard?tab=internal-hackathon', pathMatch: '/dashboard', tabMatch: 'internal-hackathon' },
    { id: 'all-about-sih', label: 'All About SIH', icon: Globe, href: '/dashboard?tab=all-about-sih', pathMatch: '/dashboard', tabMatch: 'all-about-sih' },
    { id: 'team', label: 'Team', icon: Users, href: '/dashboard?tab=team', pathMatch: '/dashboard', tabMatch: 'team' },
    { id: 'ps-explorer', label: 'PS Explorer', icon: FileText, href: '/problem-statements', pathMatch: '/problem-statements' },
    { id: 'announcements', label: 'Announcements', icon: Bell, href: '/dashboard?tab=announcements', pathMatch: '/dashboard', tabMatch: 'announcements', hasBadge: hasUnreadAnnouncements },
    { id: 'profile', label: 'Manage Profile', icon: UserCog, href: '/dashboard?tab=profile', pathMatch: '/dashboard', tabMatch: 'profile' },
    ...(isSuperAdmin ? [{ id: 'admin-panel', label: 'Admin Panel', icon: ShieldAlert, href: '/admin', pathMatch: '/admin' }] : []),
  ];

  return (
    <nav className="flex items-center gap-1.5 px-3 py-1 md:py-0 md:px-0 mx-2 md:mx-6 overflow-x-auto no-scrollbar mask-edges min-w-0 max-w-full">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        let isActive = false;
        if (tab.tabMatch) {
          isActive = pathname === tab.pathMatch && activeTab === tab.tabMatch;
        } else {
          isActive = pathname.startsWith(tab.pathMatch);
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            rel={tab.href.startsWith('/dashboard') || tab.href.startsWith('/admin') ? 'nofollow' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-150 active:scale-[0.97] min-h-[40px] md:min-h-0 whitespace-nowrap flex-shrink-0 cursor-pointer',
              isActive
                ? 'bg-sih-gray text-sih-blue shadow-xs font-bold'
                : 'text-gray-500 hover:text-sih-dark hover:bg-gray-50'
            )}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                className={cn('w-4 h-4 flex-shrink-0', tab.id === 'admin-panel' ? 'text-sih-orange' : (isActive ? 'text-sih-blue' : 'text-gray-400'))}
              />
              {tab.hasBadge && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className={tab.id === 'admin-panel' ? 'text-sih-orange' : ''}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function HeaderNav({ isSuperAdmin, hasUnreadAnnouncements }: { isSuperAdmin: boolean, hasUnreadAnnouncements?: boolean }) {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
      <HeaderNavInner isSuperAdmin={isSuperAdmin} hasUnreadAnnouncements={hasUnreadAnnouncements} />
    </Suspense>
  );
}