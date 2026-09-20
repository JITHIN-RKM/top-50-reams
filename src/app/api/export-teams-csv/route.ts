import { NextResponse } from 'next/server';
import teamsData from '@/data/teams_breakdown.json';

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

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [];
  rows.push(headers.join(','));

  // Section 1: Top 47 Shortlisted Teams
  top47Teams.forEach((t: any, idx: number) => {
    rows.push([
      escapeCSV('1. Top 47 Shortlisted Teams (Selection Pool for Final 45)'),
      escapeCSV('Shortlisted'),
      idx + 1,
      escapeCSV(t.name),
      escapeCSV(t.leaderName),
      escapeCSV(t.leaderPhone),
      escapeCSV(t.leaderEmail),
      escapeCSV(t.leaderBranch),
      escapeCSV(t.leaderYear),
      escapeCSV(t.psId),
      escapeCSV(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  // Candidate #48 (Alternate)
  candidate48Teams.forEach((t: any) => {
    rows.push([
      escapeCSV('1. Top Shortlisted (Alternate Candidate #48)'),
      escapeCSV('Shortlisted (Alternate)'),
      48,
      escapeCSV(t.name),
      escapeCSV(t.leaderName),
      escapeCSV(t.leaderPhone),
      escapeCSV(t.leaderEmail),
      escapeCSV(t.leaderBranch),
      escapeCSV(t.leaderYear),
      escapeCSV(t.psId),
      escapeCSV(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  // Section 2: Waiting List (5 teams)
  waitlistTeams.forEach((t: any, idx: number) => {
    rows.push([
      escapeCSV('2. Waiting List (5 Teams)'),
      escapeCSV(`Waitlist Rank #${idx + 1}`),
      idx + 1,
      escapeCSV(t.name),
      escapeCSV(t.leaderName),
      escapeCSV(t.leaderPhone),
      escapeCSV(t.leaderEmail),
      escapeCSV(t.leaderBranch),
      escapeCSV(t.leaderYear),
      escapeCSV(t.psId),
      escapeCSV(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  // Section 3: Eliminated Teams (10 teams)
  eliminatedTeams.forEach((t: any, idx: number) => {
    rows.push([
      escapeCSV('3. Eliminated Teams (10 Teams)'),
      escapeCSV('Eliminated'),
      idx + 1,
      escapeCSV(t.name),
      escapeCSV(t.leaderName),
      escapeCSV(t.leaderPhone),
      escapeCSV(t.leaderEmail),
      escapeCSV(t.leaderBranch),
      escapeCSV(t.leaderYear),
      escapeCSV(t.psId),
      escapeCSV(t.psTitle),
      t.membersCount,
    ].join(','));
  });

  const csvContent = rows.join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sih_ouce_2026_top_teams_segregation.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
