"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import type { Ticket } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { calculateTotalValidDuration, formatDuration as formatDurationUtil } from "@/lib/ticketUtils";

Chart.register(...registerables);

interface ExportPDFProps {
  tickets: Ticket[];
}

export default function ExportPDF({ tickets }: ExportPDFProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [isGenerating, setIsGenerating] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);

      // Filter tickets by selected month and year (completed tickets only)
      // Use endTime if available, otherwise fall back to completionDate or submissionDate
      const filteredTickets = tickets.filter((ticket) => {
        if (ticket.status !== "Completado") return false;

        const dateToCheck = ticket.endTime || ticket.completionDate || ticket.submissionDate;
        if (!dateToCheck) return false;

        const checkDate = new Date(dateToCheck);
        return checkDate.getFullYear() === year && checkDate.getMonth() + 1 === month;
      });

      // Count by priority
      const highPriority = filteredTickets.filter((t) => t.priority === "Alta").length;
      const mediumPriority = filteredTickets.filter((t) => t.priority === "Media").length;
      const lowPriority = filteredTickets.filter((t) => t.priority === "Baja").length;

      // Calculate total resolution time with validation
      const { totalSeconds: totalResolutionSeconds, validCount, invalidCount } = calculateTotalValidDuration(filteredTickets);

      const formatResolutionTime = (seconds: number): string => {
        return formatDurationUtil(seconds).replace(/d/g, ' días').replace(/h/g, ' horas').replace(/m/g, ' min');
      };

      // Generate pie chart for priorities
      const generatePieChart = async (): Promise<string> => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve("");
            return;
          }

          new Chart(ctx, {
            type: "pie",
            data: {
              labels: ["Alta", "Media", "Baja"],
              datasets: [
                {
                  data: [highPriority, mediumPriority, lowPriority],
                  backgroundColor: ["#EF4444", "#F97316", "#3B82F6"],
                },
              ],
            },
            options: {
              responsive: false,
              plugins: {
                title: {
                  display: true,
                  text: "Tickets por Prioridad",
                  font: { size: 16 },
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          });

          setTimeout(() => {
            resolve(canvas.toDataURL("image/png"));
          }, 500);
        });
      };

      // Generate line chart for daily progress
      const generateLineChart = async (): Promise<string> => {
        return new Promise((resolve) => {
          // Group tickets by day
          const ticketsByDay: { [key: number]: number } = {};
          const daysInMonth = new Date(year, month, 0).getDate();

          // Initialize all days to 0
          for (let day = 1; day <= daysInMonth; day++) {
            ticketsByDay[day] = 0;
          }

          // Count tickets per day
          filteredTickets.forEach((ticket) => {
            const dateToCheck = ticket.endTime || ticket.completionDate || ticket.submissionDate;
            if (dateToCheck) {
              const day = new Date(dateToCheck).getDate();
              ticketsByDay[day] = (ticketsByDay[day] || 0) + 1;
            }
          });

          // Create cumulative data
          const cumulativeData: number[] = [];
          let cumulative = 0;
          for (let day = 1; day <= daysInMonth; day++) {
            cumulative += ticketsByDay[day];
            cumulativeData.push(cumulative);
          }

          const canvas = document.createElement("canvas");
          canvas.width = 600;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve("");
            return;
          }

          new Chart(ctx, {
            type: "line",
            data: {
              labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
              datasets: [
                {
                  label: "Tickets Completados (Acumulado)",
                  data: cumulativeData,
                  borderColor: "#3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: false,
              plugins: {
                title: {
                  display: true,
                  text: "Progreso Diario de Tickets Completados",
                  font: { size: 16 },
                },
                legend: {
                  display: true,
                  position: "bottom",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Día del Mes",
                  },
                },
              },
            },
          });

          setTimeout(() => {
            resolve(canvas.toDataURL("image/png"));
          }, 500);
        });
      };

      // Generate charts
      const [pieChartImage, lineChartImage] = await Promise.all([
        generatePieChart(),
        generateLineChart(),
      ]);

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("Reporte de Tickets - GoMotors", 14, 20);

      // Month and Year
      const monthName = months.find((m) => m.value === selectedMonth)?.label || "";
      doc.setFontSize(12);
      doc.text(`Mes: ${monthName} ${selectedYear}`, 14, 30);

      // Summary statistics
      doc.setFontSize(14);
      doc.text("Resumen", 14, 45);

      doc.setFontSize(11);
      doc.text(`Total de tickets completados: ${filteredTickets.length}`, 14, 55);
      doc.text(`Prioridad Alta: ${highPriority}`, 14, 62);
      doc.text(`Prioridad Media: ${mediumPriority}`, 14, 69);
      doc.text(`Prioridad Baja: ${lowPriority}`, 14, 76);

      // Show resolution time
      if (totalResolutionSeconds > 0) {
        doc.text(`Tiempo total de resolución: ${formatResolutionTime(totalResolutionSeconds)}`, 14, 83);
        const avgTime = validCount > 0 ? Math.round(totalResolutionSeconds / validCount) : 0;
        doc.text(`Tiempo promedio por ticket: ${formatResolutionTime(avgTime)}`, 14, 90);

        if (invalidCount > 0) {
          doc.setFontSize(9);
          doc.setTextColor(200, 100, 0);
          doc.text(`(${invalidCount} ticket${invalidCount !== 1 ? 's' : ''} con tiempo sospechoso excluido${invalidCount !== 1 ? 's' : ''})`, 14, 97);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
        }
      } else {
        doc.text(`Tiempo total de resolución: No disponible`, 14, 83);
        doc.text(`(Los tickets no tienen tiempo de resolución registrado)`, 14, 90);
      }

      // Add charts page
      if ((pieChartImage || lineChartImage) && filteredTickets.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Gráficos de Análisis", 14, 20);

        // Pie chart
        if (pieChartImage) {
          doc.addImage(pieChartImage, "PNG", 50, 30, 100, 100);
        }

        // Line chart
        if (lineChartImage) {
          doc.addImage(lineChartImage, "PNG", 10, 150, 180, 90);
        }
      }

      // Add new page for table
      doc.addPage();

      // Ticket details table
      if (filteredTickets.length > 0) {
        const tableData = filteredTickets.map((ticket) => [
          ticket.id,
          ticket.title.substring(0, 30) + (ticket.title.length > 30 ? "..." : ""),
          ticket.priority,
          ticket.assignee || "Sin asignar",
          ticket.duration
            ? formatResolutionTime(ticket.duration)
            : "N/A",
        ]);

        doc.setFontSize(14);
        doc.text("Detalle de Tickets", 14, 20);

        autoTable(doc, {
          startY: 30,
          head: [["ID", "Título", "Prioridad", "Asignado a", "Tiempo de Resolución"]],
          body: tableData,
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.setFontSize(11);
        doc.text("No se encontraron tickets completados para este período.", 14, 95);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`Reporte_Tickets_${monthName}_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Reporte PDF
        </CardTitle>
        <CardDescription>
          Selecciona el mes y año para generar un reporte de tickets completados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month-select" className="block text-sm font-medium mb-2">
              Mes
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Selecciona el mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="year-select" className="block text-sm font-medium mb-2">
              Año
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Selecciona el año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generatePDF} disabled={isGenerating} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generando PDF..." : "Descargar Reporte PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
