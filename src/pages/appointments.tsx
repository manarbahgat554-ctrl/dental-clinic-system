import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  User,
  Loader2,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { queries, queryKeys } from '@/lib/api';
import { appointmentStatusMeta, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';

type ViewMode = 'day' | 'week' | 'month';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Select a patient'),
  title: z.string().optional(),
  treatment_type: z.string().optional(),
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Select a time'),
  duration: z.coerce.number().min(15).max(480),
  chair: z.string().default('Chair 1'),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-accent',
  confirmed: 'bg-primary',
  in_progress: 'bg-warning',
  completed: 'bg-success',
  cancelled: 'bg-muted-foreground',
  no_show: 'bg-destructive',
};

export function AppointmentsPage() {
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const range = useMemo(() => {
    if (view === 'day') {
      return { from: startOfDay(currentDate).toISOString(), to: endOfDay(currentDate).toISOString() };
    }
    if (view === 'week') {
      return {
        from: startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
      };
    }
    return {
      from: startOfMonth(currentDate).toISOString(),
      to: endOfMonth(currentDate).toISOString(),
    };
  }, [view, currentDate]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: queryKeys.appointments(range),
    queryFn: () => queries.appointments.list(range),
  });

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<Appointment>) => queries.appointments.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment scheduled');
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      queries.appointments.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status updated');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>({ resolver: zodResolver(appointmentSchema) });

  const onSubmit = (values: AppointmentForm) => {
    const startTime = new Date(`${values.date}T${values.time}`);
    const endTime = new Date(startTime.getTime() + values.duration * 60000);
    createMutation.mutate({
      patient_id: values.patient_id,
      title: values.title || null,
      treatment_type: values.treatment_type || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_min: values.duration,
      chair: values.chair,
      notes: values.notes || null,
    });
  };

  const openNew = (date?: Date) => {
    reset({
      date: format(date ?? selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      duration: 30,
      chair: 'Chair 1',
    });
    setDialogOpen(true);
  };

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.start_time), day));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Schedule and manage patient appointments"
        actions={
          <Button onClick={() => openNew()}>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        }
      />

      {/* Calendar controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[160px] text-center font-display text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex rounded-lg border p-0.5">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              className="h-8 capitalize"
              onClick={() => setView(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : view === 'month' ? (
            <MonthView
              currentDate={currentDate}
              appointments={appointments}
              onSelectDay={(day) => { setSelectedDate(day); openNew(day); }}
              onAppointmentClick={(apt) => setSelectedDate(new Date(apt.start_time))}
            />
          ) : view === 'week' ? (
            <WeekView
              currentDate={currentDate}
              appointments={appointments}
              onSelectDay={(day) => { setSelectedDate(day); openNew(day); }}
            />
          ) : (
            <DayView
              date={currentDate}
              appointments={getAppointmentsForDay(currentDate)}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a patient visit</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <select
                id="patient_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register('patient_id')}
              >
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
              {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register('date')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" {...register('time')} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" step="15" {...register('duration')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chair">Chair</Label>
                <select id="chair" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register('chair')}>
                  <option>Chair 1</option>
                  <option>Chair 2</option>
                  <option>Chair 3</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment_type">Treatment Type</Label>
              <Input id="treatment_type" placeholder="e.g. Cleaning, Filling" {...register('treatment_type')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} {...register('notes')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MonthView({
  currentDate,
  appointments,
  onSelectDay,
}: {
  currentDate: Date;
  appointments: Appointment[];
  onSelectDay: (day: Date) => void;
  onAppointmentClick: (apt: Appointment) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-1 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayAppts = appointments.filter((a) => isSameDay(new Date(a.start_time), day));
          const inMonth = isSameMonth(day, currentDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                'min-h-[80px] rounded-lg border p-1.5 text-left transition-all hover:border-primary/40',
                !inMonth && 'opacity-40',
                isToday(day) && 'border-primary bg-primary/5',
              )}
            >
              <span className={cn('text-xs font-medium', isToday(day) && 'text-primary')}>{format(day, 'd')}</span>
              <div className="mt-1 space-y-0.5">
                {dayAppts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn('truncate rounded px-1 py-0.5 text-[10px] font-medium text-white', STATUS_COLORS[apt.status])}
                  >
                    {formatTime(apt.start_time)} {apt.patient ? `${apt.patient.first_name}` : ''}
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{dayAppts.length - 3} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  appointments,
  onSelectDay,
}: {
  currentDate: Date;
  appointments: Appointment[];
  onSelectDay: (day: Date) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM - 5 PM

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
          <div />
          {days.map((day) => (
            <div key={day.toISOString()} className={cn('text-center', isToday(day) && 'text-primary')}>
              <p className="text-xs font-semibold uppercase">{format(day, 'EEE')}</p>
              <p className={cn('text-lg font-bold', isToday(day) && 'text-primary')}>{format(day, 'd')}</p>
            </div>
          ))}
          {hours.map((hour) => (
            <>
              <div key={`h${hour}`} className="py-2 text-right text-xs text-muted-foreground">{hour}:00</div>
              {days.map((day) => {
                const slotAppts = appointments.filter((a) => {
                  const aptDate = new Date(a.start_time);
                  return isSameDay(aptDate, day) && aptDate.getHours() === hour;
                });
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    onClick={() => onSelectDay(day)}
                    className="min-h-[48px] rounded-md border p-1 transition-colors hover:border-primary/40"
                  >
                    {slotAppts.map((apt) => {
                      const meta = appointmentStatusMeta(apt.status);
                      return (
                        <div
                          key={apt.id}
                          className={cn('truncate rounded px-1.5 py-1 text-[10px] font-medium', meta.bg, meta.color)}
                        >
                          {formatTime(apt.start_time)} {apt.patient?.first_name}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayView({
  date,
  appointments,
  onStatusChange,
}: {
  date: Date;
  appointments: Appointment[];
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}) {
  const sorted = [...appointments].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{format(date, 'EEEE, MMMM d')}</p>
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No appointments today</p>
        </div>
      ) : (
        sorted.map((apt, i) => {
          const meta = appointmentStatusMeta(apt.status);
          return (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex w-20 flex-col items-center">
                <span className="text-sm font-bold">{formatTime(apt.start_time)}</span>
                <span className="text-xs text-muted-foreground">{apt.duration_min}min</span>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Patient'}
                </p>
                <p className="text-xs text-muted-foreground">{apt.treatment_type || apt.title || apt.chair}</p>
              </div>
              <select
                value={apt.status}
                onChange={(e) => onStatusChange(apt.id, e.target.value as AppointmentStatus)}
                className={cn('h-8 rounded-md border border-input bg-background px-2 text-xs font-medium', meta.color)}
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
