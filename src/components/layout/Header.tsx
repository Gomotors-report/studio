
"use client";
import Link from "next/link";
import { Ticket, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            GoMotors Tickets
          </span>
        </Link>
        <nav className="flex items-center gap-4">
         
        </nav>
      </div>
    </header>
  );
}

