import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { useAuthStore } from '@/stores/auth-store';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { DashboardPage } from '@/pages/dashboard';
import { PatientsPage } from '@/pages/patients';
import { PatientDetailPage } from '@/pages/patient-detail';
import { AppointmentsPage } from '@/pages/appointments';
import { DoctorWorkspacePage } from '@/pages/doctor-workspace';
import { BillingPage } from '@/pages/billing';
import { LabOrdersPage } from '@/pages/lab-orders';
import { InventoryPage } from '@/pages/inventory';
import { ReportsPage } from '@/pages/reports';
import { SettingsPage } from '@/pages/settings';
import { ResetPasswordPage } from '@/pages/reset-password';
export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/:id" element={<PatientDetailPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="workspace" element={<DoctorWorkspacePage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="lab" element={<LabOrdersPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
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
