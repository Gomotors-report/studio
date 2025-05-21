
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Ticket, Priority, Status, Technician } from "@/types";

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticketData: Omit<Ticket, "id" | "submissionDate" | "status" | "solution">) => Ticket;
  updateTicket: (updatedTicket: Ticket) => void;
  getTicketById: (id: string) => Ticket | undefined;
  technicians: Technician[];
  generateTicketId: () => string;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const mockTechnicians: Technician[] = [
  { id: "tech1", name: "Carlos Ordoñez" },

];

const getInitialTickets = (): Ticket[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const savedTickets = localStorage.getItem("tickets");
  if (savedTickets) {
    try {
      return JSON.parse(savedTickets);
    } catch (e) {
      console.error("Error al parsear tickets desde localStorage", e);
      return [];
    }
  }
  return [
    {
      id: "TICKET-0001",
      title: "Impresora de red desconectada",
      description: "La impresora principal de la oficina (HP LaserJet Pro M404dn) no responde. Los usuarios del departamento de Ventas no pueden imprimir documentos críticos.",
      applicantName: "Juan Pérez",
      applicantDepartment: "Ventas",
      applicantContact: "j.perez@example.com / x1234",
      submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
      priority: "Alta",
      status: "Pendiente",
      assignee: "Alice Wonderland",
    },
    {
      id: "TICKET-0002",
      title: "Renovación de licencia de software",
      description: "Solicitud para renovar la licencia de Adobe Creative Cloud para el equipo de Marketing. La licencia actual vence el próximo mes.",
      applicantName: "Ana Gómez",
      applicantDepartment: "Marketing",
      applicantContact: "a.gomez@example.com / x5678",
      submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
      priority: "Media",
      status: "En Progreso",
      assignee: "Bob The Builder",
    },
    {
      id: "TICKET-0003",
      title: "Configuración para nuevo empleado",
      description: "Configurar nueva laptop Dell, cuenta de correo electrónico y acceso a software para el especialista de RRHH que comienza la próxima semana.",
      applicantName: "Laura Blanca",
      applicantDepartment: "Recursos Humanos",
      applicantContact: "l.blanca@example.com / x RRHH",
      submissionDate: new Date().toISOString(),
      priority: "Baja",
      status: "Pendiente",
    },
     {
      id: "TICKET-0004",
      title: "Mantenimiento de servidor completado",
      description: "Mantenimiento programado del servidor SRV-01 completado con éxito. Todos los servicios verificados.",
      applicantName: "Departamento de TI",
      applicantDepartment: "TI",
      applicantContact: "soporte-ti@example.com",
      submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
      priority: "Baja",
      status: "Completado",
      assignee: "Charlie Brown",
      solution: "Todas las actualizaciones aplicadas, servidor reiniciado, servicios confirmados como operativos."
    },
  ];
};


export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketCounter, setTicketCounter] = useState(0);
   const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    const initialTickets = getInitialTickets();
    setTickets(initialTickets);
    if (initialTickets.length > 0) {
      const maxIdNum = initialTickets.reduce((max, ticket) => {
        const numPart = parseInt(ticket.id.split("-")[1], 10);
        return isNaN(numPart) ? max : Math.max(max, numPart);
      }, 0);
      setTicketCounter(maxIdNum);
    } else {
       setTicketCounter(initialTickets.length); 
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
       localStorage.setItem("tickets", JSON.stringify(tickets));
    }
  }, [tickets, isMounted]);
  
  const generateTicketId = useCallback(() => {
    const newCount = ticketCounter + 1;
    setTicketCounter(newCount);
    return `TICKET-${String(newCount).padStart(4, "0")}`;
  }, [ticketCounter]);

  const addTicket = useCallback((ticketData: Omit<Ticket, "id" | "submissionDate" | "status" | "solution">): Ticket => {
    const newTicket: Ticket = {
      ...ticketData,
      id: generateTicketId(),
      submissionDate: new Date().toISOString(),
      status: "Pendiente", // Default status in Spanish
    };
    setTickets((prevTickets) => [newTicket, ...prevTickets]);
    return newTicket;
  }, [generateTicketId]);

  const updateTicket = useCallback((updatedTicket: Ticket) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  }, []);

  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find((ticket) => ticket.id === id);
  }, [tickets]);


  if (!isMounted) {
    return null; 
  }

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        updateTicket,
        getTicketById,
        technicians: mockTechnicians,
        generateTicketId,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets debe ser usado dentro de un TicketProvider");
  }
  return context;
};

