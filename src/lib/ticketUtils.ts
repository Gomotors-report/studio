import type { Ticket } from "@/types";

/**
 * Validates if a ticket's duration is reasonable
 * Returns true if duration seems correct, false if suspicious
 *
 * Strategy: Only mark as suspicious if it's OBVIOUSLY wrong
 * (e.g., worked "3 days" on something that should be 3 hours)
 */
export function isValidDuration(ticket: Ticket): boolean {
  if (!ticket.duration || !ticket.startTime || !ticket.endTime) {
    return false;
  }

  // Calculate the total elapsed time between start and end
  const startMs = new Date(ticket.startTime).getTime();
  const endMs = new Date(ticket.endTime).getTime();
  const elapsedSeconds = (endMs - startMs) / 1000;

  // Duration should never exceed elapsed time (with margin for clock skew)
  if (ticket.duration > elapsedSeconds + 300) {
    console.warn(`[${ticket.id}] Duration exceeds elapsed time: ${ticket.duration}s > ${elapsedSeconds}s`);
    return false;
  }

  // Calculate hours
  const durationHours = ticket.duration / 3600;
  const elapsedHours = elapsedSeconds / 3600;

  // Only mark as suspicious if duration is unreasonably long
  // (more than 12 hours of actual work time)
  if (durationHours > 12) {
    // If someone claims to have worked more than 12 continuous hours, check the ratio
    const ratio = ticket.duration / elapsedSeconds;

    // If it spans multiple days AND duration is high, it's likely they forgot to pause
    if (elapsedHours > 24 && ratio > 0.3) {
      console.warn(`[${ticket.id}] Suspicious: ${durationHours.toFixed(1)}h duration over ${elapsedHours.toFixed(1)}h elapsed (${(ratio * 100).toFixed(1)}%)`);
      return false;
    }
  }

  // Accept everything else as valid
  return true;
}

/**
 * Gets the real working duration, filtering out suspicious values
 */
export function getValidDuration(ticket: Ticket): number | null {
  if (!ticket.duration) return null;

  // If validation passes, return the duration
  if (isValidDuration(ticket)) {
    return ticket.duration;
  }

  // For suspicious durations, return null
  return null;
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return "0 min";

  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.join(" ");
}

/**
 * Calculate total duration excluding suspicious tickets
 */
export function calculateTotalValidDuration(tickets: Ticket[]): {
  totalSeconds: number;
  validCount: number;
  invalidCount: number;
} {
  let totalSeconds = 0;
  let validCount = 0;
  let invalidCount = 0;

  tickets.forEach((ticket) => {
    if (ticket.status !== "Completado") return;

    const duration = getValidDuration(ticket);
    if (duration !== null) {
      totalSeconds += duration;
      validCount++;
    } else if (ticket.duration) {
      invalidCount++;
    }
  });

  return { totalSeconds, validCount, invalidCount };
}
