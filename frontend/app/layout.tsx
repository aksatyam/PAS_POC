import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import SkipNav from '@/components/a11y/SkipNav';

export const metadata: Metadata = {
  title: 'IMGC PAS - Policy Administration System',
  description: 'Enterprise Policy Administration System - India Mortgage Guarantee Corporation',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SkipNav />
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
