
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
  { id: "tech1", name: "Alice Wonderland" },
  { id: "tech2", name: "Bob The Builder" },
  { id: "tech3", name: "Charlie Brown" },
];

// Helper to ensure localStorage is only accessed on the client
const getInitialTickets = (): Ticket[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const savedTickets = localStorage.getItem("tickets");
  if (savedTickets) {
    try {
      return JSON.parse(savedTickets);
    } catch (e) {
      console.error("Failed to parse tickets from localStorage", e);
      return [];
    }
  }
  return [
    {
      id: "TICKET-0001",
      title: "Network printer offline",
      description: "The main office printer (HP LaserJet Pro M404dn) is not responding. Users in the Sales department cannot print critical documents.",
      applicantName: "John Doe",
      applicantDepartment: "Sales",
      applicantContact: "j.doe@example.com / x1234",
      submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      priority: "High",
      status: "Pending",
      assignee: "Alice Wonderland",
    },
    {
      id: "TICKET-0002",
      title: "Software license renewal",
      description: "Request to renew Adobe Creative Cloud license for the Marketing team. Current license expires next month.",
      applicantName: "Jane Smith",
      applicantDepartment: "Marketing",
      applicantContact: "j.smith@example.com / x5678",
      submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      priority: "Medium",
      status: "InProgress",
      assignee: "Bob The Builder",
    },
    {
      id: "TICKET-0003",
      title: "New employee onboarding setup",
      description: "Setup new Dell laptop, email account, and software access for incoming HR specialist starting next week.",
      applicantName: "Emily White",
      applicantDepartment: "Human Resources",
      applicantContact: "e.white@example.com / x HR",
      submissionDate: new Date().toISOString(),
      priority: "Low",
      status: "Pending",
    },
     {
      id: "TICKET-0004",
      title: "Server maintenance completed",
      description: "Scheduled server maintenance on SRV-01 completed successfully. All services verified.",
      applicantName: "IT Department",
      applicantDepartment: "IT",
      applicantContact: "it-support@example.com",
      submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      priority: "Low",
      status: "Completed",
      assignee: "Charlie Brown",
      solution: "All updates applied, server rebooted, services confirmed operational."
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
    // Determine initial counter based on existing tickets to avoid ID collision on first load
    if (initialTickets.length > 0) {
      const maxIdNum = initialTickets.reduce((max, ticket) => {
        const numPart = parseInt(ticket.id.split("-")[1], 10);
        return isNaN(numPart) ? max : Math.max(max, numPart);
      }, 0);
      setTicketCounter(maxIdNum);
    } else {
       setTicketCounter(initialTickets.length); // Default to existing tickets length if none have numeric suffix
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
      status: "Pending",
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
    // You can render a loader here if needed, or null
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
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};
