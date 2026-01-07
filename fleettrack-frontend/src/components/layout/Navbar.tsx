'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Navigation,
  AlertCircle,
  Wrench,
  UserCog,
  Smartphone,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  User,
  HelpCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Vehicules', href: '/vehicles', icon: Truck },
  { title: 'Conducteurs', href: '/drivers', icon: Users },
  { title: 'Missions', href: '/missions', icon: MapPin },
  { title: 'Tracking', href: '/tracking', icon: Navigation },
  { title: 'Alertes', href: '/alerts', icon: AlertCircle },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench },
];

const moreItems: NavItem[] = [
  { title: 'Mode Conducteur', href: '/driver-tracking', icon: Smartphone },
  { title: 'Utilisateurs', href: '/users', icon: UserCog, roles: ['Admin'] },
];

const navVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function Navbar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role || '')
  );

  const filteredMoreItems = moreItems.filter(
    (item) => !item.roles || item.roles.includes(role || '')
  );

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
            : 'bg-[var(--background)]'
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25"
              >
                <Truck className="w-5 h-5 text-white" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight">FleetTrack</span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                  Fleet Management
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--primary)] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* More Menu */}
              {filteredMoreItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-all">
                      Plus
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl border-[var(--border)] bg-[var(--card)] shadow-xl">
                    {filteredMoreItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href} asChild className="rounded-lg cursor-pointer">
                          <Link href={item.href} className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-9 w-9 rounded-xl hover:bg-[var(--muted)]"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl hover:bg-[var(--muted)]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hidden sm:flex h-9 w-9 rounded-xl hover:bg-[var(--muted)]"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">
                        {user?.firstName || user?.username || 'User'}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {user?.roleName || role || 'Admin'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-[var(--border)] bg-[var(--card)] shadow-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[var(--border)]" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Parametres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/help" className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Aide
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[var(--border)]" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Deconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-9 w-9 rounded-xl hover:bg-[var(--muted)]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
              className="lg:hidden border-t border-[var(--border)] bg-[var(--background)]"
            >
              <div className="px-4 py-4 space-y-1">
                {[...filteredNavItems, ...filteredMoreItems].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[var(--primary)] text-white'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Mobile Theme Toggle */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-5 h-5" />
                        Mode Clair
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5" />
                        Mode Sombre
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
