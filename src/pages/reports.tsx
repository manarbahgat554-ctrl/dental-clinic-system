import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, CalendarX, Activity, FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { queries, queryKeys } from '@/lib/api';
import { formatCurrency, formatDate, appointmentStatusMeta } from '@/lib/format';
import { exportReport, type ExportFormat } from '@/lib/export';
import { format, isToday, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const REPORT_TYPES = [
  'dailyRevenue', 'monthlyRevenue', 'yearlyRevenue',
  'patientsReport', 'doctorsReport', 'appointmentsReport',
  'treatmentsReport', 'invoicesReport', 'inventoryReport', 'labOrdersReport',
];

export function ReportsPage() {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('monthlyRevenue');

  const { data: appointments = [] } = useQuery({ queryKey: queryKeys.appointments, queryFn: () => queries.appointments.list() });
  const { data: patients = [] } = useQuery({ queryKey: queryKeys.patients, queryFn: () => queries.patients.list() });
  const { data: invoices = [] } = useQuery({ queryKey: queryKeys.invoices, queryFn: () => queries.invoices.list() });
  const { data: inventory = [] } = useQuery({ queryKey: queryKeys.inventory, queryFn: () => queries.inventory.list() });
  const { data: labOrders = [] } = useQuery({ queryKey: queryKeys.labOrders, queryFn: () => queries.labOrders.list() });

  const stats = useMemo(() => {
    const revenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const noShow = appointments.filter((a) => a.status === 'no_show');
    const noShowRate = appointments.length ? Math.round((noShow.length / appointments.length) * 100) : 0;
    return { revenue, noShowRate, patientCount: patients.length, apptCount: appointments.length };
  }, [appointments, patients, invoices]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { revenue: number; patients: number; appointments: number }> = {};
    invoices.forEach((inv) => {
      const m = format(new Date(inv.createdAt), 'MMM yyyy');
      if (!months[m]) months[m] = { revenue: 0, patients: 0, appointments: 0 };
      months[m].revenue += inv.paidAmount;
    });
    patients.forEach((p) => {
      const m = format(new Date(p.createdAt), 'MMM yyyy');
      if (!months[m]) months[m] = { revenue: 0, patients: 0, appointments: 0 };
      months[m].patients += 1;
    });
    appointments.forEach((a) => {
      const m = format(new Date(a.startTime), 'MMM yyyy');
      if (!months[m]) months[m] = { revenue: 0, patients: 0, appointments: 0 };
      months[m].appointments += 1;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [invoices, patients, appointments]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    const colors: Record<string, string> = {
      scheduled: 'hsl(var(--chart-2))', confirmed: 'hsl(var(--chart-1))', completed: 'hsl(var(--chart-3))',
      in_progress: 'hsl(var(--chart-4))', cancelled: 'hsl(var(--muted-foreground))', no_show: 'hsl(var(--destructive))',
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] ?? 'hsl(var(--chart-5))' }));
  }, [appointments]);

  const handleExport = (fmt: ExportFormat) => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let summary: { label: string; value: string | number }[] = [];

    switch (reportType) {
      case 'dailyRevenue':
      case 'monthlyRevenue':
      case 'yearlyRevenue': {
        headers = [t('common.date'), t('dashboard.totalRevenue'), t('dashboard.appointmentsAll'), t('dashboard.newPatients')];
        rows = monthlyData.map((d) => [d.month, formatCurrency(d.revenue), d.appointments, d.patients]);
        summary = [{ label: t('dashboard.totalRevenue'), value: formatCurrency(stats.revenue) }];
        break;
      }
      case 'patientsReport': {
        headers = [t('patients.firstName'), t('patients.lastName'), t('common.phone'), t('common.email'), t('common.date')];
        rows = patients.map((p) => [p.firstName, p.lastName, p.phone ?? '—', p.email ?? '—', formatDate(p.createdAt)]);
        summary = [{ label: t('dashboard.totalPatients'), value: stats.patientCount }];
        break;
      }
      case 'doctorsReport': {
        const docCounts: Record<string, number> = {};
        appointments.forEach((a) => { if (a.doctor?.fullName) docCounts[a.doctor.fullName] = (docCounts[a.doctor.fullName] || 0) + 1; });
        headers = [t('roles.doctor'), t('dashboard.appointmentsAll')];
        rows = Object.entries(docCounts).map(([name, count]) => [name, count]);
        break;
      }
      case 'appointmentsReport': {
        headers = [t('common.date'), t('patients.title'), t('appointments.treatmentType'), t('common.status')];
        rows = appointments.map((a) => [formatDate(a.startTime), a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—', a.treatmentType ?? '—', a.status]);
        break;
      }
      case 'invoicesReport': {
        headers = [t('billing.invoiceNumber'), t('patients.title'), t('common.total'), t('common.paid'), t('common.status')];
        rows = invoices.map((i) => [i.invoiceNumber, i.patient ? `${i.patient.firstName} ${i.patient.lastName}` : '—', formatCurrency(i.total), formatCurrency(i.paidAmount), i.status]);
        summary = [{ label: t('dashboard.totalRevenue'), value: formatCurrency(stats.revenue) }];
        break;
      }
      case 'inventoryReport': {
        headers = [t('inventory.item'), t('inventory.category'), t('inventory.stock'), t('inventory.minStock'), t('inventory.supplier')];
        rows = inventory.map((i) => [i.name, i.category ?? '—', i.quantity, i.minQuantity, i.supplier ?? '—']);
        break;
      }
      case 'labOrdersReport': {
        headers = [t('labOrders.workType'), t('patients.title'), t('labOrders.labName'), t('common.status'), t('common.date')];
        rows = labOrders.map((o) => [o.workType, o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—', o.labName ?? '—', o.status, formatDate(o.createdAt)]);
        break;
      }
      default: {
        headers = [t('patients.title'), t('appointments.treatmentType'), t('common.status'), t('common.date')];
        rows = appointments.map((a) => [a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—', a.treatmentType ?? '—', a.status, formatDate(a.startTime)]);
      }
    }

    if (rows.length === 0) {
      toast.error(t('reports.noData'));
      return;
    }

    exportReport(fmt, t(`reports.${reportType}`), headers, rows, summary);
    toast.success(t('reports.reportExported'));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('reports.title')} description={t('reports.description')} />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('reports.totalRevenue')} value={formatCurrency(stats.revenue)} icon={DollarSign} accent="bg-success" trend={{ value: 18, positive: true }} />
        <StatCard index={1} label={t('reports.totalPatients')} value={stats.patientCount} icon={Users} accent="bg-accent" trend={{ value: 12, positive: true }} />
        <StatCard index={2} label={t('reports.appointments')} value={stats.apptCount} icon={Activity} accent="bg-primary" trend={{ value: 8, positive: true }} />
        <StatCard index={3} label={t('reports.noShowRate')} value={`${stats.noShowRate}%`} icon={CalendarX} accent="bg-warning" trend={{ value: 3, positive: false }} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t('reports.revenueTrend')}</CardTitle>
            <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />{t('reports.trendingUp')}</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).replace(/\.\d+/, '')} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('reports.patientGrowth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="patients" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-5 w-5 text-primary" />{t('reports.exportReport')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('reports.reportType')}</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((r) => <SelectItem key={r} value={r}>{t(`reports.${r}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExport('pdf')} variant="outline">
              <FileText className="mr-2 h-4 w-4" />{t('reports.exportPDF')}
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />{t('reports.exportExcel')}
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline">
              <FileDown className="mr-2 h-4 w-4" />{t('reports.exportCSV')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
