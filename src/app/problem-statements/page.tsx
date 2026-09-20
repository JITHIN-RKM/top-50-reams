import type { Metadata } from 'next';
import ProblemStatementsClient from './ProblemStatementsClient';
import psDataRaw from '@/data/sih-2026-data.json';

export const metadata: Metadata = {
  title: "Problem Statements Explorer | OUCE SIH 2026",
  description: "Browse, filter, and explore all 240 official Smart India Hackathon 2026 problem statements. Find your next big idea.",
  alternates: {
    canonical: '/problem-statements',
  },
  openGraph: {
    title: "Problem Statements Explorer | OUCE SIH 2026",
    description: "Browse, filter, and explore all 240 official Smart India Hackathon 2026 problem statements.",
  }
};

// Server component — processes the full JSON server-side
// Only passes the necessary metadata to the client (no full JSON in bundle)
export default function ProblemStatementsPage() {
  // Extract just the data the client needs for filtering/display
  const psData = (psDataRaw as any[]).map((ps: any) => ({
    id: ps.id,
    title: ps.title,
    organization: ps.organization,
    theme: ps.theme,
    category: ps.category,
    innovation_scope: ps.level2?.innovation_scope ?? null,
    invention_effort: ps.level2?.invention_effort ?? null,
  }));

  const themes = Array.from(new Set(psData.map((ps) => ps.theme))).filter(Boolean).sort() as string[];
  const categories = Array.from(new Set(psData.map((ps) => ps.category))).filter(Boolean).sort() as string[];

  return (
    <ProblemStatementsClient
      psData={psData}
      themes={themes}
      categories={categories}
    />
  );
}