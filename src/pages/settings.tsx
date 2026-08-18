import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import {
  Building2,
  Clock,
  Users,
  Palette,
  Globe,
  Loader2,
  Save,
  Download,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Smartphone,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { useClinicSettings } from '@/stores/clinic-settings';

import { clinicApi, countriesApi } from '@/api/clinic';
import { authApi } from '@/api/auth';

import { queries, queryKeys } from '@/lib/api';
import { roleMeta, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';

import type { Country } from '@/types';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function SettingsPage() {
  const { t } = useTranslation();

  const {
    theme,
    setTheme,
    language,
    setLanguage,
  } = useTheme();

  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const clinicSettings = useClinicSettings();

  const queryClient = useQueryClient();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingClinic, setSavingClinic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  /*
   * =========================
   * PROFILE FORM
   * =========================
   */

  const [profileForm, setProfileForm] = useState({
    fullName: profile?.fullName ?? '',
    phone: profile?.phone ?? '',
    specialization: profile?.specialization ?? '',
    licenseNumber: profile?.licenseNumber ?? '',
    bio: profile?.bio ?? '',
  });

  /*
   * =========================
   * CLINIC FORM
   * =========================
   */

  const [clinicForm, setClinicForm] = useState({
    name: clinicSettings.clinicName,
    phone: '',
    email: '',
    address: '',
    city: clinicSettings.city,

    countryId: clinicSettings.countryId,

    timezone: clinicSettings.timezone,
    currency_code: clinicSettings.currencyCode,
    language: clinicSettings.language,

    invoice_prefix: clinicSettings.invoicePrefix,
    tax_percentage: clinicSettings.taxPercentage,

    whatsapp_number: clinicSettings.whatsappNumber,
    instapay_handle: clinicSettings.instapayHandle,
    instapay_url: clinicSettings.instapayUrl,

    facebook_url: clinicSettings.facebookUrl,
    instagram_url: clinicSettings.instagramUrl,
    website_url: clinicSettings.websiteUrl,

    ai_provider: clinicSettings.aiProvider,

    /*
     * NEW
     */
    logo_url: clinicSettings.logoUrl ?? '',
  });

  /*
   * =========================
   * COUNTRIES
   * =========================
   */

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  /*
   * =========================
   * STAFF
   * =========================
   */

  const { data: staff = [] } = useQuery({
    queryKey: queryKeys.staff,
    queryFn: () => queries.staff.list(),
  });

  /*
   * =========================
   * UPDATE PROFILE FORM WHEN PROFILE CHANGES
   * =========================
   */

  useEffect(() => {
    if (!profile) return;

    setProfileForm({
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      specialization: profile.specialization ?? '',
      licenseNumber: profile.licenseNumber ?? '',
      bio: profile.bio ?? '',
    });
  }, [profile]);

  /*
   * =========================
   * LOAD CLINIC SETTINGS
   * =========================
   */

  useEffect(() => {
    if (!clinicSettings.loaded) return;

    setClinicForm({
      name: clinicSettings.clinicName,
      phone: '',
      email: '',
      address: '',
      city: clinicSettings.city,

      countryId: clinicSettings.countryId,

      timezone: clinicSettings.timezone,
      currency_code: clinicSettings.currencyCode,
      language: clinicSettings.language,

      invoice_prefix: clinicSettings.invoicePrefix,
      tax_percentage: clinicSettings.taxPercentage,

      whatsapp_number: clinicSettings.whatsappNumber,
      instapay_handle: clinicSettings.instapayHandle,
      instapay_url: clinicSettings.instapayUrl,

      facebook_url: clinicSettings.facebookUrl,
      instagram_url: clinicSettings.instagramUrl,
      website_url: clinicSettings.websiteUrl,

      ai_provider: clinicSettings.aiProvider,

      /*
       * NEW
       */
      logo_url: clinicSettings.logoUrl ?? '',
    });
  }, [
    clinicSettings.loaded,
    clinicSettings.clinicName,
    clinicSettings.city,
    clinicSettings.countryId,
    clinicSettings.timezone,
    clinicSettings.currencyCode,
    clinicSettings.language,
    clinicSettings.invoicePrefix,
    clinicSettings.taxPercentage,
    clinicSettings.whatsappNumber,
    clinicSettings.instapayHandle,
    clinicSettings.instapayUrl,
    clinicSettings.facebookUrl,
    clinicSettings.instagramUrl,
    clinicSettings.websiteUrl,
    clinicSettings.aiProvider,
    clinicSettings.logoUrl,
  ]);

  /*
   * =========================
   * PROFILE UPDATE
   * =========================
   */

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await authApi.updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        specialization: profileForm.specialization,
        licenseNumber: profileForm.licenseNumber,
        bio: profileForm.bio,
      });
    },

    onSuccess: () => {
      updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        specialization: profileForm.specialization,
        licenseNumber: profileForm.licenseNumber,
        bio: profileForm.bio,
      });

      toast.success(t('settings.profileUpdated'));

      setSavingProfile(false);
    },

    onError: (err: Error) => {
      toast.error(err.message);
      setSavingProfile(false);
    },
  });

  /*
   * =========================
   * CLINIC UPDATE
   * =========================
   */

  const updateClinicMutation = useMutation({
    mutationFn: async () => {
      if (!clinicSettings.clinicId) {
        throw new Error('No clinic');
      }

      await clinicApi.update({
        name: clinicForm.name,
        city: clinicForm.city,
        countryId: clinicForm.countryId,

        timezone: clinicForm.timezone,
        currencyCode: clinicForm.currency_code,
        language: clinicForm.language,

        invoicePrefix: clinicForm.invoice_prefix,
        taxPercentage: clinicForm.tax_percentage,

        whatsappNumber: clinicForm.whatsapp_number,
        instapayHandle: clinicForm.instapay_handle,
        instapayUrl: clinicForm.instapay_url,

        facebookUrl: clinicForm.facebook_url,
        instagramUrl: clinicForm.instagram_url,
        websiteUrl: clinicForm.website_url,

        aiProvider: clinicForm.ai_provider,

        /*
         * NEW
         */
        logoUrl: clinicForm.logo_url,
      });
    },

    onSuccess: () => {
      clinicSettings.update({
        clinicName: clinicForm.name,
        city: clinicForm.city,
        countryId: clinicForm.countryId,

        timezone: clinicForm.timezone,
        currencyCode: clinicForm.currency_code,
        language: clinicForm.language,

        invoicePrefix: clinicForm.invoice_prefix,
        taxPercentage: clinicForm.tax_percentage,

        whatsappNumber: clinicForm.whatsapp_number,
        instapayHandle: clinicForm.instapay_handle,
        instapayUrl: clinicForm.instapay_url,

        facebookUrl: clinicForm.facebook_url,
        instagramUrl: clinicForm.instagram_url,
        websiteUrl: clinicForm.website_url,

        aiProvider: clinicForm.ai_provider,

        /*
         * NEW
         */
        logoUrl: clinicForm.logo_url,
      });

      if (clinicForm.language !== language) {
        setLanguage(clinicForm.language as 'en' | 'ar');
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.staff,
      });

      toast.success(t('settings.clinicSettingsSaved'));

      setSavingClinic(false);
    },

    onError: (err: Error) => {
      toast.error(err.message);
      setSavingClinic(false);
    },
  });

  /*
   * =========================
   * LOGO UPLOAD
   * =========================
   */

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
     * Check file type
     */

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }

    /*
     * Check file size
     * Maximum = 5 MB
     */

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      e.target.value = '';
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();

      formData.append('logo', file);

      /*
       * Send image to backend
       * Backend will upload it to Cloudinary.
       */

      const response = await clinicApi.uploadLogo(formData);

      /*
       * Update local form
       */

      setClinicForm((prev) => ({
        ...prev,
        logo_url: String(response.logoUrl ?? ''),
      }));

      /*
       * Update clinic settings store
       */

      clinicSettings.update({
        logoUrl: response.logoUrl ?? null,
      });

      /*
       * Refresh clinic data
       */

      queryClient.invalidateQueries({
        queryKey: queryKeys.clinic,
      });

      toast.success('Clinic logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload logo'
      );
    } finally {
      setUploadingLogo(false);

      /*
       * Allow selecting same image again
       */

      e.target.value = '';
    }
  };

  /*
   * =========================
   * BACKUP
   * =========================
   */

  const handleBackup = () => {
    const data = {
      clinic: clinicForm,
      profile: profileForm,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: 'application/json',
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = `dentasuite-backup-${Date.now()}.json`;

    a.click();

    URL.revokeObjectURL(url);

    toast.success(t('settings.backupCreated'));
  };

  /*
   * =========================
   * THEME OPTIONS
   * =========================
   */

  const themeOptions = [
    {
      value: 'light' as const,
      label: t('settings.light'),
      desc: t('settings.lightDesc'),
      preview: 'bg-white border',
    },

    {
      value: 'dark' as const,
      label: t('settings.dark'),
      desc: t('settings.darkDesc'),
      preview: 'bg-slate-900 border-slate-700',
    },
  ];

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="space-y-6">

      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <Tabs defaultValue="clinic">

        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">

          <TabsTrigger value="clinic">
            <Building2 className="mr-1.5 h-4 w-4" />
            {t('settings.clinic')}
          </TabsTrigger>

          <TabsTrigger value="localization">
            <Globe className="mr-1.5 h-4 w-4" />
            {t('settings.localization')}
          </TabsTrigger>

          <TabsTrigger value="contact">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            {t('settings.contact')}
          </TabsTrigger>

          <TabsTrigger value="ai">
            <Sparkles className="mr-1.5 h-4 w-4" />
            {t('settings.aiProvider')}
          </TabsTrigger>

          <TabsTrigger value="profile">
            {t('settings.profile')}
          </TabsTrigger>

          <TabsTrigger value="staff">
            <Users className="mr-1.5 h-4 w-4" />
            {t('settings.staff')}
          </TabsTrigger>

          <TabsTrigger value="appearance">
            <Palette className="mr-1.5 h-4 w-4" />
            {t('settings.appearance')}
          </TabsTrigger>

        </TabsList>

        {/* ========================================================= */}
        {/* CLINIC */}
        {/* ========================================================= */}

        <TabsContent
          value="clinic"
          className="space-y-4"
        >

          <Card>

            <CardHeader>
              <CardTitle className="text-base">
                {t('settings.clinicInfo')}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* ================= LOGO ================= */}

              <div className="flex items-center gap-4">

                <Avatar className="h-16 w-16 border">

                  {clinicForm.logo_url ? (

                    <img
                      src={clinicForm.logo_url}
                      alt="Clinic Logo"
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <AvatarFallback className="bg-primary/10">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>

                  )}

                </Avatar>

                <div>

                  <p className="text-sm font-medium">
                    {t('settings.logo')}
                  </p>

                  {/* Hidden file input */}

                  <input
                    id="clinic-logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  {/* Upload button */}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    disabled={uploadingLogo}
                    onClick={() => {
                      document
                        .getElementById('clinic-logo-upload')
                        ?.click();
                    }}
                  >

                    {uploadingLogo ? (

                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />

                    ) : (

                      <Upload className="mr-2 h-3.5 w-3.5" />

                    )}

                    {uploadingLogo
                      ? 'Uploading...'
                      : t('settings.uploadLogo')}

                  </Button>

                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG or WEBP — Max 5MB
                  </p>

                </div>

              </div>

              {/* ================= CLINIC NAME / PHONE ================= */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('settings.clinicName')}
                  </Label>

                  <Input
                    value={clinicForm.name}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        name: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('common.phone')}
                  </Label>

                  <Input
                    value={clinicForm.phone}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        phone: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* ================= ADDRESS ================= */}

              <div className="space-y-2">

                <Label>
                  {t('common.address')}
                </Label>

                <Textarea
                  rows={2}
                  value={clinicForm.address}
                  onChange={(e) =>
                    setClinicForm({
                      ...clinicForm,
                      address: e.target.value,
                    })
                  }
                />

              </div>

              {/* ================= EMAIL / CITY ================= */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('common.email')}
                  </Label>

                  <Input
                    value={clinicForm.email}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        email: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.city')}
                  </Label>

                  <Input
                    value={clinicForm.city}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        city: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* ================= INVOICE / TAX ================= */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('settings.invoicePrefix')}
                  </Label>

                  <Input
                    value={clinicForm.invoice_prefix}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        invoice_prefix: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.taxPercentage')}
                  </Label>

                  <Input
                    type="number"
                    step="0.01"
                    value={clinicForm.tax_percentage}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        tax_percentage: Number(e.target.value),
                      })
                    }
                  />

                </div>

              </div>

              {/* ================= SAVE ================= */}

              <Button
                onClick={() => {
                  setSavingClinic(true);
                  updateClinicMutation.mutate();
                }}
                disabled={savingClinic}
              >

                {savingClinic ? (

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                ) : (

                  <Save className="mr-2 h-4 w-4" />

                )}

                {t('common.save')}

              </Button>

            </CardContent>

          </Card>

          {/* ================= WORKING HOURS ================= */}

          <Card>

            <CardHeader className="flex-row items-center justify-between space-y-0">

              <CardTitle className="flex items-center gap-2 text-base">

                <Clock className="h-5 w-5 text-primary" />

                {t('settings.workingHours')}

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              {DAYS.map((day) => (

                <div
                  key={day}
                  className="flex items-center justify-between rounded-lg border p-2.5"
                >

                  <span className="text-sm font-medium">
                    {t(`settings.${day}`)}
                  </span>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <span>9:00 AM</span>
                    <span>—</span>
                    <span>6:00 PM</span>

                    <Badge
                      variant="outline"
                      className="text-[10px]"
                    >
                      {t('settings.open')}
                    </Badge>

                  </div>

                </div>

              ))}

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* LOCALIZATION */}
        {/* ========================================================= */}

        <TabsContent
          value="localization"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-base">

                <Globe className="h-5 w-5 text-primary" />

                {t('settings.localization')}

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('settings.country')}
                  </Label>

                  <Select
                    value={String(
                      clinicForm.countryId ?? ''
                    )}
                    onValueChange={(v) =>
                      setClinicForm({
                        ...clinicForm,
                        countryId: v
                          ? Number(v)
                          : null,
                      })
                    }
                  >

                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'misc.selectCountry'
                        )}
                      />
                    </SelectTrigger>

                    <SelectContent>

                      {countries.map(
                        (c: Country) => (

                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                          >
                            {c.name}
                          </SelectItem>

                        )
                      )}

                    </SelectContent>

                  </Select>

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.timezone')}
                  </Label>

                  <Input
                    value={clinicForm.timezone}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        timezone: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('settings.currency')}
                  </Label>

                  <Select
                    value={clinicForm.currency_code}
                    onValueChange={(v) =>
                      setClinicForm({
                        ...clinicForm,
                        currency_code: v,
                      })
                    }
                  >

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>

                      {Array.from(
                        new Map(
                          countries.map(
                            (c) => [
                              c.currencyCode,
                              c,
                            ]
                          )
                        ).values()
                      ).map((c) => (

                        <SelectItem
                          key={c.currencyCode}
                          value={c.currencyCode}
                        >
                          {c.currencyCode} —{' '}
                          {c.currencyName} (
                          {c.currencySymbol})
                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.language')}
                  </Label>

                  <Select
                    value={clinicForm.language}
                    onValueChange={(v) =>
                      setClinicForm({
                        ...clinicForm,
                        language: v,
                      })
                    }
                  >

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="en">
                        {t('settings.english')}
                      </SelectItem>

                      <SelectItem value="ar">
                        {t('settings.arabic')}
                      </SelectItem>

                    </SelectContent>

                  </Select>

                </div>

              </div>

              <Button
                onClick={() => {
                  setSavingClinic(true);
                  updateClinicMutation.mutate();
                }}
                disabled={savingClinic}
              >

                {savingClinic ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {t('common.save')}

              </Button>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* CONTACT */}
        {/* ========================================================= */}

        <TabsContent
          value="contact"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-base">

                <MessageCircle className="h-5 w-5 text-primary" />

                {t('settings.contactSocial')}

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    <MessageCircle className="mr-1 inline h-3.5 w-3.5 text-success" />
                    WhatsApp
                  </Label>

                  <Input
                    placeholder="+1234567890"
                    value={clinicForm.whatsapp_number}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        whatsapp_number:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>

                    <Smartphone className="mr-1 inline h-3.5 w-3.5 text-primary" />

                    InstaPay Handle

                  </Label>

                  <Input
                    placeholder="clinicname"
                    value={clinicForm.instapay_handle}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        instapay_handle:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="space-y-2">

                <Label>
                  InstaPay URL
                </Label>

                <Input
                  placeholder="https://instapay.com/..."
                  value={clinicForm.instapay_url}
                  onChange={(e) =>
                    setClinicForm({
                      ...clinicForm,
                      instapay_url:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>

                    <Facebook className="mr-1 inline h-3.5 w-3.5" />

                    Facebook

                  </Label>

                  <Input
                    placeholder="https://facebook.com/..."
                    value={clinicForm.facebook_url}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        facebook_url:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>

                    <Instagram className="mr-1 inline h-3.5 w-3.5" />

                    Instagram

                  </Label>

                  <Input
                    placeholder="https://instagram.com/..."
                    value={clinicForm.instagram_url}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        instagram_url:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="space-y-2">

                <Label>

                  <LinkIcon className="mr-1 inline h-3.5 w-3.5" />

                  {t('settings.website')}

                </Label>

                <Input
                  placeholder="https://myclinic.com"
                  value={clinicForm.website_url}
                  onChange={(e) =>
                    setClinicForm({
                      ...clinicForm,
                      website_url:
                        e.target.value,
                    })
                  }
                />

              </div>

              <Button
                onClick={() => {
                  setSavingClinic(true);
                  updateClinicMutation.mutate();
                }}
                disabled={savingClinic}
              >

                {savingClinic ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {t('common.save')}

              </Button>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* AI */}
        {/* ========================================================= */}

        <TabsContent
          value="ai"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-base">

                <Sparkles className="h-5 w-5 text-primary" />

                {t('settings.aiProvider')}

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="space-y-2">

                <Label>
                  {t('settings.aiProvider')}
                </Label>

                <Select
                  value={clinicForm.ai_provider}
                  onValueChange={(v) =>
                    setClinicForm({
                      ...clinicForm,
                      ai_provider: v,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="openai">
                      OpenAI (GPT-4)
                    </SelectItem>

                    <SelectItem value="gemini">
                      Google Gemini
                    </SelectItem>

                    <SelectItem value="claude">
                      Anthropic Claude
                    </SelectItem>

                    <SelectItem value="openrouter">
                      OpenRouter
                    </SelectItem>

                    <SelectItem value="local">
                      Local AI
                    </SelectItem>

                  </SelectContent>

                </Select>

                <p className="text-xs text-muted-foreground">
                  {t('settings.aiProviderDesc')}
                </p>

              </div>

              <div className="space-y-2">

                <Label>
                  {t('settings.aiApiKey')}
                </Label>

                <Input
                  type="password"
                  placeholder="sk-..."
                />

                <p className="text-xs text-muted-foreground">
                  {t('settings.aiApiKeyDesc')}
                </p>

              </div>

              <Button
                onClick={() => {
                  setSavingClinic(true);
                  updateClinicMutation.mutate();
                }}
                disabled={savingClinic}
              >

                {savingClinic ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {t('common.save')}

              </Button>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* PROFILE */}
        {/* ========================================================= */}

        <TabsContent
          value="profile"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="text-base">
                {t('settings.myProfile')}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="flex items-center gap-4">

                <Avatar className="h-16 w-16 border">

                  <AvatarFallback className="bg-primary/10 font-bold text-primary">

                    {profile
                      ? initials(profile.fullName)
                      : '?'}

                  </AvatarFallback>

                </Avatar>

                <div>

                  <p className="font-semibold">
                    {profile?.fullName}
                  </p>

                  {profile && (

                    <Badge
                      className={cn(
                        'mt-1',
                        roleMeta(profile.role).bg,
                        roleMeta(profile.role).color
                      )}
                    >
                      {roleMeta(profile.role).label}
                    </Badge>

                  )}

                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label>
                    {t('settings.myProfile')}
                  </Label>

                  <Input
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('common.phone')}
                  </Label>

                  <Input
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phone: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.specialization')}
                  </Label>

                  <Input
                    value={profileForm.specialization}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        specialization:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    {t('settings.licenseNumber')}
                  </Label>

                  <Input
                    value={profileForm.licenseNumber}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        licenseNumber:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="space-y-2">

                <Label>
                  {t('settings.bio')}
                </Label>

                <Textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      bio: e.target.value,
                    })
                  }
                />

              </div>

              <Button
                onClick={() => {
                  setSavingProfile(true);
                  updateProfileMutation.mutate();
                }}
                disabled={savingProfile}
              >

                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {t('settings.saveProfile')}

              </Button>

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* STAFF */}
        {/* ========================================================= */}

        <TabsContent
          value="staff"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="text-base">
                {t('settings.staffMembers')}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              {staff.length === 0 ? (

                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t('settings.noStaff')}
                </p>

              ) : (

                staff.map((member, i) => {

                  const meta =
                    roleMeta(member.role);

                  return (

                    <motion.div
                      key={member.id}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: i * 0.05,
                      }}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >

                      <Avatar className="h-10 w-10 border">

                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">

                          {initials(
                            member.fullName
                          )}

                        </AvatarFallback>

                      </Avatar>

                      <div className="flex-1">

                        <p className="text-sm font-medium">
                          {member.fullName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {member.specialization ||
                            member.phone ||
                            '—'}
                        </p>

                      </div>

                      <Badge
                        className={cn(
                          meta.bg,
                          meta.color
                        )}
                      >
                        {meta.label}
                      </Badge>

                    </motion.div>

                  );
                })

              )}

            </CardContent>

          </Card>

        </TabsContent>

        {/* ========================================================= */}
        {/* APPEARANCE */}
        {/* ========================================================= */}

        <TabsContent
          value="appearance"
          className="space-y-4"
        >

          <Card>

            <CardHeader>

              <CardTitle className="text-base">
                {t('settings.theme')}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid gap-3 sm:grid-cols-2">

                {themeOptions.map((opt) => (

                  <button
                    key={opt.value}
                    onClick={() =>
                      setTheme(opt.value)
                    }
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',

                      theme === opt.value
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary/40'
                    )}
                  >

                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg',
                        opt.preview
                      )}
                    />

                    <div>

                      <p className="text-sm font-semibold">
                        {opt.label}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {opt.desc}
                      </p>

                    </div>

                  </button>

                ))}

              </div>

            </CardContent>

          </Card>

          {/* ================= BACKUP ================= */}

          <Card>

            <CardHeader>

              <CardTitle className="text-base">
                {t('settings.backupRestore')}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-3">

              <div className="flex items-center justify-between rounded-lg border p-3">

                <div>

                  <p className="text-sm font-medium">
                    {t('settings.backup')}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t('settings.backupDesc')}
                  </p>

                </div>

                <Button
                  variant="outline"
                  onClick={handleBackup}
                >

                  <Download className="mr-2 h-4 w-4" />

                  {t('settings.backup')}

                </Button>

              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">

                <div>

                  <p className="text-sm font-medium">
                    {t('settings.restore')}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t('settings.restoreDesc')}
                  </p>

                </div>

                <Button variant="outline">

                  <Upload className="mr-2 h-4 w-4" />

                  {t('settings.restore')}

                </Button>

              </div>

            </CardContent>

          </Card>

        </TabsContent>

      </Tabs>

    </div>
  );
}