import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
import { useSearchStore } from '@/stores/search-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { queries, queryKeys } from '@/lib/api';
import { initials, calculateAge, formatDate } from '@/lib/format';
import type { Patient } from '@/types';

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  insurance_provider: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

export function PatientsPage() {
 const search = useSearchStore((s) => s.search);
const setSearch = useSearchStore((s) => s.setSearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<Patient>) => queries.patients.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success('Patient added successfully');
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientForm>({ resolver: zodResolver(patientSchema) });

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  const onSubmit = (values: PatientForm) => {
    createMutation.mutate({
      ...values,
      date_of_birth: values.date_of_birth || null,
      email: values.email || null,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${patients.length} patients in your clinic`}
        actions={
          <Button onClick={() => { reset(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? 'No patients found' : 'No patients yet'}
            description={search ? 'Try a different search term.' : 'Add your first patient to get started.'}
            action={
              !search && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link to={`/app/patients/${patient.id}`}>
                <Card className="group cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/40">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 border">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {initials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{calculateAge(patient.date_of_birth) ?? '—'} yrs</span>
                        {patient.gender && <span className="capitalize">{patient.gender}</span>}
                      </div>
                      <div className="mt-2 space-y-1">
                        {patient.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {patient.status}
                        </Badge>
                        {patient.allergies && (
                          <Badge variant="outline" className="border-warning/40 text-[10px] text-warning">
                            Allergies
                          </Badge>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {formatDate(patient.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter the patient's personal and contact information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name *</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name *</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('gender')}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 555-0100" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood group</Label>
                <Input id="blood_group" placeholder="O+" {...register('blood_group')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" placeholder="Penicillin, Latex..." {...register('allergies')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_provider">Insurance provider</Label>
              <Input id="insurance_provider" {...register('insurance_provider')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency contact</Label>
                <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency phone</Label>
                <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Patient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
