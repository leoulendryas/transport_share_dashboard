import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'gara admin',
  description: 'Enterprise administration panel for gara transport',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  