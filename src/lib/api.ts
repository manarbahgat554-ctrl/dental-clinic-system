import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type {
  Patient,
  Appointment,
  Treatment,
  ToothRecord,
  Invoice,
  Payment,
  InventoryItem,
  LabOrder,
  RadiologyImage,
} from '@/types';

function getClinicId(): string {
  const { profile } = useAuthStore.getState();
  if (!profile?.clinic_id) throw new Error('No active clinic');
  return profile.clinic_id;
}

function getUploaderIdSafe(): string {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export const queries = {
  patients: {
    list: async (): Promise<Patient[]> => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', getClinicId())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    get: async (id: string): Promise<Patient | null> => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    create: async (input: Partial<Patient>): Promise<Patient> => {
      const { data, error } = await supabase
        .from('patients')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<Patient>): Promise<Patient> => {
      const { data, error } = await supabase
        .from('patients')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    remove: async (id: string): Promise<void> => {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
    },
  },

  appointments: {
    list: async (range?: { from: string; to: string }): Promise<Appointment[]> => {
      let query = supabase
        .from('appointments')
        .select(
          '*, patient:patients(id, first_name, last_name, phone), doctor:profiles(id, full_name, specialization)',
        )
        .eq('clinic_id', getClinicId())
        .order('start_time', { ascending: true });
      if (range) {
        query = query.gte('start_time', range.from).lte('start_time', range.to);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<Appointment>): Promise<Appointment> => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<Appointment>): Promise<Appointment> => {
      const { data, error } = await supabase
        .from('appointments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    remove: async (id: string): Promise<void> => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    },
  },

  treatments: {
    listByPatient: async (patientId: string): Promise<Treatment[]> => {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<Treatment>): Promise<Treatment> => {
      const { data, error } = await supabase
        .from('treatments')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<Treatment>): Promise<Treatment> => {
      const { data, error } = await supabase
        .from('treatments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  teeth: {
    listByPatient: async (patientId: string): Promise<ToothRecord[]> => {
      const { data, error } = await supabase
        .from('tooth_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('tooth_number', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    upsert: async (input: Partial<ToothRecord> & { patient_id: string; tooth_number: number }): Promise<ToothRecord> => {
      const { data, error } = await supabase
        .from('tooth_records')
        .upsert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  invoices: {
    list: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, patient:patients(id, first_name, last_name)')
        .eq('clinic_id', getClinicId())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<Invoice>): Promise<Invoice> => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<Invoice>): Promise<Invoice> => {
      const { data, error } = await supabase
        .from('invoices')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  payments: {
    listByInvoice: async (invoiceId: string): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<Payment>): Promise<Payment> => {
      const { data, error } = await supabase
        .from('payments')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  inventory: {
    list: async (): Promise<InventoryItem[]> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('clinic_id', getClinicId())
        .order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<InventoryItem>): Promise<InventoryItem> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<InventoryItem>): Promise<InventoryItem> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  labOrders: {
    list: async (): Promise<LabOrder[]> => {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*, patient:patients(id, first_name, last_name)')
        .eq('clinic_id', getClinicId())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    create: async (input: Partial<LabOrder>): Promise<LabOrder> => {
      const { data, error } = await supabase
        .from('lab_orders')
        .insert({ ...input, clinic_id: getClinicId() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, input: Partial<LabOrder>): Promise<LabOrder> => {
      const { data, error } = await supabase
        .from('lab_orders')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  staff: {
    list: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, specialization, avatar_url, phone')
        .eq('clinic_id', getClinicId())
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  },

  radiology: {
    listByPatient: async (patientId: string): Promise<RadiologyImage[]> => {
      const { data, error } = await supabase
        .from('radiology_images')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    create: async (
      input: Omit<RadiologyImage, 'id' | 'created_at' | 'clinic_id' | 'uploaded_by'>,
    ): Promise<RadiologyImage> => {
      const { data, error } = await supabase
        .from('radiology_images')
        .insert({
          ...input,
          clinic_id: getClinicId(),
          uploaded_by: getUploaderIdSafe(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    remove: async (id: string): Promise<void> => {
  console.log("Deleting DB:", id);

  const { data, error } = await supabase
    .from("radiology_images")
    .delete()
    .eq("id", id)
    .select();

  console.log(data);
  console.log(error);

  if (error) throw error;
},
    getById: async (id: string): Promise<RadiologyImage | null> => {
      const { data, error } = await supabase
        .from('radiology_images')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  },
};

export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patient', id] as const,
  appointments: (range?: { from: string; to: string }) =>
    ['appointments', range ?? 'all'] as const,
  treatments: (patientId: string) => ['treatments', patientId] as const,
  teeth: (patientId: string) => ['teeth', patientId] as const,
  invoices: ['invoices'] as const,
  invoicePayments: (invoiceId: string) => ['payments', invoiceId] as const,
  inventory: ['inventory'] as const,
  labOrders: ['labOrders'] as const,
  staff: ['staff'] as const,
  radiology: (patientId: string) => ['radiology', patientId] as const,
};
