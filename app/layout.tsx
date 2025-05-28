import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Monoton, Orbitron, Press_Start_2P, Lato, Tilt_Neon } from 'next/font/google';
import { Inter } from 'next/font/google';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const monoton = Monoton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-monoton',
});
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start',
});
const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
});
const lato = Lato({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});
const tiltNeon = Tilt_Neon({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-tilt-neon',
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Warmup Game',
  description: 'Warmup Game PWA',
  manifest: '/manifest.json',
  themeColor: '#231F20',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Warmup Game',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Warmup Game" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${monoton.variable} ${pressStart2P.variable} ${orbitron.variable} ${lato.variable} ${tiltNeon.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
