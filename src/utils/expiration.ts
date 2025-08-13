export function daysUntil(dateString: string): number {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function expirationSeverity(days: number): "critical" | "warning" | "info" {
  if (days <= 30) return "critical";
  if (days <= 90) return "warning";
  return "info";
}


