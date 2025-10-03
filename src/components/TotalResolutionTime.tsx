"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import type { Ticket } from "@/types";
import { calculateTotalValidDuration, formatDuration } from "@/lib/ticketUtils";

interface TotalResolutionTimeProps {
  tickets: Ticket[];
}

export default function TotalResolutionTime({ tickets }: TotalResolutionTimeProps) {
  // Calculate total resolution time with validation
  const { totalSeconds, validCount, invalidCount } = calculateTotalValidDuration(tickets);

  const completedCount = tickets.filter((t) => t.status === "Completado").length;

  return (
    <Card className="shadow-lg border-l-4 border-l-purple-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          <Clock className="inline mr-2 h-5 w-5 text-purple-600" />
          Tiempo Total de Resolución
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-purple-600">
          {formatDuration(totalSeconds)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Tiempo acumulado de {validCount} ticket{validCount !== 1 ? "s" : ""} completado
          {validCount !== 1 ? "s" : ""}
        </p>
        {totalSeconds > 0 && validCount > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Promedio: {formatDuration(Math.round(totalSeconds / validCount))} por ticket
          </p>
        )}
        {invalidCount > 0 && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {invalidCount} ticket{invalidCount !== 1 ? "s" : ""} con tiempo sospechoso excluido
            {invalidCount !== 1 ? "s" : ""}
          </p>
        )}
        {completedCount > validCount + invalidCount && (
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount - validCount - invalidCount} ticket{completedCount - validCount - invalidCount !== 1 ? "s" : ""} sin duración
          </p>
        )}
      </CardContent>
    </Card>
  );
}
