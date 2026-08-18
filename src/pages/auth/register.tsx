import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ArrowRight, Building2, Stethoscope, Globe, Briefcase, FlaskConical, HeartPulse } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { SIGNUP_ROLES } from '@/lib/navigation';
import { countriesApi } from '@/api/clinic';
import type { Country } from '@/types';

const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    role: z.enum(['doctor', 'assistant', 'receptionist', 'accountant', 'lab_technician']),
    countryId: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
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

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  const selectedRole = watch('role');
  const selectedCountryId = watch('countryId');
  const selectedCountry = countries.find((c) => String(c.id) === selectedCountryId);

  const roleOptions: { value: 'doctor' | 'assistant' | 'receptionist' | 'accountant' | 'lab_technician'; label: string; desc: string; icon: typeof Building2 }[] = [
    { value: 'doctor', label: t('roles.doctor'), desc: t('roles.clinicalWork'), icon: Stethoscope },
    { value: 'assistant', label: t('roles.assistant'), desc: t('roles.chairside'), icon: HeartPulse },
    { value: 'receptionist', label: t('roles.receptionist'), desc: t('roles.frontDesk'), icon: User },
    { value: 'accountant', label: t('roles.accountant'), desc: t('roles.financial'), icon: Briefcase },
    { value: 'lab_technician', label: t('roles.labTechnician'), desc: t('roles.labWork'), icon: FlaskConical },
  ];

  const onSubmit = async (values: RegisterForm) => {
    setSubmitting(true);
    const { error } = await signUp(values.email, values.password, values.fullName, values.role, Number(values.countryId));
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    toast.success(t('auth.accountCreated'));
    navigate('/app/dashboard');
  };

  return (
    <AuthLayout
      title={t('auth.createAccount')}
      subtitle={t('auth.startManaging')}
      footer={
        <>
          {t('auth.signInLink').split('Sign in')[0]}{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t('auth.fullName')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="fullName" placeholder="Dr. Sarah Chen" className="pl-9" {...register('fullName')} />
          </div>
          {errors.fullName && <p className="text-xs text-destructive">{t('validation.minLength', { field: t('auth.fullName'), count: 2 })}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@clinic.com" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{t('validation.invalidEmail')}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{t('validation.minPassword')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-9" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{t('validation.passwordsDoNotMatch')}</p>}
          </div>
        </div>

        {/* Country selector */}
        <div className="space-y-2">
          <Label htmlFor="countryId">
            <Globe className="mr-1 inline h-3.5 w-3.5" />
            {t('settings.country')}
          </Label>
          <select
            id="countryId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('countryId')}
          >
            <option value="">{t('misc.selectCountry')}</option>
            {countries.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name} — {c.currencyCode} ({c.currencySymbol})
              </option>
            ))}
          </select>
          {errors.countryId && <p className="text-xs text-destructive">{t('validation.required', { field: t('settings.country') })}</p>}
          {selectedCountry && (
            <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{t('settings.language')}: <strong className="text-foreground">{selectedCountry.defaultLanguage === 'ar' ? 'العربية' : 'English'}</strong></span>
              <span className="ml-2">{t('settings.currency')}: <strong className="text-foreground">{selectedCountry.currencyCode}</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('auth.role')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {roleOptions.filter((opt) => SIGNUP_ROLES.includes(opt.value)).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('role', opt.value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all',
                  selectedRole === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40',
                )}
              >
                <opt.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t('auth.adminNote')}</p>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t('auth.signUp')} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
