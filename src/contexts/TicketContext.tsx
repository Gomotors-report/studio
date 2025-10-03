
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Ticket, Priority, Status, Technician } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticketData: Omit<Ticket, "id" | "submissionDate" | "status" | "solution">) => Promise<Ticket>;
  updateTicket: (updatedTicket: Ticket) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  technicians: Technician[];
  generateTicketId: () => string;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const mockTechnicians: Technician[] = [
  { id: "tech1", name: "Carlos Ordoñez" },

];

const fetchTicketsFromFirestore = async (): Promise<Ticket[]> => {
  try {
    const ticketsRef = collection(db, "tickets");
    const q = query(ticketsRef, orderBy("submissionDate", "desc"));
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = [];
    querySnapshot.forEach((doc) => {
      tickets.push({ ...doc.data(), id: doc.id } as Ticket);
    });

    return tickets;
  } catch (error) {
    console.error("Error al obtener tickets desde Firestore:", error);
    return [];
  }
};


export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketCounter, setTicketCounter] = useState(0);
   const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    const loadTickets = async () => {
      const firestoreTickets = await fetchTicketsFromFirestore();
      setTickets(firestoreTickets);

      if (firestoreTickets.length > 0) {
        const maxIdNum = firestoreTickets.reduce((max, ticket) => {
          const idParts = ticket.id.split("-");
          if (idParts.length > 1) {
            const numPart = parseInt(idParts[1], 10);
            return isNaN(numPart) ? max : Math.max(max, numPart);
          }
          return max;
        }, 0);
        setTicketCounter(maxIdNum);
      }
    };

    loadTickets();
  }, []);

  
  const generateTicketId = useCallback(() => {
    const newCount = ticketCounter + 1;
    setTicketCounter(newCount);
    return `TICKET-${String(newCount).padStart(4, "0")}`;
  }, [ticketCounter]);

  const addTicket = useCallback(async (ticketData: Omit<Ticket, "id" | "submissionDate" | "status" | "solution">): Promise<Ticket> => {
    const newTicket: Ticket = {
      ...ticketData,
      id: generateTicketId(),
      submissionDate: new Date().toISOString(),
      status: "Pendiente",
    };

    try {
      const docRef = await addDoc(collection(db, "tickets"), newTicket);
      const ticketWithFirestoreId = { ...newTicket, id: docRef.id };
      setTickets((prevTickets) => [ticketWithFirestoreId, ...prevTickets]);
      return ticketWithFirestoreId;
    } catch (error) {
      console.error("Error al agregar ticket a Firestore:", error);
      return newTicket;
    }
  }, [generateTicketId]);

  const updateTicket = useCallback(async (updatedTicket: Ticket) => {
    try {
      const ticketRef = doc(db, "tickets", updatedTicket.id);
      await updateDoc(ticketRef, { ...updatedTicket });

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
    } catch (error) {
      console.error("Error al actualizar ticket en Firestore:", error);
    }
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

