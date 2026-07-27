import { useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { useSearchStore } from '@/stores/search-store';
import { useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/format';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const location = useLocation();

const search = useSearchStore((s) => s.search);
const setSearch = useSearchStore((s) => s.setSearch);

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

  <Input
    placeholder="Search patients..."
    className="pl-9"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);

      if (!location.pathname.startsWith('/app/patients')) {
        navigate('/app/patients');
      }
    }}
  />
</div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
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

  <DropdownMenuContent align="end" className="w-80">

    <DropdownMenuLabel>
      Notifications
    </DropdownMenuLabel>

    <DropdownMenuSeparator />

    <DropdownMenuItem>
      🦷 New patient added
    </DropdownMenuItem>

    <DropdownMenuItem>
      📅 Appointment in 30 minutes
    </DropdownMenuItem>

    <DropdownMenuItem>
      📷 Radiology image uploaded
    </DropdownMenuItem>

    <DropdownMenuItem>
      💳 Invoice paid
    </DropdownMenuItem>

  </DropdownMenuContent>
</DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-card focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {profile ? initials(profile.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{profile?.full_name}</span>
                <span className="text-xs font-normal text-muted-foreground capitalize">
                  {profile?.role.replace('_', ' ')}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
