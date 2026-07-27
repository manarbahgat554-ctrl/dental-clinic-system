import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Settings, Building2, Clock, Users, Palette, Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { queries, queryKeys } from '@/lib/api';
import { roleMeta, initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const queryClient = useQueryClient();
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    specialization: profile?.specialization ?? '',
    license_number: profile?.license_number ?? '',
    bio: profile?.bio ?? '',
  });

  const { data: staff = [] } = useQuery({ queryKey: queryKeys.staff, queryFn: () => queries.staff.list() });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update(profileForm).eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      toast.success('Profile updated');
      setSavingProfile(false);
    },
    onError: (err: Error) => { toast.error(err.message); setSavingProfile(false); },
  });

  const themeOptions = [
    { value: 'light' as const, label: 'Light', preview: 'bg-white border' },
    { value: 'dark' as const, label: 'Dark', preview: 'bg-slate-900 border-slate-700' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your clinic, profile, and preferences" />

      <Tabs defaultValue="clinic">
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
          <TabsTrigger value="clinic"><Building2 className="mr-1.5 h-4 w-4" />Clinic</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="staff"><Users className="mr-1.5 h-4 w-4" />Staff</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-1.5 h-4 w-4" />Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Clinic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Clinic Name</Label><Input defaultValue="DentaSuite Clinic" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+1 555-0100" /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea rows={2} defaultValue="123 Dental Avenue, Medical District, NY 10001" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email</Label><Input defaultValue="contact@dentasuite.com" /></div>
                <div className="space-y-2"><Label>Website</Label><Input placeholder="www.dentasuite.com" /></div>
              </div>
              <Button onClick={() => toast.success('Clinic settings saved')}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Working Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
                <div key={day} className="flex items-center justify-between rounded-lg border p-2.5">
                  <span className="text-sm font-medium">{day}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>9:00 AM</span><span>—</span><span>6:00 PM</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">Open</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">My Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarFallback className="bg-primary/10 font-bold text-primary">{profile ? initials(profile.full_name) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{profile?.full_name}</p>
                  {profile && <Badge className={cn('mt-1', roleMeta(profile.role).bg, roleMeta(profile.role).color)}>{roleMeta(profile.role).label}</Badge>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Specialization</Label><Input value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} /></div>
                <div className="space-y-2"><Label>License Number</Label><Input value={profileForm.license_number} onChange={(e) => setProfileForm({ ...profileForm, license_number: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
              <Button onClick={() => { setSavingProfile(true); updateProfileMutation.mutate(); }} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Staff Members</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {staff.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No staff members yet</p>
              ) : (
                staff.map((member, i) => {
                  const meta = roleMeta(member.role);
                  return (
                    <motion.div key={member.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.specialization || member.phone || '—'}</p>
                      </div>
                      <Badge className={cn(meta.bg, meta.color)}>{meta.label}</Badge>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      theme === opt.value ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40',
                    )}
                  >
                    <div className={cn('h-10 w-10 rounded-lg', opt.preview)} />
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.value === 'light' ? 'Bright and clean' : 'Easy on the eyes'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
