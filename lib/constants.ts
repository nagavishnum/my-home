export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const CURRENT_YEAR = new Date().getFullYear();

export const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i));

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#fbbf24',
  high: '#f97316',
  mandatory: '#ef4444',
};

export const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
