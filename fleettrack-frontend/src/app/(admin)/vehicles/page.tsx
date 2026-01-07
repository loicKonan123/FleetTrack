'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { VehicleStatus, VehicleType, VehicleDto } from '@/types/vehicle';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  Truck,
  Car,
  Fuel,
  Gauge,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Navigation,
  Wrench,
  XCircle,
  CheckCircle2,
  Filter,
  Grid3X3,
  List,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const statusConfig: Record<VehicleStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  [VehicleStatus.Available]: {
    label: 'Disponible',
    color: 'text-[var(--success)]',
    bgColor: 'bg-[var(--success)]/10',
    icon: CheckCircle2,
  },
  [VehicleStatus.InUse]: {
    label: 'En mission',
    color: 'text-[var(--primary)]',
    bgColor: 'bg-[var(--primary)]/10',
    icon: Navigation,
  },
  [VehicleStatus.Maintenance]: {
    label: 'Maintenance',
    color: 'text-[var(--warning)]',
    bgColor: 'bg-[var(--warning)]/10',
    icon: Wrench,
  },
  [VehicleStatus.OutOfService]: {
    label: 'Hors service',
    color: 'text-[var(--destructive)]',
    bgColor: 'bg-[var(--destructive)]/10',
    icon: XCircle,
  },
};

const typeConfig: Record<VehicleType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  [VehicleType.Car]: { label: 'Voiture', icon: Car },
  [VehicleType.Truck]: { label: 'Camion', icon: Truck },
  [VehicleType.Van]: { label: 'Camionnette', icon: Truck },
  [VehicleType.Motorcycle]: { label: 'Moto', icon: Car },
  [VehicleType.Bus]: { label: 'Bus', icon: Truck },
  [VehicleType.Trailer]: { label: 'Remorque', icon: Truck },
  [VehicleType.Other]: { label: 'Autre', icon: Car },
};

