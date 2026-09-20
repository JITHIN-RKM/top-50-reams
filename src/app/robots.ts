import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sih-ouce.meetthealtezza.tech";
  const baseUrl = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
