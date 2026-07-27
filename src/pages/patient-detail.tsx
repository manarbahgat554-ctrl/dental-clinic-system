import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Activity,
  ShieldAlert,
  Pill,
  Cigarette,
  Baby,
  Stethoscope,
  FileText,
  ClipboardList,
  Droplet,
  Edit3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { queries, queryKeys } from '@/lib/api';
import {
  initials,
  calculateAge,
  formatDate,
  formatCurrency,
  appointmentStatusMeta,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { PatientDentalChart } from '@/components/dental/patient-dental-chart';
import { Loader2 } from 'lucide-react';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('overview');

  const { data: patient, isLoading } = useQuery({
    queryKey: queryKeys.patient(id!),
    queryFn: () => queries.patients.get(id!),
    enabled: !!id,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: queryKeys.appointments(),
    queryFn: () => queries.appointments.list(),
  });

  const { data: treatments = [] } = useQuery({
    queryKey: queryKeys.treatments(id!),
    queryFn: () => queries.treatments.listByPatient(id!),
    enabled: !!id,
  });

  const patientAppts = appointments.filter((a) => a.patient_id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-muted-foreground">Patient not found</p>
        <Link to="/app/patients">
          <Button variant="outline">Back to patients</Button>
        </Link>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);
  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <div className="space-y-6">
      <Link to="/app/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
          <CardContent className="-mt-10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar className="h-20 w-20 border-4 border-card">
                  <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                    {initials(patient.first_name, patient.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h1 className="font-display text-2xl font-bold tracking-tight">{fullName}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {age && <span>{age} years old</span>}
                    {patient.gender && <span className="capitalize">· {patient.gender}</span>}
                    {patient.blood_group && (
                      <span className="flex items-center gap-1">
                        · <Droplet className="h-3 w-3" /> {patient.blood_group}
                      </span>
                    )}
                    <Badge variant={patient.status === 'active' ? 'default' : 'secondary'} className="ml-1">
                      {patient.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoChip icon={Phone} label="Phone" value={patient.phone} />
              <InfoChip icon={Mail} label="Email" value={patient.email} />
              <InfoChip icon={Calendar} label="DOB" value={patient.date_of_birth ? formatDate(patient.date_of_birth) : null} />
              <InfoChip icon={MapPin} label="Address" value={patient.address} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
          <TabsTrigger value="overview"><ClipboardList className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="medical"><Heart className="mr-1.5 h-4 w-4" />Medical</TabsTrigger>
          <TabsTrigger value="dental"><Activity className="mr-1.5 h-4 w-4" />Dental Chart</TabsTrigger>
          <TabsTrigger value="timeline"><FileText className="mr-1.5 h-4 w-4" />Timeline</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Appointments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {patientAppts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No appointments yet</p>
                ) : (
                  patientAppts.slice(0, 5).map((apt) => {
                    const meta = appointmentStatusMeta(apt.status);
                    return (
                      <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{apt.treatment_type || apt.title || 'Appointment'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(apt.start_time)}</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>
                          {meta.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Treatment Plans</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {treatments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No treatments yet</p>
                ) : (
                  treatments.slice(0, 5).map((t) => (
                    <div key={t.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{t.name}</p>
                        <span className="text-xs font-medium text-primary">{formatCurrency(t.estimated_cost)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{t.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical */}
        <TabsContent value="medical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MedicalCard icon={ShieldAlert} title="Allergies" value={patient.allergies} danger />
            <MedicalCard icon={Pill} title="Current Medications" value={patient.current_medications} />
            <MedicalCard icon={Cigarette} title="Smoking" value={patient.smoking ? 'Yes' : 'No'} />
            <MedicalCard icon={Baby} title="Pregnancy" value={patient.pregnant ? 'Yes' : 'No'} />
            <MedicalCard icon={Activity} title="Blood Pressure" value={patient.blood_pressure} />
            <MedicalCard icon={Heart} title="Heart Disease" value={patient.heart_disease ? 'Yes' : 'No'} />
            <MedicalCard icon={Activity} title="Diabetes" value={patient.diabetes ? 'Yes' : 'No'} />
            <MedicalCard icon={Stethoscope} title="Previous Surgeries" value={patient.previous_surgeries} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Insurance & Emergency</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Insurance Provider</p>
                <p className="mt-1 text-sm font-medium">{patient.insurance_provider || '—'}</p>
                <Separator className="my-3" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Policy Number</p>
                <p className="mt-1 text-sm font-medium">{patient.insurance_number || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Emergency Contact</p>
                <p className="mt-1 text-sm font-medium">{patient.emergency_contact_name || '—'}</p>
                <Separator className="my-3" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Emergency Phone</p>
                <p className="mt-1 text-sm font-medium">{patient.emergency_contact_phone || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dental chart */}
        <TabsContent value="dental">
          <PatientDentalChart patientId={patient.id} />
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <Timeline patientAppts={patientAppts} treatments={treatments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5">
      <div className="rounded-lg bg-muted p-1.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

function MedicalCard({
  icon: Icon,
  title,
  value,
  danger,
}: {
  icon: typeof Heart;
  title: string;
  value: string | null | undefined;
  danger?: boolean;
}) {
  return (
    <Card className={cn(danger && value && value !== 'No' && 'border-warning/40')}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('rounded-lg p-2.5', danger ? 'bg-warning/15' : 'bg-muted')}>
          <Icon className={cn('h-4 w-4', danger ? 'text-warning' : 'text-muted-foreground')} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-sm font-medium">{value || '—'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Timeline({ patientAppts, treatments }: { patientAppts: import('@/types').Appointment[]; treatments: import('@/types').Treatment[] }) {
  const events = [
    ...patientAppts.map((a) => ({ date: a.created_at, title: a.treatment_type || a.title || 'Appointment', type: 'Appointment' as const })),
    ...treatments.map((t) => ({ date: t.created_at, title: t.name, type: 'Treatment' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No activity yet</p>;
  }

  return (
    <div className="relative space-y-6 pl-6">
      <div className="absolute left-2 top-1 h-full w-px bg-border" />
      {events.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative"
        >
          <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.type}</p>
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
