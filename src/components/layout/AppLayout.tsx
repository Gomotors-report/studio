
import type { ReactNode } from "react";
import Header from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <Toaster />
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            GoMotors Tickets &copy; {new Date().getFullYear()}. 
          </p>
        </div>
      </footer>
    </div>
  );
}

