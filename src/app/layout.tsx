import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import StoreHydration from '@/components/layout/StoreHydration';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Concurrency Kitchen | Learn Swift Concurrency',
  description:
    'An immersive, interactive learning experience for mastering Swift Concurrency through the metaphor of running a restaurant kitchen.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-kitchen-bg text-kitchen-text font-sans" suppressHydrationWarning>
        <StoreHydration />
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
