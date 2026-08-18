import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Search, Plus, Users, Phone, Mail, Loader2, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { queries, queryKeys } from '@/lib/api';
import { initials, calculateAge, formatDate } from '@/lib/format';
import type { Patient } from '@/types';

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  insuranceProvider: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

export function PatientsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({ queryKey: queryKeys.patients, queryFn: () => queries.patients.list() });

  const createMutation = useMutation({
    mutationFn: (input: Partial<Patient>) => queries.patients.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success(t('patients.patientAdded'));
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>({ resolver: zodResolver(patientSchema) });

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
  });

  const onSubmit = (values: PatientForm) => {
    createMutation.mutate({ ...values, dateOfBirth: values.dateOfBirth || null, email: values.email || null });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('patients.title')}
        description={t('patients.description', { count: patients.length })}
        actions={<Button onClick={() => { reset(); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />{t('patients.addPatient')}</Button>}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t('patients.searchPlaceholder')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? t('patients.noPatientsFound') : t('patients.noPatients')}
            description={search ? t('patients.tryDifferentSearch') : t('patients.addFirstPatient')}
            action={!search && <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />{t('patients.addPatient')}</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient, i) => (
            <motion.div key={patient.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <Link to={`/app/patients/${patient.id}`}>
                <Card className="group cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 border">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials(patient.firstName, patient.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">{patient.firstName} {patient.lastName}</p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{calculateAge(patient.dateOfBirth) ?? '—'} {t('patients.yearsOld')}</span>
                        {patient.gender && <span className="capitalize">{t(`patients.${patient.gender}`)}</span>}
                      </div>
                      <div className="mt-2 space-y-1">
                        {patient.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{patient.phone}</div>}
                        {patient.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /><span className="truncate">{patient.email}</span></div>}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{patient.status}</Badge>
                        {patient.allergies && <Badge variant="outline" className="border-warning/40 text-[10px] text-warning">{t('patients.allergies')}</Badge>}
                        <span className="ml-auto text-[10px] text-muted-foreground">{formatDate(patient.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('patients.newPatient')}</DialogTitle>
            <DialogDescription>{t('patients.addPatient')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="firstName">{t('patients.firstName')} *</Label><Input id="firstName" {...register('firstName')} />{errors.firstName && <p className="text-xs text-destructive">{t('validation.required', { field: t('patients.firstName') })}</p>}</div>
              <div className="space-y-2"><Label htmlFor="lastName">{t('patients.lastName')} *</Label><Input id="lastName" {...register('lastName')} />{errors.lastName && <p className="text-xs text-destructive">{t('validation.required', { field: t('patients.lastName') })}</p>}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="dateOfBirth">{t('patients.dateOfBirth')}</Label><Input id="dateOfBirth" type="date" {...register('dateOfBirth')} /></div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t('patients.gender')}</Label>
                <select id="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('gender')}>
                  <option value="">{t('common.select')}</option>
                  <option value="male">{t('patients.male')}</option>
                  <option value="female">{t('patients.female')}</option>
                  <option value="other">{t('patients.other')}</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="phone">{t('common.phone')}</Label><Input id="phone" placeholder="+1 555-0100" {...register('phone')} /></div>
              <div className="space-y-2"><Label htmlFor="email">{t('common.email')}</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-xs text-destructive">{t('validation.invalidEmail')}</p>}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="bloodGroup">{t('patients.bloodGroup')}</Label><Input id="bloodGroup" placeholder="O+" {...register('bloodGroup')} /></div>
              <div className="space-y-2"><Label htmlFor="allergies">{t('patients.allergies')}</Label><Input id="allergies" placeholder="Penicillin..." {...register('allergies')} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="insuranceProvider">{t('patients.insuranceProvider')}</Label><Input id="insuranceProvider" {...register('insuranceProvider')} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="emergencyContactName">{t('patients.emergencyContact')}</Label><Input id="emergencyContactName" {...register('emergencyContactName')} /></div>
              <div className="space-y-2"><Label htmlFor="emergencyContactPhone">{t('patients.emergencyPhone')}</Label><Input id="emergencyContactPhone" {...register('emergencyContactPhone')} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('patients.addPatient')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
