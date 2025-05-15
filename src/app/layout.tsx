
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { TicketProvider } from '@/contexts/TicketContext';

const geistSans = GeistSans; // Using GeistSans directly
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'GoMotors Tickets - Sistema de Tickets de Soporte TI',
  description: 'Gestiona tus tickets de soporte TI eficientemente con GoMotors Tickets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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

