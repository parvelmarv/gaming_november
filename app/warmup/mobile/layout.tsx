import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RolloRocket - Mobile Game',
  description: 'Play RolloRocket on your mobile device',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: '#231F20',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RolloRocket'
  },
  formatDetection: {
    telephone: false
  }
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 