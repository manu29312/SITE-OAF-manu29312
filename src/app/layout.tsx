import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'SITE-OAF - Migration Next.js',
  description: 'Base propre et professionnelle pour migrer SITE-OAF vers Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${ibmPlexSans.variable}`}>
      <body className="app-body">
        {children}
      </body>
    </html>
  );
}
