import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Stethoscope, CalendarHeart } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

const features = [
  { icon: Stethoscope, label: 'Advanced clinical workspace' },
  { icon: Activity, label: 'Interactive 3D dental chart' },
  { icon: CalendarHeart, label: 'Smart appointment scheduling' },
  { icon: ShieldCheck, label: 'HIPAA-grade role-based security' },
];

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-accent lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">DentaSuite</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              The complete platform for modern dental practices.
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Manage patients, appointments, treatments, billing, and your entire clinical
              workflow in one beautifully designed workspace.
            </p>
          </motion.div>

          <div className="grid gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm">
                  <f.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-white/60">
          © 2026 DentaSuite. Crafted for dental professionals.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
