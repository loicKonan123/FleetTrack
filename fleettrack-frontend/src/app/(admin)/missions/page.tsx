'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMissions } from '@/lib/hooks/useMissions';
import { MissionPriority, MissionStatus, MissionDto } from '@/types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Truck,
  User,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Timer,
  Route,
  Flag,
  Sparkles,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
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

const statusConfig: Record<MissionStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  [MissionStatus.Planned]: {
    label: 'Planifiee',
    color: 'text-[var(--muted-foreground)]',
    bgColor: 'bg-[var(--muted)]',
    icon: Calendar,
  },
  [MissionStatus.Assigned]: {
    label: 'Assignee',
    color: 'text-[var(--warning)]',
    bgColor: 'bg-[var(--warning)]/10',
    icon: User,
  },
  [MissionStatus.InProgress]: {
    label: 'En cours',
    color: 'text-[var(--primary)]',
    bgColor: 'bg-[var(--primary)]/10',
    icon: Timer,
  },
  [MissionStatus.Completed]: {
    label: 'Terminee',
    color: 'text-[var(--success)]',
    bgColor: 'bg-[var(--success)]/10',
    icon: CheckCircle2,
  },
  [MissionStatus.Cancelled]: {
    label: 'Annulee',
    color: 'text-[var(--destructive)]',
    bgColor: 'bg-[var(--destructive)]/10',
    icon: XCircle,
  },
};

