'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import {
  LogOut,
  Search,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--card)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-10 pl-10 pr-20 rounded-xl bg-[var(--muted)] border border-transparent focus:border-[var(--primary)] focus:bg-[var(--card)] focus:shadow-[0_0_0_3px_var(--primary-light)] outline-none transition-all text-sm placeholder:text-[var(--muted-foreground)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 text-[var(--muted-foreground)]">
              <kbd className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-[var(--card)] border border-[var(--border)] rounded-md shadow-sm">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--border)] mx-2" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 h-auto rounded-xl hover:bg-[var(--muted)] transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-medium text-sm shadow-md">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}{user?.lastName?.[0]?.toUpperCase() || ''}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--success)] rounded-full border-2 border-[var(--card)]" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium leading-tight">
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                    {user?.roleName || 'Admin'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)] hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[var(--border)] shadow-xl">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.username || 'user'}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{user?.email || 'user@email.com'}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="gap-3 cursor-pointer text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10 rounded-lg h-9"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Deconnexion</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
