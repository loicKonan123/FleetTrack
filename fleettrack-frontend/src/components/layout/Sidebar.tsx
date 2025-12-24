'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  AlertCircle,
  Wrench,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Vehicles', href: '/vehicles', icon: Truck },
  { title: 'Drivers', href: '/drivers', icon: Users },
  { title: 'Missions', href: '/missions', icon: MapPin },
  { title: 'Tracking', href: '/tracking', icon: MapPin },
  { title: 'Alerts', href: '/alerts', icon: AlertCircle },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  const navItems = adminNavItems.filter(
    (item) => !item.roles || item.roles.includes(role || '')
  );

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
