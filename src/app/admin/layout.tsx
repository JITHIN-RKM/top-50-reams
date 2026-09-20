import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HeaderNav from "@/components/HeaderNav";
import UserNav from "@/components/UserNav";

export const metadata: Metadata = {
  title: "Admin Panel | OUCE SIH 2026",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  let isSuperAdmin = false;
  let hasUnreadAnnouncements = false;
  let userData = null;

  if (userId) {
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from("users")
      .select("id, full_name, email, roll_number, branch, year, phone_country_code, phone_number, gender, role, last_read_announcements_at")
      .eq("id", userId)
      .single();
    
    userData = user;
    isSuperAdmin = user?.role === "super_admin";

    const { data: latestAnnouncement } = await supabase
      .from('announcements')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (latestAnnouncement) {
      if (!user?.last_read_announcements_at || new Date(latestAnnouncement.created_at) > new Date(user.last_read_announcements_at)) {
        hasUnreadAnnouncements = true;
      }
    }
  }

  return (
    <div className="min-h-screen bg-sih-gray flex flex-col font-body text-sih-dark">
      {/* Topbar */}
      <header className="bg-white border-b-2 border-gray-100 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 shrink-0">
        
        {/* Mobile Top Row: Logo & UserNav */}
        <div className="flex items-center justify-between px-4 md:px-8 h-16 w-full md:w-auto shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <span className="font-display text-2xl tracking-wide text-sih-blue block">
              SIH<span className="text-sih-orange">2026</span>
            </span>
          </Link>
          
          {/* Mobile UserNav */}
          <div className="flex items-center md:hidden">
            <UserNav user={userData} />
          </div>
        </div>

        {/* Nav Row (Full width on mobile, centered on desktop) */}
        <div className="flex-1 min-w-0 w-full md:w-auto border-t md:border-t-0 border-gray-100 bg-gray-50/50 md:bg-transparent py-1 md:py-0 overflow-hidden flex justify-start sm:justify-center">
          <HeaderNav isSuperAdmin={isSuperAdmin} hasUnreadAnnouncements={hasUnreadAnnouncements} />
        </div>

        {/* Desktop UserNav */}
        <div className="hidden md:flex items-center px-4 md:px-8 flex-shrink-0">
          <UserNav user={userData} />
        </div>
      </header>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
