import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, ChevronLeft } from 'lucide-react';
import { navGroups, canAccess } from '@/lib/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { roleMeta, initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary p-2 text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">DentaSuite</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Clinic OS
              </div>
            </div>
          </NavLink>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => canAccess(item, profile?.role));
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onToggle}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                          />
                        )}
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {profile ? initials(profile.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.full_name ?? 'Guest'}</p>
              {profile && (
                <span
                  className={cn(
                    'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    roleMeta(profile.role).bg,
                    roleMeta(profile.role).color,
                  )}
                >
                  {roleMeta(profile.role).label}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
