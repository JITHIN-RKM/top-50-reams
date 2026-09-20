import type { MetadataRoute } from "next";
import psDataRaw from '@/data/sih-2026-data.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sih-ouce.meetthealtezza.tech";
  const base = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  
  const problemStatements: MetadataRoute.Sitemap = (psDataRaw as any[]).map((ps) => ({
    url: `${base}/problem-statements/${ps.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/problem-statements`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...problemStatements
  ];
}
