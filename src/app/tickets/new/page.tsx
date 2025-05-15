
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TicketForm, { type TicketFormData } from "@/components/TicketForm";
import { useTickets } from "@/contexts/TicketContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PriorityBadge from "@/components/PriorityBadge";
import { ArrowLeft, CheckCircle, Edit3 } from "lucide-react";

export default function CreateTicketPage() {
  const router = useRouter();
  const { addTicket, technicians, generateTicketId } = useTickets();
  const { toast } = useToast();

  const [formData, setFormData] = useState<TicketFormData | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (data: TicketFormData) => {
    setFormData(data);
    setIsReviewing(true);
  };

  const handleConfirmAndCreate = () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      const newTicket = addTicket(formData);
      toast({
        title: "Ticket Created Successfully!",
        description: (
          <div>
            <p>Ticket ID: <strong>{newTicket.id}</strong></p>
            <p>Title: {newTicket.title}</p>
          </div>
        ),
        variant: "default",
        duration: 5000,
      });
      router.push("/"); // Redirect to dashboard
    } catch (error) {
      toast({
        title: "Error Creating Ticket",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsReviewing(false);
  };

  if (isReviewing && formData) {
    const tempId = "TICKET-XXXX"; // Placeholder for display
    const submissionDate = new Date().toLocaleDateString();

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="outline" onClick={handleEdit} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit Form
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Review Your Ticket</CardTitle>
            <CardDescription>
              Please review the details below before creating the ticket.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Title: {formData.title}</h3>
              <p className="text-sm text-muted-foreground">ID: {tempId} (will be generated upon creation)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-medium">Applicant:</span> {formData.applicantName}</p>
              <p className="text-sm"><span className="font-medium">Department:</span> {formData.applicantDepartment}</p>
              <p className="text-sm"><span className="font-medium">Contact:</span> {formData.applicantContact}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Description:</p>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{formData.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Priority: </span>
                <PriorityBadge priority={formData.priority} />
              </div>
              <p className="text-sm"><span className="font-medium">Submission Date:</span> {submissionDate} (upon creation)</p>
            </div>
            {formData.assignee && (
              <p className="text-sm"><span className="font-medium">Assigned To:</span> {formData.assignee}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleEdit} disabled={isSubmitting}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={handleConfirmAndCreate} disabled={isSubmitting}>
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirm & Create Ticket
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create New Ticket</h1>
      <p className="text-muted-foreground mb-8">Fill in the details below to submit a new support ticket.</p>
      <TicketForm
        onSubmit={handleFormSubmit}
        defaultValues={formData || {}} // Pass back formData if editing
        technicians={technicians}
        submitButtonText="Review Ticket"
      />
    </div>
  );
}
