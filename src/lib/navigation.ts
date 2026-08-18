import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Receipt,
  FlaskConical,
  Boxes,
  BarChart3,
  Settings,
} from 'lucide-react';
import type { UserRole as RoleType } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: RoleType[];
  badge?: string;
}

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Clinical',
    items: [
      { label: 'Patients', to: '/app/patients', icon: Users, roles: ['admin', 'doctor', 'receptionist', 'assistant'] },
      { label: 'Appointments', to: '/app/appointments', icon: CalendarDays, roles: ['admin', 'doctor', 'receptionist', 'assistant'] },
      {
        label: 'Doctor Workspace',
        to: '/app/workspace',
        icon: Stethoscope,
        roles: ['admin', 'doctor', 'assistant'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Billing', to: '/app/billing', icon: Receipt, roles: ['admin', 'receptionist', 'accountant'] },
      {
        label: 'Lab Orders',
        to: '/app/lab',
        icon: FlaskConical,
        roles: ['admin', 'doctor', 'lab_technician'],
      },
      {
        label: 'Inventory',
        to: '/app/inventory',
        icon: Boxes,
        roles: ['admin', 'assistant'],
      },
      {
        label: 'Reports',
        to: '/app/reports',
        icon: BarChart3,
        roles: ['admin', 'receptionist', 'accountant', 'doctor'],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Settings',
        to: '/app/settings',
        icon: Settings,
        roles: ['admin'],
      },
    ],
  },
];

export function canAccess(item: NavItem, role: RoleType | undefined): boolean {
  if (!item.roles) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

export const SIGNUP_ROLES: RoleType[] = ['doctor', 'assistant', 'receptionist', 'accountant', 'lab_technician'];
