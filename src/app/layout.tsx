import type { Metadata, Viewport } from "next";
import { Inter, Anton } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
// @ts-expect-error - Next.js handles CSS imports
import "@/app/globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

const anton = Anton({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sih-ouce.meetthealtezza.tech';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl.startsWith('http') ? appUrl : `https://${appUrl}`),
  title: "OUCE SIH 2026",
  description: "The OUCE internal selection round for Smart India Hackathon 2026. Browse 240 problem statements, form your team, and compete.",
  keywords: ["SIH 2026", "Smart India Hackathon", "OUCE", "Hackathon", "Coding"],
  openGraph: {
    title: "OUCE SIH 2026 Internal Hackathon",
    description: "240 problem statements. Campus screening pitching round. Represent UCEOU at National SIH 2026.",
    type: "website",
    siteName: "OUCE SIH 2026",
    locale: "en_IN",
  },
  twitter: { 
    card: "summary_large_image",
    title: "OUCE SIH 2026 Internal Hackathon",
    description: "240 problem statements. Campus screening pitching round. Represent UCEOU at National SIH 2026.",
  },
    robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const bodyContent = (
    <html lang="en">
      <body className={`${inter.variable} ${anton.variable} font-body bg-white text-sih-dark min-h-screen flex flex-col`}>
        <NextTopLoader color="#2563EB" showSpinner={false} height={4} />
        {/* Main Layout Wrapper */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
              borderRadius: '0px',
              border: '2px solid #1F2937',
            },
            classNames: {
              success: 'border-green-600',
              error: 'border-red-600',
            }
          }}
        />
      </body>
    </html>
  );

  if (!hasClerk) {
    return bodyContent;
  }

  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Sign in to OUCE SIH 2026",
            subtitle: "to continue to OUCE SIH 2026"
          }
        },
        signUp: {
          start: {
            title: "Sign up for OUCE SIH 2026",
            subtitle: "to continue to OUCE SIH 2026"
          }
        }
      }}
    >
      {bodyContent}
    </ClerkProvider>
  );
}
