import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Languages,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/format';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
const notifications = [
  {
    id: 1,
    title: 'Payment received',
    description: 'A payment was recorded successfully.',
    icon: CheckCircle2,
  },
  {
    id: 2,
    title: 'Pending invoice',
    description: 'There are invoices waiting for payment.',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Lab order',
    description: 'A lab order needs your attention.',
    icon: AlertCircle,
  },
];
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden flex-1 sm:block sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t('common.search')} className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title={t('settings.language')}>
              <Languages className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-primary/10' : ''}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-primary/10' : ''}>
              العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggleTheme} title={t('settings.theme')}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      title="Notifications"
    >
      <Bell className="h-4 w-4" />

      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    className="w-80"
  >
    <DropdownMenuLabel className="flex items-center justify-between">
      <span>Notifications</span>
      <span className="text-xs font-normal text-muted-foreground">
        3 new
      </span>
    </DropdownMenuLabel>

    <DropdownMenuSeparator />

    {notifications.map((notification) => {
      const Icon = notification.icon;

      return (
        <DropdownMenuItem
          key={notification.id}
          className="cursor-pointer items-start gap-3 py-3"
        >
          <div className="mt-0.5 rounded-full bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {notification.title}
            </span>

            <span className="text-xs text-muted-foreground">
              {notification.description}
            </span>
          </div>
        </DropdownMenuItem>
      );
    })}

    <DropdownMenuSeparator />

    <DropdownMenuItem
      className="cursor-pointer justify-center text-sm font-medium text-primary"
      onClick={() => navigate('/app/notifications')}
    >
      View all notifications
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-card focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {profile ? initials(profile.fullName) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{profile?.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground capitalize">
                  {profile?.role.replace('_', ' ')}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              {t('auth.signIn') === 'Sign in' ? 'Sign out' : 'تسجيل الخروج'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
