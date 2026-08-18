import { create } from 'zustand';
import { clinicApi, countriesApi } from '@/api/clinic';
import { useAuthStore } from './auth-store';

interface ClinicSettingsState {
  clinicId: string | null;
  countryId: number | null;
  countryName: string;
  city: string;
  timezone: string;
  currencyCode: string;
  currencySymbol: string;
  language: string;
  invoicePrefix: string;
  taxPercentage: number;
  clinicName: string;
  logoUrl?: string | null;
  whatsappNumber: string;
  instapayHandle: string;
  instapayUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  aiProvider: string;
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<Omit<ClinicSettingsState, 'load' | 'update' | 'loading' | 'loaded'>>) => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', EGP: 'E£', SAR: 'SR', AED: 'AED',
  KWD: 'KD', QAR: 'QR', OMR: 'ر.ع', BHD: 'BD', JOD: 'JD',
  JPY: '¥', CNY: '¥', INR: '₹', RUB: '₽', TRY: '₺',
  CHF: 'CHF', CAD: 'C$', AUD: 'A$', NZD: 'NZ$', ZAR: 'R',
  NGN: '₦', KES: 'KSh', GHS: '₵', MAD: 'DH', DZD: 'DA',
  TND: 'DT', LBP: 'ل.ل', IRR: '﷼', IQD: 'ع.د', PKR: 'Rs',
  BDT: '৳', IDR: 'Rp', MYR: 'RM', THB: '฿', VND: '₫',
  PHP: '₱', SGD: 'S$', KRW: '₩', BRL: 'R$', MXN: 'Mex$',
  ARS: '$', COP: '$', CLP: '$', PEN: 'S/', VES: 'Bs',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč',
  HUF: 'Ft', RON: 'lei', UAH: '₴', BGN: 'лв', HRK: '€',
  RSD: 'дин', MKD: 'ден', ISK: 'kr',
};

function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code + ' ';
}

export const useClinicSettings = create<ClinicSettingsState>((set, get) => ({
  clinicId: null,
  countryId: null,
  countryName: '',
  city: '',
  timezone: 'UTC',
  currencyCode: 'USD',
  currencySymbol: '$',
  language: 'en',
  invoicePrefix: 'INV',
  taxPercentage: 0,
  clinicName: '',
  logoUrl: null,
  whatsappNumber: '',
  instapayHandle: '',
  instapayUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  websiteUrl: '',
  aiProvider: 'openai',
  loading: false,
  loaded: false,

  load: async () => {
    const profile = useAuthStore.getState().profile;
    if (!profile || !profile.clinicId) return;
    set({ loading: true });
    try {
      const clinic = await clinicApi.get();
      let countryName = '';
      let currencyCode = clinic.currencyCode || 'USD';

      if (clinic.countryId) {
        try {
          const countries = await countriesApi.list();
          const country = countries.find((c) => c.id === clinic.countryId);
          if (country) {
            countryName = country.name;
            currencyCode = country.currencyCode || currencyCode;
          }
        } catch { /* ignore country fetch errors */ }
      }

      set({
        clinicId: clinic.id,
        clinicName: clinic.name,
        logoUrl: clinic.logoUrl ?? null,
        countryId: clinic.countryId,
        countryName,
        city: clinic.city ?? '',
        timezone: clinic.timezone ?? 'UTC',
        currencyCode,
        currencySymbol: getCurrencySymbol(currencyCode),
        language: clinic.language ?? 'en',
        invoicePrefix: clinic.invoicePrefix ?? 'INV',
        taxPercentage: Number(clinic.taxPercentage) || 0,
        whatsappNumber: clinic.whatsappNumber ?? '',
        instapayHandle: clinic.instapayHandle ?? '',
        instapayUrl: clinic.instapayUrl ?? '',
        facebookUrl: clinic.facebookUrl ?? '',
        instagramUrl: clinic.instagramUrl ?? '',
        websiteUrl: clinic.websiteUrl ?? '',
        aiProvider: clinic.aiProvider ?? 'openai',
        loading: false,
        loaded: true,
      });
    } catch {
      set({ loading: false, loaded: true });
    }
  },

  update: (partial) => set(partial),
}));