const priorityConfig: Record<MissionPriority, { label: string; color: string; bgColor: string }> = {
  [MissionPriority.Low]: { label: 'Faible', color: 'text-[var(--muted-foreground)]', bgColor: 'bg-[var(--muted)]' },
  [MissionPriority.Medium]: { label: 'Moyenne', color: 'text-[var(--primary)]', bgColor: 'bg-[var(--primary)]/10' },
  [MissionPriority.High]: { label: 'Haute', color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10' },
  [MissionPriority.Urgent]: { label: 'Urgente', color: 'text-[var(--destructive)]', bgColor: 'bg-[var(--destructive)]/10' },
};

export default function MissionsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filters: Record<string, string> = {};
  if (statusFilter !== 'all') filters.status = statusFilter;
  if (priorityFilter !== 'all') filters.priority = priorityFilter;

  const { missions, isLoading, deleteMission } = useMissions(page, 12, filters);

  const handleDelete = async (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette mission ?')) {
      try {
        await deleteMission(id);
        toast.success('Mission supprimee avec succes');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const filteredMissions = missions?.items?.filter((mission) => {
    const matchesSearch =
      mission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const stats = {
    total: missions?.totalCount || 0,
    inProgress: missions?.items?.filter((m) => m.status === MissionStatus.InProgress).length || 0,
    completed: missions?.items?.filter((m) => m.status === MissionStatus.Completed).length || 0,
    planned: missions?.items?.filter((m) => m.status === MissionStatus.Planned || m.status === MissionStatus.Assigned).length || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--success)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
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
              <Sparkles className="w-4 h-4 text-[var(--success)]" />
              <span>Gestion des operations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Missions</h1>
            <p className="text-[var(--muted-foreground)]">
              Gerez et suivez vos {stats.total} missions
            </p>
          </div>
          <Link href="/missions/new">
            <Button className="gap-2 h-11 px-5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" />
              Nouvelle mission
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total" value={stats.total} icon={MapPin} color="primary" />
          <StatsCard label="En cours" value={stats.inProgress} icon={Timer} color="info" />
          <StatsCard label="Terminees" value={stats.completed} icon={CheckCircle2} color="success" />
          <StatsCard label="Planifiees" value={stats.planned} icon={Calendar} color="warning" />
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Rechercher par nom, vehicule ou conducteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-11 pr-4 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-11 rounded-xl border-[var(--border)]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border)]">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="0">Planifiee</SelectItem>
                    <SelectItem value="1">Assignee</SelectItem>
                    <SelectItem value="2">En cours</SelectItem>
                    <SelectItem value="3">Terminee</SelectItem>
                    <SelectItem value="4">Annulee</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[160px] h-11 rounded-xl border-[var(--border)]">
                    <SelectValue placeholder="Priorite" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border)]">
                    <SelectItem value="all">Toutes priorites</SelectItem>
                    <SelectItem value="0">Faible</SelectItem>
                    <SelectItem value="1">Moyenne</SelectItem>
                    <SelectItem value="2">Haute</SelectItem>
                    <SelectItem value="3">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
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

        {/* Missions Grid */}
        {!isLoading && filteredMissions.length > 0 && (
          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMissions.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                <MapPin className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune mission trouvee</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                {searchTerm ? 'Aucun resultat pour votre recherche' : 'Commencez par creer votre premiere mission'}
              </p>
              {!searchTerm && (
                <Link href="/missions/new">
                  <Button className="gap-2 h-11 px-6 rounded-xl gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                    <Plus className="w-4 h-4" />
                    Creer une mission
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {missions && missions.totalPages > 1 && (
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
              {[...Array(Math.min(5, missions.totalPages))].map((_, i) => {
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
              onClick={() => setPage((p) => Math.min(missions.totalPages, p + 1))}
              disabled={page === missions.totalPages}
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
  label, value, icon: Icon, color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'info' | 'success' | 'warning';
}) {
  const styles = {
    primary: { bg: 'bg-[var(--primary)]/10', text: 'text-[var(--primary)]', border: 'border-[var(--primary)]/20' },
    info: { bg: 'bg-[var(--info)]/10', text: 'text-[var(--info)]', border: 'border-[var(--info)]/20' },
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

function MissionCard({ mission, onDelete }: { mission: MissionDto; onDelete: (id: string) => void }) {
  const status = statusConfig[mission.status];
  const priority = priorityConfig[mission.priority];
  const StatusIcon = status.icon;

  return (
    <motion.div variants={itemVariants} layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className="group rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--success)]/30 transition-all overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-3 rounded-xl ${status.bgColor} flex-shrink-0`}>
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{mission.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">{mission.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className={`${priority.bgColor} ${priority.color} border-0`}>
              <Flag className="w-3 h-3 mr-1" />
              {priority.label}
            </Badge>
            <MissionActions mission={mission} onDelete={onDelete} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Timeline */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
              <div className="w-0.5 h-10 bg-[var(--border)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--destructive)]" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Date debut</p>
                <p className="text-sm font-medium">
                  {mission.startDate ? format(new Date(mission.startDate), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Non defini'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Date fin</p>
                <p className="text-sm font-medium">
                  {mission.endDate ? format(new Date(mission.endDate), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Non defini'}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[var(--muted)]/50">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                <Truck className="w-4 h-4" />
                <span className="text-xs">Vehicule</span>
              </div>
              <p className="text-sm font-medium truncate">{mission.vehicleRegistration || 'Non assigne'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--muted)]/50">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs">Conducteur</span>
              </div>
              <p className="text-sm font-medium truncate">{mission.driverName || 'Non assigne'}</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Clock className="w-4 h-4" />
              {mission.startDate
                ? format(new Date(mission.startDate), 'dd MMM yyyy', { locale: fr })
                : 'Date non definie'}
            </div>
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Route className="w-4 h-4" />
              {mission.estimatedDistance || 0} km
            </div>
          </div>
        </div>

        {/* View Button */}
        <div className="px-5 pb-5">
          <Link href={`/missions/${mission.id}`}>
            <Button variant="outline" className="w-full h-10 rounded-xl border-[var(--border)] gap-2 group-hover:bg-[var(--success)] group-hover:text-white group-hover:border-[var(--success)] transition-all">
              <Eye className="w-4 h-4" />
              Voir les details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function MissionActions({ mission, onDelete }: { mission: MissionDto; onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[var(--muted)]">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-[var(--border)] shadow-xl">
        <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
          <Link href={`/missions/${mission.id}`}>
            <Eye className="w-4 h-4" />
            Voir details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
          <Link href={`/missions/${mission.id}/edit`}>
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer rounded-lg text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
          onClick={() => onDelete(mission.id)}
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
