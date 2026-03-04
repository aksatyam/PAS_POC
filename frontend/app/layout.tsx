import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import SkipNav from '@/components/a11y/SkipNav';

export const metadata: Metadata = {
  title: 'PAS - Policy Administration System',
  description: 'Enterprise Policy Administration System Prototype',
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
