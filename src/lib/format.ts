/**
 * Consistent formatting utilities that work across SSR boundaries
 * All dates and numbers use fixed formats to prevent hydration mismatches
 */

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Use ISO format: YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
