
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

  const handleConfirmAndCreate = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      const newTicket = await addTicket(formData);
      toast({
        title: "¡Ticket Creado Exitosamente!",
        description: (
          <div>
            <p>ID del Ticket: <strong>{newTicket.id}</strong></p>
            <p>Título: {newTicket.title}</p>
          </div>
        ),
        variant: "default",
        duration: 5000,
      });

      // Reset form instead of redirecting
      setFormData(null);
      setIsReviewing(false);
      setIsSubmitting(false);
    } catch (error) {
      toast({
        title: "Error al Crear Ticket",
        description: "Algo salió mal. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsReviewing(false);
  };

  if (isReviewing && formData) {
    const tempId = "TICKET-XXXX"; 
    const submissionDate = new Date().toLocaleDateString('es-ES'); // Format date for Spanish locale

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="outline" onClick={handleEdit} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Formulario
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Revisa tu Ticket</CardTitle>
            <CardDescription>
              Por favor, revisa los detalles a continuación antes de crear el ticket.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Título: {formData.title}</h3>
              <p className="text-sm text-muted-foreground">ID: {tempId} (se generará al crearlo)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-medium">Solicitante:</span> {formData.applicantName}</p>
              <p className="text-sm"><span className="font-medium">Departamento:</span> {formData.applicantDepartment}</p>
              <p className="text-sm"><span className="font-medium">Contacto:</span> {formData.applicantContact}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Descripción:</p>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{formData.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Prioridad: </span>
                <PriorityBadge priority={formData.priority} />
              </div>
              <p className="text-sm"><span className="font-medium">Fecha de Envío:</span> {submissionDate} (al crearlo)</p>
            </div>
            {formData.assignee && (
              <p className="text-sm"><span className="font-medium">Asignado A:</span> {formData.assignee}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleEdit} disabled={isSubmitting}>
              <Edit3 className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button onClick={handleConfirmAndCreate} disabled={isSubmitting}>
              {isSubmitting ? (
                "Creando..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirmar y Crear Ticket
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
      <h1 className="text-3xl font-bold mb-2">Crear Nuevo Ticket</h1>
      <p className="text-muted-foreground mb-8">Completa los detalles a continuación para enviar un nuevo ticket de soporte.</p>
      <TicketForm
        onSubmit={handleFormSubmit}
        defaultValues={formData || {}} 
        technicians={technicians}
        submitButtonText="Revisar Ticket"
      />
    </div>
  );
}

