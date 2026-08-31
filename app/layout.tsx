import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Костя & Ксюша — наша история',
  description: 'История, которая началась с одного лайка 12 мая 2025 года.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Наша история',
    description: 'Один лайк. Одна история.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Наша история — один лайк, одна история' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Наша история',
    description: 'Один лайк. Одна история.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
