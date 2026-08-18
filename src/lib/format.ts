import { format, formatDistanceToNow, parseISO, differenceInYears } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useClinicSettings } from '@/stores/clinic-settings';

const dateLocales: Record<string, typeof enUS> = { en: enUS, ar: ar };

function getDateLocale() {
  const lang = useClinicSettings.getState().language;
  return dateLocales[lang] ?? enUS;
}

export function formatDate(date: string | Date | null, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: getDateLocale() });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy · h:mm a', { locale: getDateLocale() });
}

export function formatTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a', { locale: getDateLocale() });
}

export function timeAgo(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale() });
}

export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  return differenceInYears(new Date(), parseISO(dateOfBirth));
}

export function initials(first: string, last = ''): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function formatCurrency(amount: number): string {
  const { currencyCode, language } = useClinicSettings.getState();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = useClinicSettings.getState().currencySymbol;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

const TOOTH_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  healthy: { label: 'Healthy', color: 'text-success', bg: 'bg-success/15' },
  needs_treatment: { label: 'Needs Treatment', color: 'text-warning', bg: 'bg-warning/15' },
  completed: { label: 'Completed', color: 'text-primary', bg: 'bg-primary/15' },
  temporary: { label: 'Temporary', color: 'text-accent', bg: 'bg-accent/15' },
  missing: { label: 'Missing', color: 'text-muted-foreground', bg: 'bg-muted' },
  implant: { label: 'Implant', color: 'text-chart-5', bg: 'bg-chart-5/15' },
  root_canal: { label: 'Root Canal', color: 'text-chart-4', bg: 'bg-chart-4/15' },
  bridge: { label: 'Bridge', color: 'text-chart-2', bg: 'bg-chart-2/15' },
  crown: { label: 'Crown', color: 'text-chart-3', bg: 'bg-chart-3/15' },
  filling: { label: 'Filling', color: 'text-primary', bg: 'bg-primary/15' },
  extraction: { label: 'Extraction', color: 'text-destructive', bg: 'bg-destructive/15' },
  veneer: { label: 'Veneer', color: 'text-accent', bg: 'bg-accent/15' },
  caries: { label: 'Caries', color: 'text-warning', bg: 'bg-warning/15' },
  fracture: { label: 'Fracture', color: 'text-destructive', bg: 'bg-destructive/15' },
};

export function toothStatusMeta(status: string) {
  return TOOTH_STATUS_META[status] ?? TOOTH_STATUS_META.healthy;
}

const APPOINTMENT_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-accent', bg: 'bg-accent/15' },
  confirmed: { label: 'Confirmed', color: 'text-primary', bg: 'bg-primary/15' },
  in_progress: { label: 'In Progress', color: 'text-warning', bg: 'bg-warning/15' },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/15' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted' },
  no_show: { label: 'No Show', color: 'text-destructive', bg: 'bg-destructive/15' },
};
export function appointmentStatusMeta(status: string) {
  return APPOINTMENT_STATUS_META[status] ?? APPOINTMENT_STATUS_META.scheduled;
}
const INVOICE_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/15' },
  partial: { label: 'Partial', color: 'text-accent', bg: 'bg-accent/15' },
  paid: { label: 'Paid', color: 'text-success', bg: 'bg-success/15' },
  overdue: { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/15' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted' },
};
export function invoiceStatusMeta(status: string) {
  const s = String(status ?? '').toLowerCase();
  return INVOICE_STATUS_META[s] ?? INVOICE_STATUS_META.pending;
}

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: 'text-primary', bg: 'bg-primary/15' },
  doctor: { label: 'Doctor', color: 'text-accent', bg: 'bg-accent/15' },
  receptionist: { label: 'Receptionist', color: 'text-chart-5', bg: 'bg-chart-5/15' },
  assistant: { label: 'Assistant', color: 'text-chart-3', bg: 'bg-chart-3/15' },
  lab_technician: { label: 'Lab Tech', color: 'text-chart-4', bg: 'bg-chart-4/15' },
};

export function roleMeta(role: string) {
  return ROLE_META[role] ?? ROLE_META.doctor;
}

export function getToothColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: '#10b981',
    needs_treatment: '#f59e0b',
    completed: '#14b8a6',
    temporary: '#0ea5e9',
    missing: '#64748b',
    implant: '#a855f7',
    root_canal: '#f97316',
    bridge: '#0284c7',
    crown: '#22c55e',
    filling: '#14b8a6',
    extraction: '#ef4444',
    veneer: '#06b6d4',
    caries: '#f59e0b',
    fracture: '#dc2626',
  };
  return colors[status] ?? '#10b981';
}
