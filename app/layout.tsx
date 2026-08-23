import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PART TIME WORK EARNINGS',
  description: 'Track store shifts, deliveries, earnings, payments, and expenses from any device.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
