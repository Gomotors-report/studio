
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Ticket, Status, Priority, TicketFilters, TicketSort } from '@/types';
import { statuses, priorities } from '@/types';
import TicketCard from './TicketCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Filter, ArrowUpDown, Search, RotateCcw } from 'lucide-react';
import { useTickets } from '@/contexts/TicketContext'; 

const ALL_ASSIGNEES_SENTINEL = "__ALL_ASSIGNEES__";

export default function TicketList() {
  const { tickets, technicians } = useTickets();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'All',
    priority: 'All',
    assignee: '', 
    searchTerm: '',
  });

  const [sort, setSort] = useState<TicketSort>({ field: 'submissionDate', direction: 'desc' });

  const handleFilterChange = useCallback((filterName: keyof TicketFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const handleSortChange = useCallback((field: TicketSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'All',
      priority: 'All',
      assignee: '',
      searchTerm: '',
    });
    setSort({ field: 'submissionDate', direction: 'desc' });
  }, []);

  const filteredAndSortedTickets = useMemo(() => {
    let processedTickets = tickets;

    if (activeTab === 'pending') {
      processedTickets = processedTickets.filter(t => t.status === 'Pendiente' || t.status === 'En Progreso');
    } else if (activeTab === 'completed') {
      processedTickets = processedTickets.filter(t => t.status === 'Completado');
    }

    if (filters.status && filters.status !== 'All') {
      processedTickets = processedTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'All') {
      processedTickets = processedTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.assignee) { 
      processedTickets = processedTickets.filter(t => t.assignee === filters.assignee);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      processedTickets = processedTickets.filter(t =>
        t.id.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        t.applicantName.toLowerCase().includes(term)
      );
    }

    processedTickets.sort((a, b) => {
      let valA: any, valB: any;
      if (sort.field === 'priority') {
        const priorityOrder: Record<Priority, number> = { Alta: 1, Media: 2, Baja: 3 };
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      } else if (sort.field === 'submissionDate') {
        valA = new Date(a.submissionDate).getTime();
        valB = new Date(b.submissionDate).getTime();
      } else if (sort.field === 'assignee') {
        valA = a.assignee || '';
        valB = b.assignee || '';
      } else { 
        valA = a.id;
        valB = b.id;
      }
      
      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processedTickets;
  }, [tickets, activeTab, filters, sort]);

  const SortButton = ({ field, label }: { field: TicketSort['field'], label: string }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSortChange(field)} className="gap-1">
      {label}
      {sort.field === field && <ArrowUpDown className={`h-3.5 w-3.5 transition-transform ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />}
    </Button>
  );
  
  const noTicketsMessage = activeTab === 'pending' 
    ? "No hay tickets pendientes que coincidan con tus criterios. ¡Buen trabajo!"
    : "No hay tickets completados que coincidan con tus criterios.";


  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar ID, título, solicitante..."
              value={filters.searchTerm}
              onChange={e => handleFilterChange('searchTerm', e.target.value)}
              className="pl-9 input-custom"
            />
          </div>
          <Select value={filters.priority} onValueChange={val => handleFilterChange('priority', val as Priority | 'All')}>
            <SelectTrigger className="input-custom"><SelectValue placeholder="Filtrar por Prioridad" /></SelectTrigger>
            <SelectContent className="select-custom-content">
              <SelectItem value="All">Todas las Prioridades</SelectItem>
              {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={val => handleFilterChange('status', val as Status | 'All')}>
            <SelectTrigger className="input-custom"><SelectValue placeholder="Filtrar por Estado" /></SelectTrigger>
            <SelectContent className="select-custom-content">
              <SelectItem value="All">Todos los Estados</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select 
            value={filters.assignee || ALL_ASSIGNEES_SENTINEL} 
            onValueChange={val => handleFilterChange('assignee', val === ALL_ASSIGNEES_SENTINEL ? '' : val)}
          >
            <SelectTrigger className="input-custom"><SelectValue placeholder="Filtrar por Asignado" /></SelectTrigger>
            <SelectContent className="select-custom-content">
              <SelectItem value={ALL_ASSIGNEES_SENTINEL}>Todos los Asignados</SelectItem>
              {technicians.map(tech => <SelectItem key={tech.id} value={tech.name}>{tech.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-1">
                <SortButton field="submissionDate" label="Fecha" />
                <SortButton field="priority" label="Prioridad" />
                <SortButton field="assignee" label="Asignado" />
                <SortButton field="id" label="ID" />
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reiniciar Filtros
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'completed')}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="pending">Tickets Pendientes</TabsTrigger>
          <TabsTrigger value="completed">Tickets Completados</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {filteredAndSortedTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredAndSortedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">{noTicketsMessage}</div>
          )}
        </TabsContent>
        <TabsContent value="completed">
           {filteredAndSortedTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredAndSortedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">{noTicketsMessage}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

