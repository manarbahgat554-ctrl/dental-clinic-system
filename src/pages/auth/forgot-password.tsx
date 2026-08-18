import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success(t('notifications.resetLinkSent'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout
      title={t('auth.resetPassword')}
      subtitle={t('auth.resetSubtitle')}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> {t('auth.backToSignIn')}
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <div>
            <p className="font-semibold">{t('auth.checkInbox')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('auth.resetLinkSent')} <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required placeholder="you@clinic.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.sendResetLink')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
