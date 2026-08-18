import { useTranslation } from 'react-i18next';
import { useClinicSettings } from '@/stores/clinic-settings';
import { toast } from 'sonner';
import { MessageCircle, Smartphone, QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { formatCurrency } from '@/lib/format';

interface QuickActionsProps {
  patientPhone?: string | null;
  patientName: string;
  amount?: number;
}

export function QuickActions({ patientPhone, patientName, amount }: QuickActionsProps) {
  const { t } = useTranslation();
  const clinic = useClinicSettings();
  const [instapayOpen, setInstapayOpen] = useState(false);

  const handleWhatsApp = () => {
    const clinicNumber = clinic.whatsappNumber?.replace(/[^0-9]/g, '');
    if (!clinicNumber) {
      toast.error(t('settings.whatsapp') + ' — ' + t('common.notSet'));
      return;
    }
    const message = amount
      ? `Hello ${patientName}, your outstanding balance is ${formatCurrency(amount)}.`
      : `Hello ${patientName}, this is a message from your dental clinic.`;
    const url = `https://wa.me/${clinicNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const instapayUrl = clinic.instapayUrl || (clinic.instapayHandle ? `https://instapay.com/${clinic.instapayHandle}` : null);

  const handleInstaPay = () => {
    if (!instapayUrl) {
      toast.error(t('settings.aiProvider') + ' — ' + t('common.notSet'));
      return;
    }
    setInstapayOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(instapayUrl ?? '');
    toast.success(t('common.copied') || 'Copied');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {clinic.whatsappNumber && (
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-4 w-4 text-success" />
            {t('inventory.whatsapp')}
          </Button>
        )}
        {instapayUrl && (
          <Button variant="outline" size="sm" onClick={handleInstaPay}>
            <Smartphone className="mr-2 h-4 w-4 text-primary" />
            {t('inventory.instapay')}
          </Button>
        )}
      </div>

      <Dialog open={instapayOpen} onOpenChange={setInstapayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" /> {t('inventory.instapayLink')}
            </DialogTitle>
            <DialogDescription>
              {amount ? `${t('billing.amount')}: ${formatCurrency(amount)}` : t('inventory.scanToPay')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR code using a public API */}
            <div className="rounded-xl border-2 border-primary/20 bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(instapayUrl ?? '')}`}
                alt="InstaPay QR"
                className="h-48 w-48"
              />
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg border p-2">
              <input
                type="text"
                readOnly
                value={instapayUrl ?? ''}
                className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
              />
              <Button size="sm" variant="ghost" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button className="w-full" onClick={() => window.open(instapayUrl ?? '', '_blank')}>
              <QrCode className="mr-2 h-4 w-4" /> {t('inventory.payNow')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
