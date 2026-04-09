import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
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
    <html lang="fr" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
