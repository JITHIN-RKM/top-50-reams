import type { Metadata } from "next";
import OfficialResultsPortal from "@/components/results/OfficialResultsPortal";

export const metadata: Metadata = {
  title: "Teams Master Roster & Official Results | SIH OUCE 2026",
  description: "Official 3-tier results roster for SIH 2026 at University College of Engineering, Osmania University. Top 47 Shortlisted Teams, 5 Waiting List Teams, and 10 Eliminated Teams.",
};

export default function TeamsBreakdownPage() {
  return <OfficialResultsPortal />;
}
