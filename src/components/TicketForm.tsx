
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
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be at most 1000 characters"),
  applicantName: z.string().min(2, "Applicant name is required").max(50),
  applicantDepartment: z.string().min(2, "Department is required").max(50),
  applicantContact: z.string().min(5, "Contact info is required").max(50),
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
  submitButtonText = "Submit Ticket"
}: TicketFormProps) {
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      priority: "Medium",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer screen flickering" {...field} className="input-custom" />
                  </FormControl>
                  <FormDescription>A brief, descriptive title for the issue.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the problem or request in detail..."
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
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} className="input-custom" />
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
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marketing, Sales" {...field} className="input-custom" />
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
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input placeholder="Email or Phone Extension" {...field} className="input-custom" />
                  </FormControl>
                  <FormDescription>How can we reach you?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-custom">
                          <SelectValue placeholder="Select priority level" />
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
                render={({ field }) => ( // field.value is string | undefined
                  <FormItem>
                    <FormLabel>Assign To (Optional)</FormLabel>
                    <Select
                      value={field.value === undefined ? INTERNAL_UNASSIGNED_VALUE : field.value}
                      onValueChange={(selectedValue) => {
                        field.onChange(selectedValue === INTERNAL_UNASSIGNED_VALUE ? undefined : selectedValue);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="input-custom">
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="select-custom-content">
                        <SelectItem value={INTERNAL_UNASSIGNED_VALUE}>Unassigned</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.name}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Assign this ticket to a specific technician.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
