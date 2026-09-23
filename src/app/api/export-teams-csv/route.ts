import { NextResponse } from 'next/server';
import teamsData from '@/data/teams_breakdown.json';
import { sanitizeCsvCell } from '@/lib/security';

export async function GET() {
  const top45Teams = [...((teamsData as any).top45Teams || (teamsData as any).top47Teams || [])].sort((a: any, b: any) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true })
  );
  const waitlistTeams = [...((teamsData as any).waitlistTeams || [])].sort((a: any, b: any) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true })
  );

  const headers = [
    'Section',
    'Official Status',
    'S.No',
    'Team Name',
    'Leader Name',
    'Leader Phone',
    'Leader Email',
    'Branch',
    'Year',
    'Problem Statement ID',
    'Problem Statement Title',
    'Members Count',
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  // Section 1: Top 45 Shortlisted Teams (Nomination Roster)
  top45Teams.forEach((t: any, idx: number) => {
    rows.push([
      sanitizeCsvCell('1. Top 45 Shortlisted Teams (Nomination Pool)'),
      sanitizeCsvCell('Shortlisted'),
      idx + 1,
      sanitizeCsvCell(t.name),
      sanitizeCsvCell(t.leaderName),
      sanitizeCsvCell(t.leaderPhone),
      sanitizeCsvCell(t.leaderEmail),
      sanitizeCsvCell(t.leaderBranch),
      sanitizeCsvCell(t.leaderYear),
      sanitizeCsvCell(t.psId),
      sanitizeCsvCell(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  // Section 2: Waiting List (5 teams)
  waitlistTeams.forEach((t: any, idx: number) => {
    rows.push([
      sanitizeCsvCell('2. Waiting List (5 Teams)'),
      sanitizeCsvCell('Waiting List'),
      idx + 1,
      sanitizeCsvCell(t.name),
      sanitizeCsvCell(t.leaderName),
      sanitizeCsvCell(t.leaderPhone),
      sanitizeCsvCell(t.leaderEmail),
      sanitizeCsvCell(t.leaderBranch),
      sanitizeCsvCell(t.leaderYear),
      sanitizeCsvCell(t.psId),
      sanitizeCsvCell(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  const csvContent = rows.join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sih_ouce_2026_top_teams_segregation.csv"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
