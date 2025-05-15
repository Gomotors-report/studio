
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Priority, Technician } from "@/types";
import { priorities } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ticketFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100, "El título debe tener como máximo 100 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción debe tener como máximo 1000 caracteres"),
  applicantName: z.string().min(2, "El nombre del solicitante es obligatorio").max(50),
  applicantDepartment: z.string().min(2, "El departamento es obligatorio").max(50),
  applicantContact: z.string().min(5, "La información de contacto es obligatoria").max(50),
  priority: z.enum(priorities),
  assignee: z.string().optional(),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void;
  defaultValues?: Partial<TicketFormData>;
  technicians: Technician[];
  isSubmitting?: boolean;
  submitButtonText?: string;
}

const INTERNAL_UNASSIGNED_VALUE = "__INTERNAL_UNASSIGNED__";

export default function TicketForm({
  onSubmit,
  defaultValues,
  technicians,
  isSubmitting = false,
  submitButtonText = "Enviar Ticket"
}: TicketFormProps) {
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      priority: "Media", // Default to "Media" which is the Spanish equivalent
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pantalla de computadora parpadea" {...field} className="input-custom" />
                  </FormControl>
                  <FormDescription>Un título breve y descriptivo para el problema.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Detallada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema o solicitud en detalle..."
                      rows={5}
                      {...field}
                      className="input-custom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Solicitante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} className="input-custom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicantDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Marketing, Ventas" {...field} className="input-custom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="applicantContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Información de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Email o Extensión Telefónica" {...field} className="input-custom" />
                  </FormControl>
                  <FormDescription>¿Cómo podemos contactarte?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clasificación y Asignación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-custom">
                          <SelectValue placeholder="Selecciona nivel de prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="select-custom-content">
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => ( 
                  <FormItem>
                    <FormLabel>Asignar A (Opcional)</FormLabel>
                    <Select
                      value={field.value === undefined ? INTERNAL_UNASSIGNED_VALUE : field.value}
                      onValueChange={(selectedValue) => {
                        field.onChange(selectedValue === INTERNAL_UNASSIGNED_VALUE ? undefined : selectedValue);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="input-custom">
                          <SelectValue placeholder="Selecciona un técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="select-custom-content">
                        <SelectItem value={INTERNAL_UNASSIGNED_VALUE}>Sin Asignar</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.name}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Asigna este ticket a un técnico específico.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Enviando..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}

