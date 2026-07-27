import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ArrowRight, Building2, Stethoscope } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'doctor', 'receptionist', 'assistant', 'lab_technician']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const roleOptions: { value: UserRole; label: string; desc: string; icon: typeof Building2 }[] = [
  { value: 'admin', label: 'Admin', desc: 'Full access', icon: Building2 },
  { value: 'doctor', label: 'Doctor', desc: 'Clinical work', icon: Stethoscope },
  { value: 'receptionist', label: 'Receptionist', desc: 'Front desk', icon: User },
  { value: 'assistant', label: 'Assistant', desc: 'Chair-side help', icon: User },
  { value: 'lab_technician', label: 'Lab Tech', desc: 'Lab orders', icon: User },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'doctor' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterForm) => {
    setSubmitting(true);
    const { error } = await signUp(values.email, values.password, values.full_name, values.role);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Account created! Welcome to DentaSuite.');
    navigate('/app/dashboard');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your dental practice"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="full_name" placeholder="Dr. Sarah Chen" className="pl-9" {...register('full_name')} />
          </div>
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@clinic.com" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-9" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('role', opt.value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all',
                  selectedRole === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <opt.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
