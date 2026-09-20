import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preview Phase 2 Email | Admin Preview',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PreviewPhase2EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
