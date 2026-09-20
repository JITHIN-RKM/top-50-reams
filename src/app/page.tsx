import type { Metadata } from "next";
import OfficialResultsPortal from "@/components/results/OfficialResultsPortal";

export const metadata: Metadata = {
  title: "Official Results & Nomination Roster | SIH OUCE 2026 Internal Hackathon",
  description: "University College of Engineering, Osmania University (UCEOU) official 3-tier evaluation results for Smart India Hackathon 2026. Top 47 Shortlisted Teams, 5 Waiting List Teams, and 10 Eliminated Teams.",
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  return <OfficialResultsPortal />;
}
