import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, CalendarX, Activity } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queries, queryKeys } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

const monthlyData = [
  { month: 'Jan', patients: 42, revenue: 18500, appointments: 128 },
  { month: 'Feb', patients: 51, revenue: 22100, appointments: 145 },
  { month: 'Mar', patients: 48, revenue: 19800, appointments: 132 },
  { month: 'Apr', patients: 63, revenue: 27400, appointments: 167 },
  { month: 'May', patients: 71, revenue: 31200, appointments: 189 },
  { month: 'Jun', patients: 66, revenue: 28900, appointments: 178 },
  { month: 'Jul', patients: 79, revenue: 34600, appointments: 201 },
];

export function ReportsPage() {
  const { data: appointments = [] } = useQuery({ queryKey: queryKeys.appointments(), queryFn: () => queries.appointments.list() });
  const { data: patients = [] } = useQuery({ queryKey: queryKeys.patients, queryFn: () => queries.patients.list() });
  const { data: invoices = [] } = useQuery({ queryKey: queryKeys.invoices, queryFn: () => queries.invoices.list() });

  const stats = useMemo(() => {
    const revenue = invoices.reduce((s, i) => s + i.paid_amount, 0);
    const noShow = appointments.filter((a) => a.status === 'no_show').length;
    const noShowRate = appointments.length ? Math.round((noShow / appointments.length) * 100) : 0;
    return { revenue, noShowRate, patientCount: patients.length, apptCount: appointments.length };
  }, [appointments, patients, invoices]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    const colors: Record<string, string> = {
      scheduled: 'hsl(var(--chart-2))', confirmed: 'hsl(var(--chart-1))', completed: 'hsl(var(--chart-3))',
      in_progress: 'hsl(var(--chart-4))', cancelled: 'hsl(var(--muted-foreground))', no_show: 'hsl(var(--destructive))',
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] }));
  }, [appointments]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics and insights across your clinic" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Revenue" value={formatCurrency(stats.revenue)} icon={DollarSign} accent="bg-success" trend={{ value: 18, positive: true }} />
        <StatCard index={1} label="Total Patients" value={stats.patientCount} icon={Users} accent="bg-accent" trend={{ value: 12, positive: true }} />
        <StatCard index={2} label="Appointments" value={stats.apptCount} icon={Activity} accent="bg-primary" trend={{ value: 8, positive: true }} />
        <StatCard index={3} label="No-Show Rate" value={`${stats.noShowRate}%`} icon={CalendarX} accent="bg-warning" trend={{ value: 3, positive: false }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Patient Growth</CardTitle>
            <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> Trending up</Badge>
          </CardHeader>
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

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Appointments per Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                <Bar dataKey="appointments" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appointment Status</CardTitle></CardHeader>
          <CardContent>
            {statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {statusBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
            <div className="mt-2 space-y-1">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="capitalize text-muted-foreground">{s.name.replace('_', ' ')}</span>
                  <span className="ml-auto font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
