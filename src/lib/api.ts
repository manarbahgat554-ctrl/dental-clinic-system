import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/api/patients';
import { appointmentsApi } from '@/api/appointments';
import { treatmentsApi } from '@/api/treatments';
import { invoicesApi, paymentsApi } from '@/api/payments';
import { inventoryApi } from '@/api/inventory';
import { labOrdersApi } from '@/api/lab-orders';
import { radiologyApi } from '@/api/radiology';
import { clinicApi } from '@/api/clinic';
import { useAuthStore } from '@/stores/auth-store';
import type { Patient, Appointment, Treatment, Invoice, Payment, InventoryItem, LabOrder, ToothRecord } from '@/types';

export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patient', id] as const,
  appointments: ['appointments'] as const,
  appointmentsByRange: (range?: unknown) => ['appointments', range] as const,
  treatments: (patientId?: string) => ['treatments', patientId] as const,
  invoices: ['invoices'] as const,
  payments: ['payments'] as const,
  inventory: ['inventory'] as const,
  labOrders: ['labOrders'] as const,
  radiology: (patientId: string) => ['radiology', patientId] as const,
  teeth: (patientId: string) => ['teeth', patientId] as const,
  staff: ['staff'] as const,
  clinic: ['clinic'] as const,
  countries: ['countries'] as const,
};

export const queries = {
  patients: {
    list: async () => {
      const result = await patientsApi.list({ limit: 1000 });
      return result.data;
    },
    getByPatientNumber: async (patientNumber: string) => {
      const result = await patientsApi.list({ search: patientNumber, limit: 1 });
      return result.data[0] ?? null;
    },
    get: (id: string) => patientsApi.get(id),
    create: (data: Partial<Patient>) => patientsApi.create(data),
    update: (id: string, data: Partial<Patient>) => patientsApi.update(id, data),
  },

  appointments: {
    list: async () => appointmentsApi.list(),
    listByPatient: async (patientId: string) => appointmentsApi.list({ patientId }),
    create: (data: Partial<Appointment>) => appointmentsApi.create(data),
    update: (id: string, data: Partial<Appointment>) => appointmentsApi.update(id, data),
    remove: (id: string) => appointmentsApi.delete(id),
  },

  treatments: {
    list: (patientId?: string) => treatmentsApi.list(patientId ? { patientId } : undefined),
    listByPatient: (patientId: string) => treatmentsApi.list({ patientId }),
  },

  invoices: {
    list: async () => invoicesApi.list(),
    listByPatient: async (patientId: string) => invoicesApi.list({ patientId }),
    create: (data: Partial<Invoice>) => invoicesApi.create(data),
    update: (id: string, data: Partial<Invoice>) => invoicesApi.update(id, data),
  },

  payments: {
    list: async () => paymentsApi.list(),
    listByInvoice: async (invoiceId: string) => paymentsApi.list({ invoiceId }),
    create: (data: Partial<Payment>) => paymentsApi.create(data),
  },

  inventory: {
    list: async () => inventoryApi.list(),
    create: (data: Partial<InventoryItem>) => inventoryApi.create(data),
    update: (id: string, data: Partial<InventoryItem>) => inventoryApi.update(id, data),
  },

  labOrders: {
    list: async () => labOrdersApi.list(),
    listByPatient: async (patientId: string) => labOrdersApi.list({ patientId }),
    create: (data: Partial<LabOrder>) => labOrdersApi.create(data),
    update: (id: string, data: Partial<LabOrder>) => labOrdersApi.update(id, data),
  },

  radiology: {
    listByPatient: (patientId: string) => radiologyApi.list(patientId),
    remove: (id: string) => radiologyApi.delete(id),
  },

  teeth: {
    list: async (): Promise<ToothRecord[]> => [],
    listByPatient: async (patientId?: string): Promise<ToothRecord[]> => { void patientId; return []; },
    upsert: async (input?: Partial<ToothRecord>): Promise<ToothRecord> => { void input; return {} as ToothRecord; },
  },

  staff: {
    list: async () => clinicApi.listStaff(),
  },

  clinic: {
    get: async () => clinicApi.get(),
  },
};

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: queries.patients.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.patient(id) : ['patient', 'none'],
    queryFn: () => (id ? queries.patients.get(id) : Promise.reject('No id')),
    enabled: !!id,
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: queries.appointments.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function useTreatments(patientId?: string) {
  return useQuery({
    queryKey: queryKeys.treatments(patientId),
    queryFn: () => queries.treatments.list(patientId),
    enabled: !!useAuthStore.getState().profile,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: queries.invoices.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: queries.payments.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: queries.inventory.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function useLabOrders() {
  return useQuery({
    queryKey: queryKeys.labOrders,
    queryFn: queries.labOrders.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff,
    queryFn: queries.staff.list,
    enabled: !!useAuthStore.getState().profile,
  });
}

// Mutations
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Patient>) => patientsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => patientsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => appointmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}

export function useCreateTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Treatment>) => treatmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treatments'] }),
  });
}

export function useUpdateTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Treatment> }) => treatmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treatments'] }),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => invoicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.invoices }); qc.invalidateQueries({ queryKey: queryKeys.payments }); },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => invoicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.invoices }); qc.invalidateQueries({ queryKey: queryKeys.payments }); },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.payments }); qc.invalidateQueries({ queryKey: queryKeys.invoices }); },
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) => inventoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory }),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => inventoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory }),
  });
}

export function useCreateLabOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LabOrder>) => labOrdersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labOrders }),
  });
}

export function useUpdateLabOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LabOrder> }) => labOrdersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labOrders }),
  });
}
