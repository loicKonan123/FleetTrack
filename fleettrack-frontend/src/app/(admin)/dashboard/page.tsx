'use client';

import { Button } from '@/components/ui/button';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useMissions } from '@/lib/hooks/useMissions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { MissionStatus, VehicleStatus } from '@/types';
import { motion, Variants } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Fuel,
  MapPin,
  Navigation,
  Sparkles,
  Timer,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function DashboardPage() {
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);
  const { missions } = useMissions(1, 100);

  const vehicleItems = Array.isArray(vehicles?.items) ? vehicles.items : [];
  const driverItems = Array.isArray(drivers?.items) ? drivers.items : [];
  const missionItems = Array.isArray(missions?.items) ? missions.items : [];

  const stats = {
    totalVehicles: vehicles?.totalCount || 0,
    availableVehicles: vehicleItems.filter((v) => v.status === VehicleStatus.Available).length,
    inUseVehicles: vehicleItems.filter((v) => v.status === VehicleStatus.InUse).length,
    maintenanceVehicles: vehicleItems.filter((v) => v.status === VehicleStatus.Maintenance).length,
    totalDrivers: drivers?.totalCount || 0,
    availableDrivers: driverItems.filter((d) => d.status === 0).length,
    activeMissions: missionItems.filter((m) => m.status === MissionStatus.InProgress).length,
    pendingMissions: missionItems.filter((m) => m.status === MissionStatus.Planned || m.status === MissionStatus.Assigned).length,
    completedMissions: missionItems.filter((m) => m.status === MissionStatus.Completed).length,
  };

  const fleetUsagePercent = stats.totalVehicles > 0
    ? Math.round((stats.inUseVehicles / stats.totalVehicles) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 lg:p-8 space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span>Tableau de bord</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Bienvenue sur{' '}
                <span className="text-gradient">FleetTrack</span>
              </h1>
              <p className="text-[var(--muted-foreground)] max-w-lg">
                Gerez votre flotte de vehicules en temps reel avec des outils intelligents et des analyses avancees.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--muted)] text-sm">
                <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="font-medium">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <Link href="/tracking">
                <Button className="gap-2 h-11 px-5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Navigation className="w-4 h-4" />
                  Tracking en direct
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Vehicles Card */}
          <Link href="/vehicles" className="group">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">Vehicules</p>
                  <p className="text-3xl font-bold">{stats.totalVehicles}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                    {stats.availableVehicles} disponibles
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Drivers Card */}
          <Link href="/drivers" className="group">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">Conducteurs</p>
                  <p className="text-3xl font-bold">{stats.totalDrivers}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stats.availableDrivers} actifs
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Missions Card */}
          <Link href="/missions" className="group">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--success)]/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--success)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-[var(--success)]" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">Missions actives</p>
                  <p className="text-3xl font-bold">{stats.activeMissions}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {stats.pendingMissions} en attente
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Alerts Card */}
          <Link href="/alerts" className="group">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--warning)]/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--warning)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-6 h-6 text-[var(--warning)]" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">Alertes</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Tout est OK
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Actions Banner */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--primary)]/5 border border-[var(--border)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Actions rapides</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Gerez votre flotte en quelques clics</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/vehicles/new">
                  <Button variant="outline" className="gap-2 h-10 rounded-xl hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                    <Truck className="w-4 h-4" />
                    Ajouter vehicule
                  </Button>
                </Link>
                <Link href="/drivers/new">
                  <Button variant="outline" className="gap-2 h-10 rounded-xl hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all">
                    <Users className="w-4 h-4" />
                    Ajouter conducteur
                  </Button>
                </Link>
                <Link href="/missions/new">
                  <Button variant="outline" className="gap-2 h-10 rounded-xl hover:bg-[var(--success)] hover:text-white hover:border-[var(--success)] transition-all">
                    <MapPin className="w-4 h-4" />
                    Nouvelle mission
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Fleet Overview */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="h-full p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Apercu de la flotte</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Etat actuel de vos vehicules</p>
                </div>
                <Link href="/vehicles">
                  <Button variant="ghost" size="sm" className="gap-1 text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Fleet Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <FleetStatusCard
                  icon={CheckCircle2}
                  label="Disponibles"
                  value={stats.availableVehicles}
                  color="success"
                />
                <FleetStatusCard
                  icon={Navigation}
                  label="En mission"
                  value={stats.inUseVehicles}
                  color="primary"
                />
                <FleetStatusCard
                  icon={Wrench}
                  label="Maintenance"
                  value={stats.maintenanceVehicles}
                  color="warning"
                />
                <FleetStatusCard
                  icon={XCircle}
                  label="Hors service"
                  value={0}
                  color="destructive"
                />
              </div>

              {/* Progress Section */}
              <div className="p-4 rounded-xl bg-[var(--muted)]/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Utilisation de la flotte</span>
                  <span className="text-sm font-bold text-[var(--primary)]">{fleetUsagePercent}%</span>
                </div>
                <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fleetUsagePercent}%` }}
                    transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                    className="h-full gradient-primary rounded-full"
                  />
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    Disponibles ({stats.availableVehicles})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    En mission ({stats.inUseVehicles})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                    Maintenance ({stats.maintenanceVehicles})
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Missions */}
          <motion.div variants={itemVariants}>
            <div className="h-full p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Missions recentes</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Dernieres activites</p>
                </div>
                <Link href="/missions">
                  <Button variant="ghost" size="sm" className="gap-1 text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {missionItems.slice(0, 5).map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg ${
                      mission.status === MissionStatus.InProgress
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : mission.status === MissionStatus.Completed
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                    }`}>
                      {mission.status === MissionStatus.InProgress ? (
                        <Timer className="w-4 h-4" />
                      ) : mission.status === MissionStatus.Completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{mission.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {new Date(mission.startDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {missionItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-[var(--muted-foreground)]" />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">Aucune mission recente</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Cards */}
        <motion.div variants={itemVariants} className="grid gap-5 md:grid-cols-3">
          <MetricCard
            icon={Fuel}
            label="Consommation moyenne"
            value="8.5"
            unit="L/100km"
            color="primary"
          />
          <MetricCard
            icon={Navigation}
            label="Distance ce mois"
            value="12,450"
            unit="km"
            color="success"
          />
          <MetricCard
            icon={Activity}
            label="Taux de reussite"
            value="98.5"
            unit="%"
            color="accent"
          />
        </motion.div>

        {/* Empty State Welcome */}
        {vehicleItems.length === 0 && missionItems.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden p-10 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/5 to-[var(--primary)]/10 border border-[var(--border)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex p-5 rounded-3xl gradient-primary text-white mb-6 shadow-xl shadow-blue-500/30"
                >
                  <Truck className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3">Bienvenue sur FleetTrack</h2>
                <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-8">
                  Votre systeme complet de gestion de flotte avec suivi GPS en temps reel.
                  Commencez par ajouter des vehicules et des conducteurs.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/vehicles/new">
                    <Button className="gap-2 h-12 px-6 rounded-xl gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all">
                      <Truck className="w-5 h-5" />
                      Ajouter mon premier vehicule
                    </Button>
                  </Link>
                  <Link href="/drivers/new">
                    <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all">
                      <Users className="w-5 h-5" />
                      Ajouter un conducteur
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function FleetStatusCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'success' | 'primary' | 'warning' | 'destructive';
}) {
  const styles = {
    success: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    primary: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
    warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
    destructive: 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${styles[color]} transition-all cursor-default`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color: 'primary' | 'success' | 'accent';
}) {
  const styles = {
    primary: 'from-[var(--primary)]/10 to-[var(--primary)]/5',
    success: 'from-[var(--success)]/10 to-[var(--success)]/5',
    accent: 'from-[var(--accent)]/10 to-[var(--accent)]/5',
  };

  const iconStyles = {
    primary: 'bg-[var(--primary)]/20 text-[var(--primary)]',
    success: 'bg-[var(--success)]/20 text-[var(--success)]',
    accent: 'bg-[var(--accent)]/20 text-[var(--accent)]',
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${styles[color]} border border-[var(--border)]`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-bold">
            {value} <span className="text-base font-normal text-[var(--muted-foreground)]">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
