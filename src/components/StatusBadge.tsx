
import type { Status } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CircleHelp, LoaderCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  Pendiente: { icon: CircleHelp, className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20", text: "Pendiente" },
  "En Progreso": { icon: LoaderCircle, className: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20", text: "En Progreso" },
  Completado: { icon: CheckCircle2, className: "bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20", text: "Completado" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 items-center text-xs px-2 py-1", config.className)}>
      <IconComponent className={cn("h-3.5 w-3.5")} />
      <span>{config.text}</span>
    </Badge>
  );
}