export default function VehiclesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { vehicles, isLoading, deleteVehicle } = useVehicles(page, 12);

  const handleDelete = async (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce vehicule?')) {
      try {
        await deleteVehicle(id);
      } catch (error: unknown) {
        const err = error as { message?: string };
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  const filteredVehicles = vehicles?.items?.filter((v) =>
    v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = {
    total: vehicles?.totalCount || 0,
    available: vehicles?.items?.filter((v) => v.status === VehicleStatus.Available).length || 0,
    inUse: vehicles?.items?.filter((v) => v.status === VehicleStatus.InUse).length || 0,
    maintenance: vehicles?.items?.filter((v) => v.status === VehicleStatus.Maintenance).length || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
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
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>Gestion de flotte</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicules</h1>
            <p className="text-[var(--muted-foreground)]">
              Gerez votre flotte de {stats.total} vehicules
            </p>
          </div>
          <Link href="/vehicles/new">
            <Button className="gap-2 h-11 px-5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" />
              Ajouter un vehicule
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total" value={stats.total} icon={Truck} color="primary" />
          <StatsCard label="Disponibles" value={stats.available} icon={CheckCircle2} color="success" />
          <StatsCard label="En mission" value={stats.inUse} icon={Navigation} color="info" />
          <StatsCard label="Maintenance" value={stats.maintenance} icon={Wrench} color="warning" />
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Rechercher par immatriculation, marque ou modele..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-11 pr-4 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 h-11 rounded-xl border-[var(--border)] hover:bg-[var(--muted)]">
                  <Filter className="w-4 h-4" />
                  Filtres
                </Button>
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className={`rounded-none h-11 w-11 ${viewMode === 'grid' ? 'gradient-primary text-white' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className={`rounded-none h-11 w-11 ${viewMode === 'list' ? 'gradient-primary text-white' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[var(--muted)] rounded-lg w-3/4" />
                  <div className="h-4 bg-[var(--muted)] rounded-lg w-1/2" />
                  <div className="h-20 bg-[var(--muted)] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vehicles Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <motion.div
            variants={containerVariants}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
            }
          >
            <AnimatePresence>
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  viewMode={viewMode}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVehicles.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                <Truck className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun vehicule trouve</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? 'Aucun resultat pour votre recherche'
                  : 'Commencez par ajouter votre premier vehicule a la flotte'}
              </p>
              {!searchQuery && (
                <Link href="/vehicles/new">
                  <Button className="gap-2 h-11 px-6 rounded-xl gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                    <Plus className="w-4 h-4" />
                    Ajouter un vehicule
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {vehicles && vehicles.totalPages > 1 && (
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
              {[...Array(Math.min(5, vehicles.totalPages))].map((_, i) => {
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
              onClick={() => setPage((p) => Math.min(vehicles.totalPages, p + 1))}
              disabled={page === vehicles.totalPages}
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
  color: 'primary' | 'success' | 'info' | 'warning';
}) {
  const styles = {
    primary: { bg: 'bg-[var(--primary)]/10', text: 'text-[var(--primary)]', border: 'border-[var(--primary)]/20' },
    success: { bg: 'bg-[var(--success)]/10', text: 'text-[var(--success)]', border: 'border-[var(--success)]/20' },
    info: { bg: 'bg-[var(--info)]/10', text: 'text-[var(--info)]', border: 'border-[var(--info)]/20' },
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

function VehicleCard({
  vehicle,
  viewMode,
  onDelete,
}: {
  vehicle: VehicleDto;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
}) {
  const status = statusConfig[vehicle.status];
  const type = typeConfig[vehicle.type];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  if (viewMode === 'list') {
    return (
      <motion.div variants={itemVariants} layout whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{vehicle.registrationNumber}</p>
                <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>{vehicle.mileage?.toLocaleString() || 0} km</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                <span>{vehicle.currentFuelLevel?.toFixed(0) || 0}%</span>
              </div>
            </div>
            <VehicleActions vehicle={vehicle} onDelete={onDelete} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className="group rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--primary)]/30 transition-all overflow-hidden">
        {/* Header with gradient */}
        <div className="relative h-28 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--accent)]/10 to-transparent">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,var(--card))]" />
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0 backdrop-blur-sm`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <VehicleActions vehicle={vehicle} onDelete={onDelete} />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="p-4 rounded-2xl bg-[var(--card)] shadow-lg border border-[var(--border)] group-hover:scale-110 transition-transform">
              <TypeIcon className="w-8 h-8 text-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="pt-10 pb-6 px-6">
          {/* Registration */}
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold">{vehicle.registrationNumber}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {vehicle.brand} {vehicle.model}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="text-center p-3 rounded-xl bg-[var(--muted)]/50">
              <Calendar className="w-4 h-4 mx-auto text-[var(--muted-foreground)] mb-1" />
              <p className="text-xs font-medium">{vehicle.year}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--muted)]/50">
              <Gauge className="w-4 h-4 mx-auto text-[var(--muted-foreground)] mb-1" />
              <p className="text-xs font-medium">{(vehicle.mileage / 1000).toFixed(0)}k km</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--muted)]/50">
              <Fuel className="w-4 h-4 mx-auto text-[var(--muted-foreground)] mb-1" />
              <p className="text-xs font-medium">{vehicle.currentFuelLevel?.toFixed(0) || 0}%</p>
            </div>
          </div>

          {/* Fuel Bar */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Niveau carburant</span>
              <span className="font-medium">{vehicle.currentFuelLevel?.toFixed(0) || 0}%</span>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vehicle.currentFuelLevel || 0}%` }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className={`h-full rounded-full ${
                  (vehicle.currentFuelLevel || 0) > 50
                    ? 'bg-[var(--success)]'
                    : (vehicle.currentFuelLevel || 0) > 25
                    ? 'bg-[var(--warning)]'
                    : 'bg-[var(--destructive)]'
                }`}
              />
            </div>
          </div>

          {/* View Button */}
          <Link href={`/vehicles/${vehicle.id}`}>
            <Button variant="outline" className="w-full h-10 rounded-xl border-[var(--border)] gap-2 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)] transition-all">
              <Eye className="w-4 h-4" />
              Voir les details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function VehicleActions({
  vehicle,
  onDelete,
}: {
  vehicle: VehicleDto;
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
          <Link href={`/vehicles/${vehicle.id}`}>
            <Eye className="w-4 h-4" />
            Voir les details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
          <Link href={`/vehicles/${vehicle.id}/edit`}>
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer rounded-lg text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
          onClick={() => onDelete(vehicle.id)}
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
