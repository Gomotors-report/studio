
export type Priority = "Alta" | "Media" | "Baja";
export const priorities: Priority[] = ["Alta", "Media", "Baja"];

export type Status = "Pendiente" | "En Progreso" | "Completado";
export const statuses: Status[] = ["Pendiente", "En Progreso", "Completado"];

export interface Ticket {
  id: string; // Unique, alphanumeric, sequential e.g., TICKET-0001
  title: string;
  description: string;
  applicantName: string;
  applicantDepartment: string;
  applicantContact: string;
  submissionDate: string; // ISO string format
  priority: Priority;
  status: Status;
  assignee?: string; // Name of the technician or team
  solution?: string; // Solution details for completed tickets
  // For simplicity, history is not detailed in this scaffold but could be added:
  // history?: Array<{ timestamp: string; action: string; changedBy?: string; details?: string }>;
}

export interface Technician {
  id: string;
  name: string;
}

export interface TicketFilters {
  status?: Status | 'All';
  priority?: Priority | 'All';
  assignee?: string;
  searchTerm?: string;
}

export interface TicketSort {
  field: keyof Pick<Ticket, 'priority' | 'submissionDate' | 'assignee'> | 'id';
  direction: 'asc' | 'desc';
}

