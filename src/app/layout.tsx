import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VOLTEX — Visual Volleyball Playbook & Coaching Platform',
    template: '%s | VOLTEX',
  },
  description: 'Interactive volleyball playbook with animated plays, rotation validation, custom formations, coverage strategies, rally builder, and team quiz mode. Built for coaches at every level.',
  keywords: [
    'volleyball playbook',
    'volleyball coaching tool',
    'volleyball rotation simulator',
    'volleyball play designer',
    'volleyball formation builder',
    'volleyball animation software',
    'volleyball tactics',
    'volleyball strategy app',
    'serve receive formations',
    'volleyball defense positions',
    'volleyball quiz',
    'volleyball coaching app',
    'volleyball play animator',
    '5-1 rotation',
    '6-2 rotation',
    'volleyball coverage strategy',
    'volleyball rally builder',
    'volleyball team management',
  ],
  authors: [{ name: 'VOLTEX' }],
  creator: 'VOLTEX',
  publisher: 'VOLTEX',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VOLTEX',
    title: 'VOLTEX — Visual Volleyball Playbook & Coaching Platform',
    description: 'Animated volleyball playbook with rotation validation, custom formations, coverage strategies, and team quiz mode.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOLTEX — Visual Volleyball Playbook',
    description: 'Interactive animated volleyball playbook for coaches. Design plays, validate rotations, build rallies, and quiz your team.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
