
"use client";
import type { Ticket, Priority } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, LoaderCircle, AlertTriangle, Flame, Info, ListChecks, ListTodo } from "lucide-react";

interface StatisticsPanelProps {
  tickets: Ticket[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClassName?: string;
}

const StatCard = ({ title, value, icon: Icon, colorClassName = "text-primary" }: StatCardProps) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClassName}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function StatisticsPanel({ tickets }: StatisticsPanelProps) {
  const openTickets = tickets.filter(t => t.status === "Pendiente" || t.status === "En Progreso").length;
  const closedTickets = tickets.filter(t => t.status === "Completado").length;
  
  const highPriority = tickets.filter(t => t.priority === "Alta" && t.status !== "Completado").length;
  const mediumPriority = tickets.filter(t => t.priority === "Media" && t.status !== "Completado").length;
  const lowPriority = tickets.filter(t => t.priority === "Baja" && t.status !== "Completado").length;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Resumen de Tickets</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Tickets Abiertos" value={openTickets} icon={ListTodo} colorClassName="text-yellow-600" />
        <StatCard title="Tickets Cerrados" value={closedTickets} icon={ListChecks} colorClassName="text-green-600" />
        <StatCard title="Prioridad Alta (Abiertos)" value={highPriority} icon={Flame} colorClassName="text-red-600" />
        <StatCard title="Prioridad Media (Abiertos)" value={mediumPriority} icon={AlertTriangle} colorClassName="text-orange-600" />
        <StatCard title="Prioridad Baja (Abiertos)" value={lowPriority} icon={Info} colorClassName="text-blue-600" />
      </div>
    </div>
  );
}

