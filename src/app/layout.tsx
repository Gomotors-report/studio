
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { TicketProvider } from '@/contexts/TicketContext';

const geistSans = GeistSans; // Using GeistSans directly
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'TicketySplit - IT Support Ticket System',
  description: 'Manage your IT support tickets efficiently with TicketySplit.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <TicketProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </TicketProvider>
      </body>
    </html>
  );
}
