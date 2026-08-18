import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  DollarSign, TrendingDown, TrendingUp, Users, CalendarCheck, CalendarX,
  Activity, Clock, Award, Filter, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Select component removed — not used in this file
import { queries, queryKeys } from '@/lib/api';
import { formatCurrency, formatDate, formatTime, appointmentStatusMeta } from '@/lib/format';
import { cn } from '@/lib/utils';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, isToday, isWithinInterval, isSameDay, format, eachDayOfInterval, parseISO } from 'date-fns';

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export function DashboardPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRange>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { data: appointments = [] } = useQuery({ queryKey: queryKeys.appointments, queryFn: () => queries.appointments.list() });
  const { data: patients = [] } = useQuery({ queryKey: queryKeys.patients, queryFn: () => queries.patients.list() });
  const { data: invoices = [] } = useQuery({ queryKey: queryKeys.invoices, queryFn: () => queries.invoices.list() });

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (range) {
      case 'today': return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday': return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
      case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year': return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom': return { start: customFrom ? parseISO(customFrom) : startOfMonth(now), end: customTo ? parseISO(customTo) : endOfMonth(now) };
    }
  }, [range, customFrom, customTo]);

  const stats = useMemo(() => {
    const inRange = (date: string) => {
      const d = new Date(date);
      return isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
    };

    const rangeAppts = appointments.filter((a) => inRange(a.startTime));
    const rangePatients = patients.filter((p) => inRange(p.createdAt));
    const rangeInvoices = invoices.filter((i) => inRange(i.createdAt));

    const revenue = rangeInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const expenses = rangeInvoices.reduce((s, i) => s + i.taxAmount + (i.total - i.paidAmount) * 0.1, 0);
    const netProfit = revenue - expenses;
    const pendingTotal = rangeInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + (i.total - i.paidAmount), 0);

    const completed = rangeAppts.filter((a) => a.status === 'completed');
    const pending = rangeAppts.filter((a) => a.status === 'scheduled' || a.status === 'confirmed');
    const cancelled = rangeAppts.filter((a) => a.status === 'cancelled' || a.status === 'no_show');
    const upcoming = rangeAppts.filter((a) => new Date(a.startTime) > new Date());

    const avgCost = rangeInvoices.length > 0 ? rangeInvoices.reduce((s, i) => s + i.total, 0) / rangeInvoices.length : 0;
    const days = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / 86400000));
    const avgDailyRevenue = revenue / days;

    // Top doctors by appointment count
    const doctorCounts: Record<string, number> = {};
    rangeAppts.forEach((a) => {
      if (a.doctor?.fullName) doctorCounts[a.doctor.fullName] = (doctorCounts[a.doctor.fullName] || 0) + 1;
    });
    const topDoctors = Object.entries(doctorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Top treatments
    const treatmentCounts: Record<string, number> = {};
    rangeAppts.forEach((a) => {
      const type = a.treatmentType || a.title || 'Other';
      treatmentCounts[type] = (treatmentCounts[type] || 0) + 1;
    });
    const topTreatments = Object.entries(treatmentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      revenue, expenses, netProfit, pendingTotal,
      patientsToday: patients.filter((p) => isToday(new Date(p.createdAt))).length,
      patientsThisMonth: patients.filter((p) => isWithinInterval(new Date(p.createdAt), { start: startOfMonth(new Date()), end: endOfMonth(new Date()) })).length,
      newPatients: rangePatients.length,
      completed: completed.length, pending: pending.length, cancelled: cancelled.length, upcoming: upcoming.length,
      avgCost, avgDailyRevenue,
      topDoctors, topTreatments,
      rangeAppts,
    };
  }, [appointments, patients, invoices, dateRange]);

  // Revenue chart data
  const revenueChart = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map((day) => {
      const dayRevenue = invoices
        .filter((i) => isSameDay(new Date(i.createdAt), day))
        .reduce((s, i) => s + i.paidAmount, 0);
      const dayExpenses = invoices
        .filter((i) => isSameDay(new Date(i.createdAt), day))
        .reduce((s, i) => s + i.taxAmount, 0);
      return { date: format(day, 'MMM d'), revenue: dayRevenue, expenses: dayExpenses };
    });
  }, [invoices, dateRange]);

  // Patient growth chart
  const patientGrowth = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    let cumulative = patients.filter((p) => new Date(p.createdAt) < dateRange.start).length;
    return days.map((day) => {
      cumulative += patients.filter((p) => isSameDay(new Date(p.createdAt), day)).length;
      return { date: format(day, 'MMM d'), patients: cumulative };
    });
  }, [patients, dateRange]);

  // Treatment distribution
  const treatmentDist = useMemo(() => {
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    return stats.topTreatments.map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [stats.topTreatments]);

  const todayAppointments = useMemo(
    () => appointments.filter((a) => isToday(new Date(a.startTime))).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 6),
    [appointments],
  );

  const rangeLabel = range === 'custom' ? `${formatDate(dateRange.start.toISOString())} - ${formatDate(dateRange.end.toISOString())}` : t(`common.${range === 'today' ? 'today' : range === 'yesterday' ? 'yesterday' : range === 'week' ? 'thisWeek' : range === 'month' ? 'thisMonth' : 'thisYear'}`);

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={`${t('dashboard.description')}, ${format(new Date(), 'EEEE, MMM d')}`} />

      {/* Date range filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {(['today', 'yesterday', 'week', 'month', 'year', 'custom'] as DateRange[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={() => setRange(r)}
              >
                {r === 'today' ? t('common.today') : r === 'yesterday' ? t('common.yesterday') : r === 'week' ? t('common.thisWeek') : r === 'month' ? t('common.thisMonth') : r === 'year' ? t('common.thisYear') : t('common.customRange')}
              </Button>
            ))}
          </div>
        </div>
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-auto" />
            <span className="text-xs text-muted-foreground">{t('common.to')}</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-auto" />
          </div>
        )}
        <Badge variant="secondary">{rangeLabel}</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('dashboard.totalRevenue')} value={formatCurrency(stats.revenue)} icon={DollarSign} accent="bg-success" trend={{ value: 18, positive: true }} />
        <StatCard index={1} label={t('dashboard.netProfit')} value={formatCurrency(stats.netProfit)} icon={TrendingUp} accent="bg-primary" trend={{ value: 12, positive: stats.netProfit > 0 }} />
        <StatCard index={2} label={t('dashboard.pendingPayments')} value={formatCurrency(stats.pendingTotal)} icon={TrendingDown} accent="bg-warning" trend={{ value: 5, positive: false }} />
        <StatCard index={3} label={t('dashboard.newPatients')} value={stats.newPatients} icon={Users} accent="bg-accent" trend={{ value: 24, positive: true }} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={4} label={t('dashboard.completedTreatments')} value={stats.completed} icon={CheckCircle2} accent="bg-success" />
        <StatCard index={5} label={t('dashboard.pendingTreatments')} value={stats.pending} icon={Clock} accent="bg-warning" />
        <StatCard index={6} label={t('dashboard.cancelledAppointments')} value={stats.cancelled} icon={CalendarX} accent="bg-destructive" />
        <StatCard index={7} label={t('dashboard.upcomingAppointments')} value={stats.upcoming} icon={CalendarCheck} accent="bg-accent" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t('dashboard.revenueExpenses')}</CardTitle>
            <Badge variant="secondary">{rangeLabel}</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChart} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).replace(/\.\d+/, '')} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('dashboard.treatmentStatistics')}</CardTitle></CardHeader>
          <CardContent>
            {treatmentDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={treatmentDist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {treatmentDist.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {treatmentDist.map((t) => (
                    <div key={t.name} className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
                      <span className="text-muted-foreground">{t.name}</span>
                      <span className="ml-auto font-medium">{t.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">{t('common.noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient growth + Top doctors */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t('dashboard.patientGrowth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={patientGrowth} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="patients" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="h-4 w-4 text-primary" />{t('dashboard.topDoctors')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.topDoctors.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
            ) : (
              stats.topDoctors.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{name}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule + Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t('dashboard.todaysSchedule')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <CalendarX className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t('dashboard.noAppointmentsToday')}</p>
              </div>
            ) : (
              todayAppointments.map((apt, i) => {
                const meta = appointmentStatusMeta(apt.status);
                return (
                  <motion.div key={apt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className="text-sm font-semibold">{formatTime(apt.startTime)}</span>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown'}</p>
                      <p className="truncate text-xs text-muted-foreground">{apt.treatmentType || apt.title || apt.chair}</p>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>{meta.label}</span>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('dashboard.clinicOverview')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <OverviewRow icon={Users} label={t('dashboard.totalPatients')} value={patients.length} color="text-accent" />
            <OverviewRow icon={CalendarCheck} label={t('dashboard.appointmentsAll')} value={appointments.length} color="text-primary" />
            <OverviewRow icon={CalendarX} label={t('dashboard.noShowRate')} value={`${appointments.length ? Math.round((appointments.filter((a) => a.status === 'no_show').length / appointments.length) * 100) : 0}%`} color="text-destructive" />
            <OverviewRow icon={DollarSign} label={t('dashboard.pendingInvoices')} value={invoices.filter((i) => i.status !== 'paid').length} color="text-warning" />
            <OverviewRow icon={Activity} label={t('dashboard.averageTreatmentCost')} value={formatCurrency(stats.avgCost)} color="text-primary" />
            <OverviewRow icon={TrendingUp} label={t('dashboard.averageDailyRevenue')} value={formatCurrency(stats.avgDailyRevenue)} color="text-success" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewRow({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('rounded-lg bg-muted p-2', color)}><Icon className="h-4 w-4" /></div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-semibold">{value}</span>
    </div>
  );
}
