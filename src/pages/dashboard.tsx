import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  CalendarCheck,
  DollarSign,
  TrendingDown,
  Clock,
  UserPlus,
  CalendarX,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queries, queryKeys } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatTime,
  appointmentStatusMeta,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { startOfDay, endOfDay, isToday, format } from 'date-fns';

const revenueData = [
  { month: 'Jan', revenue: 18500, expenses: 9200 },
  { month: 'Feb', revenue: 22100, expenses: 10100 },
  { month: 'Mar', revenue: 19800, expenses: 9800 },
  { month: 'Apr', revenue: 27400, expenses: 11200 },
  { month: 'May', revenue: 31200, expenses: 12400 },
  { month: 'Jun', revenue: 28900, expenses: 11900 },
  { month: 'Jul', revenue: 34600, expenses: 13800 },
];

const treatmentData = [
  { name: 'Cleaning', value: 142, color: 'hsl(var(--chart-1))' },
  { name: 'Filling', value: 89, color: 'hsl(var(--chart-2))' },
  { name: 'Root Canal', value: 34, color: 'hsl(var(--chart-4))' },
  { name: 'Implant', value: 21, color: 'hsl(var(--chart-5))' },
  { name: 'Crown', value: 56, color: 'hsl(var(--chart-3))' },
];

export function DashboardPage() {
  const { data: appointments = [] } = useQuery({
    queryKey: queryKeys.appointments(),
    queryFn: () => queries.appointments.list(),
  });
  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => queries.invoices.list(),
  });

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) => isToday(new Date(a.start_time)));
    const newPatients = patients.filter(
      (p) => new Date(p.created_at).getMonth() === new Date().getMonth(),
    );
    const noShow = appointments.filter((a) => a.status === 'no_show');
    const pendingPayments = invoices.filter(
      (i) => i.status === 'unpaid' || i.status === 'partial' || i.status === 'overdue',
    );
    const pendingTotal = pendingPayments.reduce((sum, i) => sum + (i.total - i.paid_amount), 0);
    const revenue = invoices
      .filter((i) => i.status === 'paid' || i.status === 'partial')
      .reduce((sum, i) => sum + i.paid_amount, 0);

    return {
      todayAppts: todayAppts.length,
      todayPatients: new Set(todayAppts.map((a) => a.patient_id)).size,
      newPatients: newPatients.length,
      noShow: noShow.length,
      pendingCount: pendingPayments.length,
      pendingTotal,
      revenue,
    };
  }, [appointments, patients, invoices]);

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => isToday(new Date(a.start_time)))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 6),
    [appointments],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back — here's what's happening at your clinic today, ${format(new Date(), 'EEEE, MMM d')}`}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Today's Appointments"
          value={stats.todayAppts}
          icon={CalendarCheck}
          accent="bg-accent"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          index={1}
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          accent="bg-success"
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          index={2}
          label="Pending Payments"
          value={formatCurrency(stats.pendingTotal)}
          icon={TrendingDown}
          accent="bg-warning"
          trend={{ value: 5, positive: false }}
        />
        <StatCard
          index={3}
          label="New Patients"
          value={stats.newPatients}
          icon={UserPlus}
          accent="bg-primary"
          trend={{ value: 24, positive: true }}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Revenue & Expenses</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" /> Last 7 months
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--chart-4))" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Treatment Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={treatmentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {treatmentData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {treatmentData.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="ml-auto font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Today's Schedule</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <CalendarX className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppointments.map((apt, i) => {
                const meta = appointmentStatusMeta(apt.status);
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className="text-sm font-semibold">{formatTime(apt.start_time)}</span>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {apt.patient
                          ? `${apt.patient.first_name} ${apt.patient.last_name}`
                          : 'Unknown patient'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {apt.treatment_type || apt.title || apt.chair}
                      </p>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>
                      {meta.label}
                    </span>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick stats / activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinic Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OverviewRow icon={Users} label="Total Patients" value={patients.length} color="text-accent" />
            <OverviewRow icon={CalendarCheck} label="Appointments (all)" value={appointments.length} color="text-primary" />
            <OverviewRow icon={CalendarX} label="No-Show Rate" value={`${appointments.length ? Math.round((stats.noShow / appointments.length) * 100) : 0}%`} color="text-destructive" />
            <OverviewRow icon={DollarSign} label="Pending Invoices" value={stats.pendingCount} color="text-warning" />

            <div className="mt-2 rounded-lg border bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Monthly Growth</span>
              </div>
              <ResponsiveContainer width="100%" height={70}>
                <BarChart data={revenueData.slice(-4)}>
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <XAxis dataKey="month" className="text-[10px]" tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('rounded-lg bg-muted p-2', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-semibold">{value}</span>
    </div>
  );
}
