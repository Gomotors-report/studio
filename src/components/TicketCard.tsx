
"use client";
import Link from "next/link";
import type { Ticket } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { UserCircle, CalendarDays, Edit3, Eye } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
            <Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link>
          </CardTitle>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          ID: <span className="font-semibold text-foreground">{ticket.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{ticket.description}</p>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <UserCircle className="h-3.5 w-3.5" /> Applicant: <span className="font-medium text-foreground">{ticket.applicantName} ({ticket.applicantDepartment})</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Submitted: <span className="font-medium text-foreground">{formatDate(ticket.submissionDate)}</span>
          </div>
           {ticket.assignee && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <UserCircle className="h-3.5 w-3.5 text-primary" /> Assigned to: <span className="font-medium text-foreground">{ticket.assignee}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <StatusBadge status={ticket.status} />
        <div className="flex gap-2">
          <Link href={`/tickets/${ticket.id}`} passHref>
            <Button variant="outline" size="sm">
              <Eye className="mr-1.5 h-4 w-4" /> View
            </Button>
          </Link>
          {/* Future edit button if needed from list view */}
          {/* <Link href={`/tickets/${ticket.id}/edit`} passHref>
            <Button variant="ghost" size="sm">
              <Edit3 className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          </Link> */}
        </div>
      </CardFooter>
    </Card>
  );
}
