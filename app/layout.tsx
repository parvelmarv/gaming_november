import "./globals.css";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Monoton, Orbitron, Press_Start_2P, Lato, Tilt_Neon } from 'next/font/google';
import { Inter } from 'next/font/google';
import MobileWarning from './components/MobileWarning';
import Script from 'next/script';

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
  description: 'A fun warmup game',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Warmup Game',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#231F20',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Warmup Game" />
        <meta name="theme-color" content="#231F20" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <Script id="service-worker-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful');
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${monoton.variable} ${pressStart2P.variable} ${orbitron.variable} ${lato.variable} ${tiltNeon.variable} ${inter.className} antialiased bg-black`}
      >
        <MobileWarning />
        {children}
      </body>
    </html>
  );
}
