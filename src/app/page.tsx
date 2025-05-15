
"use client"; // This page uses context and client-side state

import StatisticsPanel from "@/components/StatisticsPanel";
import TicketList from "@/components/TicketList";
import { useTickets } from "@/contexts/TicketContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { tickets } = useTickets();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render skeletons or loading state during SSR or initial client render
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        </div>
        <div>
          <Skeleton className="h-10 w-full mb-4" /> {/* Filter bar skeleton */}
          <Skeleton className="h-10 w-64 mb-6" /> {/* Tabs skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <StatisticsPanel tickets={tickets} />
      <TicketList />
    </div>
  );
}
