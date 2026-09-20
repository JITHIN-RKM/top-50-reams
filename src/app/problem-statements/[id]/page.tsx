import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import psData from '@/data/sih-2026-data.json';
import { ArrowLeft, Lightbulb, Activity, CheckCircle2, Check } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ClientTabs from './ClientTabs'; // We'll create this to handle the client state
import BackButton from './BackButton';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ps = psData.find(p => p.id === id);
  if (!ps) return {};

  return {
    title: `${ps.id}: ${ps.title} | OUCE SIH 2026`,
    description: ps.level1?.background ? ps.level1.background.substring(0, 160) + '...' : ps.title,
    alternates: {
      canonical: `/problem-statements/${ps.id}`,
    },
    openGraph: {
      title: `${ps.id}: ${ps.title}`,
      description: ps.level1?.background ? ps.level1.background.substring(0, 160) + '...' : ps.title,
    },
    twitter: {
      title: `${ps.id}: ${ps.title}`,
      description: ps.level1?.background ? ps.level1.background.substring(0, 160) + '...' : ps.title,
    }
  };
}

export default async function ProblemStatementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ps = psData.find(p => p.id === id);
  if (!ps) notFound();

  const { userId } = await auth();

  let team = null;
  if (userId) {
    const supabase = createAdminClient();
    const { data: user } = await supabase.from('users').select('team_id').eq('id', userId).single();
    if (user?.team_id) {
      const { data: t } = await supabase.from('teams').select('*').eq('id', user.team_id).single();
      team = t;
    }
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://sih-ouce.meetthealtezza.tech"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Problem Statements",
        "item": "https://sih-ouce.meetthealtezza.tech/problem-statements"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${ps.id}: ${ps.title}`,
        "item": `https://sih-ouce.meetthealtezza.tech/problem-statements/${ps.id}`
      }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto">
      <Script
        id={`breadcrumb-${ps.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <BackButton />

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="bg-gray-100 text-gray-800 text-xs font-bold px-4 py-1.5 rounded-full">{ps.id}</span>
          <span className="bg-orange-50 text-sih-orange text-xs font-bold px-4 py-1.5 rounded-full uppercase">{ps.category}</span>
          <span className="bg-blue-50 text-sih-blue text-xs font-bold px-4 py-1.5 rounded-full">{ps.organization}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {ps.title}
        </h1>

        <ClientTabs ps={ps} team={team} clerkId={userId as string} />

      </div>
    </div>
  );
}


