'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Navigation,
  Menu,
  Home,
  Map,
  Car,
  LogOut,
  User,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { clearTokens } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Tracking',
    href: '/driver-tracking',
    icon: <Navigation className="h-5 w-5" />,
    description: 'Envoyer ma position GPS',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
    description: 'Tableau de bord',
  },
  {
    label: 'Carte en direct',
    href: '/tracking',
    icon: <Map className="h-5 w-5" />,
    description: 'Voir tous les véhicules',
  },
  {
    label: 'Véhicules',
    href: '/vehicles',
    icon: <Car className="h-5 w-5" />,
    description: 'Liste des véhicules',
  },
];

export function DriverNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">FleetTrack</span>
        </Link>

        {/* Current Page Title - Mobile */}
        <div className="flex-1 text-center sm:hidden">
          <span className="font-medium text-sm">
            {navItems.find((item) => item.href === pathname)?.label || 'FleetTrack'}
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Truck className="h-5 w-5 text-primary-foreground" />
                </div>
                FleetTrack
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div
                            className={`text-xs ${
                              pathname === item.href
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                </Link>
              ))}

              <div className="my-4 border-t" />

              {/* User Section */}
              <div className="p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Mode Conducteur</div>
                    <div className="text-xs text-muted-foreground">Tracking GPS actif</div>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                className="mt-4 w-full gap-2"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
