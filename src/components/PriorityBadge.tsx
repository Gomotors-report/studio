
import type { Priority } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Flame, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityConfig = {
  Alta: { icon: Flame, className: "priority-high", text: "Alta" },
  Media: { icon: AlertTriangle, className: "priority-medium", text: "Media" },
  Baja: { icon: Info, className: "priority-low", text: "Baja" },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 items-center text-xs px-2 py-1", config.className)}>
      <IconComponent className="h-3.5 w-3.5" />
      <span>{config.text}</span>
    </Badge>
  );
}

