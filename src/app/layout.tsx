import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VOLTEX — Volleyball Playbook',
  description: 'Interactive volleyball playbook and rotation simulator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
