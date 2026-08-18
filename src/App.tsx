import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import '@/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { useClinicSettings } from '@/stores/clinic-settings';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const PatientsPage = lazy(() => import('@/pages/patients').then((m) => ({ default: m.PatientsPage })));
const PatientDetailPage = lazy(() => import('@/pages/patient-detail').then((m) => ({ default: m.PatientDetailPage })));
const AppointmentsPage = lazy(() => import('@/pages/appointments').then((m) => ({ default: m.AppointmentsPage })));
const DoctorWorkspacePage = lazy(() => import('@/pages/doctor-workspace').then((m) => ({ default: m.DoctorWorkspacePage })));
const BillingPage = lazy(() => import('@/pages/billing').then((m) => ({ default: m.BillingPage })));
const LabOrdersPage = lazy(() => import('@/pages/lab-orders').then((m) => ({ default: m.LabOrdersPage })));
const InventoryPage = lazy(() => import('@/pages/inventory').then((m) => ({ default: m.InventoryPage })));
const ReportsPage = lazy(() => import('@/pages/reports').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const loadClinicSettings = useClinicSettings((s) => s.load);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized) {
      loadClinicSettings();
    }
  }, [initialized, loadClinicSettings]);

  return (
    <ThemeProvider>
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
              <Route path="patients" element={<Suspense fallback={<PageLoader />}><PatientsPage /></Suspense>} />
              <Route path="patients/:id" element={<Suspense fallback={<PageLoader />}><PatientDetailPage /></Suspense>} />
              <Route path="appointments" element={<Suspense fallback={<PageLoader />}><AppointmentsPage /></Suspense>} />
              <Route path="workspace" element={<Suspense fallback={<PageLoader />}><DoctorWorkspacePage /></Suspense>} />
              <Route path="billing" element={<Suspense fallback={<PageLoader />}><BillingPage /></Suspense>} />
              <Route path="lab" element={<Suspense fallback={<PageLoader />}><LabOrdersPage /></Suspense>} />
              <Route path="inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            </Route>

            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
