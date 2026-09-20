import { NextResponse } from 'next/server';
import teamsData from '@/data/teams_breakdown.json';
import { sanitizeCsvCell } from '@/lib/security';

export async function GET() {
  const top47Teams = (teamsData as any).top47Teams || [];
  const candidate48Teams = (teamsData as any).candidate48Teams || [];
  const waitlistTeams = (teamsData as any).waitlistTeams || [];
  const eliminatedTeams = (teamsData as any).eliminatedTeams || [];

  const headers = [
    'Section',
    'Official Status',
    'Rank / S.No',
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

  // Section 1: Top 47 Shortlisted Teams
  top47Teams.forEach((t: any, idx: number) => {
    rows.push([
      sanitizeCsvCell('1. Top 47 Shortlisted Teams (Selection Pool for Final 45)'),
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

  // Candidate #48 (Alternate)
  candidate48Teams.forEach((t: any) => {
    rows.push([
      sanitizeCsvCell('1. Top Shortlisted (Alternate Candidate #48)'),
      sanitizeCsvCell('Shortlisted (Alternate)'),
      48,
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
      sanitizeCsvCell(`Waitlist Rank #${idx + 1}`),
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

  // Section 3: Eliminated Teams (10 teams)
  eliminatedTeams.forEach((t: any, idx: number) => {
    rows.push([
      sanitizeCsvCell('3. Eliminated Teams (10 Teams)'),
      sanitizeCsvCell('Eliminated'),
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
