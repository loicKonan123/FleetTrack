'use client';

import { useState } from 'react';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  UserCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DriverDto } from '@/types/driver';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function DriversPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { drivers, isLoading, deleteDriver } = useDrivers(page, 12);

  const handleDelete = async (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce conducteur ?')) {
      try {
        await deleteDriver(id);
        toast.success('Conducteur supprime avec succes');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message}`);
      }
    }
  };

  const filteredDrivers = drivers?.items?.filter((driver) =>
    driver.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: drivers?.totalCount || 0,
    available: drivers?.items?.filter((d) => d.status === 0).length || 0,
    unavailable: drivers?.items?.filter((d) => d.status !== 0).length || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 lg:p-8 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Gestion d'equipe</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Conducteurs</h1>
            <p className="text-[var(--muted-foreground)]">
              Gerez votre equipe de {stats.total} conducteurs
            </p>
          </div>
          <Link href="/drivers/new">
            <Button className="gap-2 h-11 px-5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" />
              Ajouter un conducteur
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard label="Total conducteurs" value={stats.total} icon={Users} color="accent" />
          <StatsCard label="Disponibles" value={stats.available} icon={CheckCircle2} color="success" />
          <StatsCard label="En mission" value={stats.unavailable} icon={Clock} color="warning" />
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Rechercher par nom ou numero de permis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-11 pr-4 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                />
              </div>
              <Button variant="outline" className="gap-2 h-11 rounded-xl border-[var(--border)] hover:bg-[var(--muted)]">
                <Filter className="w-4 h-4" />
                Filtres
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[var(--muted)] rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--muted)] rounded-lg w-3/4" />
                      <div className="h-3 bg-[var(--muted)] rounded-lg w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drivers Grid */}
        {!isLoading && filteredDrivers.length > 0 && (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDrivers.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                <Users className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun conducteur trouve</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                {searchTerm
                  ? 'Aucun resultat pour votre recherche'
                  : 'Commencez par ajouter votre premier conducteur'}
              </p>
              {!searchTerm && (
                <Link href="/drivers/new">
                  <Button className="gap-2 h-11 px-6 rounded-xl gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                    <Plus className="w-4 h-4" />
                    Ajouter un conducteur
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {drivers && drivers.totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-[var(--border)]"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, drivers.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="icon"
                    className={`w-10 h-10 rounded-xl ${page === pageNum ? 'gradient-primary text-white' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-[var(--border)]"
              onClick={() => setPage((p) => Math.min(drivers.totalPages, p + 1))}
              disabled={page === drivers.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'accent' | 'success' | 'warning';
}) {
  const styles = {
    accent: { bg: 'bg-[var(--accent)]/10', text: 'text-[var(--accent)]', border: 'border-[var(--accent)]/20' },
    success: { bg: 'bg-[var(--success)]/10', text: 'text-[var(--success)]', border: 'border-[var(--success)]/20' },
    warning: { bg: 'bg-[var(--warning)]/10', text: 'text-[var(--warning)]', border: 'border-[var(--warning)]/20' },
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <div className={`p-5 rounded-2xl bg-[var(--card)] border ${styles[color].border} shadow-sm hover:shadow-md transition-all`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${styles[color].bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${styles[color].text}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DriverCard({
  driver,
  onDelete,
}: {
  driver: DriverDto;
  onDelete: (id: string) => void;
}) {
  const isAvailable = driver.status === 0;
  const licenseExpired = driver.licenseExpiryDate
    ? new Date(driver.licenseExpiryDate) < new Date()
    : false;

  return (
    <motion.div variants={itemVariants} layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className="group rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCircle className="w-9 h-9 text-[var(--accent)]" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--card)] flex items-center justify-center ${
                  isAvailable ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                }`}>
                  {isAvailable ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <Clock className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {driver.firstName} {driver.lastName}
                </h3>
                <Badge
                  variant="outline"
                  className={`mt-1 border-0 ${isAvailable
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                  }`}
                >
                  {isAvailable ? 'Disponible' : 'En mission'}
                </Badge>
              </div>
            </div>
            <DriverActions driver={driver} onDelete={onDelete} />
          </div>

          {/* Contact Info */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <span className="text-[var(--muted-foreground)] truncate">{driver.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <span className="text-[var(--muted-foreground)]">{driver.phoneNumber}</span>
            </div>
          </div>

          {/* License Info */}
          <div className="p-4 rounded-xl bg-[var(--muted)]/50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <CreditCard className="w-4 h-4" />
                <span>N Permis</span>
              </div>
              <span className="font-medium">{driver.licenseNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Calendar className="w-4 h-4" />
                <span>Expiration</span>
              </div>
              <span className={`font-medium flex items-center gap-1 ${licenseExpired ? 'text-[var(--destructive)]' : ''}`}>
                {driver.licenseExpiryDate
                  ? format(new Date(driver.licenseExpiryDate), 'dd MMM yyyy', { locale: fr })
                  : 'N/A'}
                {licenseExpired && <XCircle className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>

          {/* View Button */}
          <Link href={`/drivers/${driver.id}`} className="block mt-5">
            <Button variant="outline" className="w-full h-10 rounded-xl border-[var(--border)] gap-2 group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent)] transition-all">
              <Eye className="w-4 h-4" />
              Voir le profil
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function DriverActions({
  driver,
  onDelete,
}: {
  driver: DriverDto;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[var(--muted)]">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-[var(--border)] shadow-xl">
        <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
          <Link href={`/drivers/${driver.id}`}>
            <Eye className="w-4 h-4" />
            Voir le profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
          <Link href={`/drivers/${driver.id}/edit`}>
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer rounded-lg text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
          onClick={() => onDelete(driver.id)}
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
