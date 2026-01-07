'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

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
  { title: 'Tracking GPS', href: '/tracking', icon: Navigation },
  { title: 'Mode Conducteur', href: '/driver-tracking', icon: Smartphone },
  { title: 'Alertes', href: '/alerts', icon: AlertCircle },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench },
  { title: 'Utilisateurs', href: '/users', icon: UserCog, roles: ['Admin'] },
];

const sidebarVariants: Variants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role || '')
  );

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] overflow-hidden"
    >
      {/* Logo Section */}
      <div className="flex items-center h-16 px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-lg"
          >
            <Truck className="w-5 h-5 text-white" />
            <motion.div
              className="absolute inset-0 rounded-xl gradient-primary opacity-0 blur-lg"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col"
              >
                <span className="text-lg font-semibold text-[var(--sidebar-foreground)] tracking-tight">
                  FleetTrack
                </span>
                <span className="text-[10px] text-[var(--sidebar-muted-foreground)] font-medium uppercase tracking-wider">
                  Fleet Management
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-muted-foreground)]"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {filteredNavItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <motion.div
              key={item.href}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-[var(--sidebar-primary)] text-white'
                    : 'text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]'
                )}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-[var(--sidebar-muted)] group-hover:bg-[var(--sidebar-primary)]/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] transition-all duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-[var(--sidebar-muted-foreground)] group-hover:text-[var(--sidebar-primary)]'
                    )}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.1 }}
                      className="flex-1 truncate"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && !isCollapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-[var(--destructive)] text-white rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}

                {/* Collapsed tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-xl border border-[var(--sidebar-border)]">
                    {item.title}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[var(--sidebar)] border-l border-b border-[var(--sidebar-border)] rotate-45" />
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-[var(--sidebar-primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>

      {/* Bottom Section */}
      <div className="p-3 space-y-2 border-t border-[var(--sidebar-border)]">
        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
            'text-[var(--sidebar-muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10'
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--sidebar-muted)]">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.1 }}
              >
                Deconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User Profile */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-[var(--sidebar-accent)]/50"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {role?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] rounded-full border-2 border-[var(--sidebar)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">
                  {role || 'Admin'}
                </p>
                <p className="text-[10px] text-[var(--sidebar-muted-foreground)]">
                  Connecte
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
