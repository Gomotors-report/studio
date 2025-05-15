
"use client";

import { useParams, useRouter } from "next/navigation";
import { useTickets } from "@/contexts/TicketContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { priorities, statuses, type Status as StatusType, type Priority as PriorityType } from "@/types";
import { ArrowLeft, UserCircle, CalendarDays, Building, Phone, Mail, Edit3, Save, Briefcase, FileText, ShieldCheck, MessageSquare, CheckCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getTicketById, updateTicket, technicians } = useTickets();
  const { toast } = useToast();

  const ticketId = typeof params.id === 'string' ? params.id : '';
  const [ticket, setTicket] = useState(getTicketById(ticketId));
  
  const [newStatus, setNewStatus] = useState<StatusType | undefined>(ticket?.status);
  const [solution, setSolution] = useState(ticket?.solution || "");
  const [isEditing, setIsEditing] = useState(false); // For future inline edits
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const currentTicket = getTicketById(ticketId);
    setTicket(currentTicket);
    if (currentTicket) {
      setNewStatus(currentTicket.status);
      setSolution(currentTicket.solution || "");
    }
  }, [ticketId, getTicketById]);


  if (!ticket) {
    return (
      <div className="text-center py-10">
        <Alert variant="destructive">
          <AlertTitle>Ticket Not Found</AlertTitle>
          <AlertDescription>The ticket with ID "{ticketId}" could not be found.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/')} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: StatusType) => {
    setNewStatus(status);
  };

  const handleSaveChanges = () => {
    if (!newStatus || !ticket) return;
    setIsSubmitting(true);
    const updatedTicket = {
      ...ticket,
      status: newStatus,
      solution: newStatus === "Completed" ? solution : ticket.solution, // Only save solution if completed
    };
    updateTicket(updatedTicket);
    setTicket(updatedTicket); // Update local state
    setIsSubmitting(false);
    toast({
      title: "Ticket Updated",
      description: `Ticket ${ticket.id} status changed to ${newStatus}.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-0 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{ticket.title}</CardTitle>
              <CardDescription className="text-sm">
                Ticket ID: <span className="font-semibold">{ticket.id}</span>
              </CardDescription>
            </div>
            <PriorityBadge priority={ticket.priority} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Description</h3>
              <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md leading-relaxed">{ticket.description}</p>
            </div>
            
            {ticket.status === "Completed" && ticket.solution && (
              <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-600" />Solution</h3>
                <p className="text-sm whitespace-pre-wrap bg-green-500/10 p-4 rounded-md border border-green-500/30 text-green-700 dark:text-green-400 leading-relaxed">{ticket.solution}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 border-l-0 md:border-l md:pl-6">
            <h3 className="text-lg font-semibold flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Details</h3>
            <div className="text-sm space-y-2">
              <p className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Applicant:</strong>&nbsp;{ticket.applicantName}</p>
              <p className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Department:</strong>&nbsp;{ticket.applicantDepartment}</p>
              <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Contact:</strong>&nbsp;{ticket.applicantContact}</p>
              <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Submitted:</strong>&nbsp;{formatDate(ticket.submissionDate)}</p>
              {ticket.assignee && <p className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary" /> <strong>Assigned To:</strong>&nbsp;{ticket.assignee}</p>}
              <div className="flex items-center gap-2"><strong>Status:</strong> <StatusBadge status={ticket.status} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {ticket.status !== "Completed" && (
        <Card className="shadow-lg print:hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/>Update Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="status-select" className="block text-sm font-medium mb-1">Change Status</label>
              <Select value={newStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id="status-select" className="input-custom">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="select-custom-content">
                  {statuses.map(s => (
                    <SelectItem key={s} value={s} disabled={s === ticket.status}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newStatus === "Completed" && (
              <div>
                <label htmlFor="solution-text" className="block text-sm font-medium mb-1 flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4"/> Solution Implemented
                </label>
                <Textarea
                  id="solution-text"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe the solution implemented for this ticket..."
                  rows={4}
                  className="input-custom"
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveChanges} disabled={newStatus === ticket.status || isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      )}
       <div className="flex justify-end print:hidden">
         <Button variant="outline" onClick={() => window.print()}>Print Ticket</Button>
      </div>
    </div>
  );
}

