import { format } from "date-fns";

/**
 * Format an ISO date string as dd/MM/yyyy.
 * Returns the raw string if parsing fails.
 */
export function fmtDate(iso: string): string {
  try {
    return format(new Date(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}
