'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { AlertType, AlertTypeLabels, AlertSeverity, AlertSeverityLabels, AlertDto } from '@/types/alert';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bell,
  CheckCircle,
  Eye,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Car,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

const severityConfig = {
  [AlertSeverity.Info]: {
    icon: Info,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  [AlertSeverity.Warning]: {
    icon: AlertTriangle,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600'
  },
  [AlertSeverity.Error]: {
    icon: AlertCircle,
    color: 'red',
    gradient: 'from-red-500 to-rose-600'
  },
  [AlertSeverity.Critical]: {
    icon: XCircle,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600'
  }
};

function StatsCard({ title, value, icon: Icon, trend, color }: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  color: 'blue' | 'amber' | 'red' | 'purple' | 'green';
}) {
  const colorClasses = {
    blue: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    amber: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    red: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-gradient-to-br from-red-500 to-rose-600'
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    green: {
      border: 'border-l-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div variants={cardVariants}>
      <Card className={`relative overflow-hidden border-0 border-l-4 ${classes.border} bg-[var(--card)] shadow-lg hover:shadow-xl transition-all duration-300 group`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <p className={`text-xs font-medium ${classes.text}`}>{trend}</p>
              )}
            </div>
            <div className={`p-3 rounded-2xl ${classes.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div className={`absolute inset-0 ${classes.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      </Card>
    </motion.div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onDelete
}: {
  alert: AlertDto;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const severity = alert.severity as AlertSeverity;
  const config = severityConfig[severity] || severityConfig[AlertSeverity.Info];
  const SeverityIcon = config.icon;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
      ring: 'ring-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      ring: 'ring-amber-500/20'
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
      ring: 'ring-red-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
      ring: 'ring-purple-500/20'
    }
  };

  const classes = colorClasses[config.color as keyof typeof colorClasses];

  const getStatusBadge = () => {
    if (alert.isResolved) {
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Résolue
        </Badge>
      );
    }
    if (alert.isAcknowledged) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
          <Eye className="h-3 w-3 mr-1" />
          Acquittée
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse">
        <Bell className="h-3 w-3 mr-1" />
        Nouvelle
      </Badge>
    );
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className={`relative overflow-hidden border-0 bg-[var(--card)] shadow-lg hover:shadow-xl transition-all duration-300 group ${!alert.isResolved && !alert.isAcknowledged ? `ring-2 ${classes.ring}` : ''}`}>
        <CardContent className="p-0">
          {/* Severity indicator bar */}
          <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Severity icon and content */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-2xl ${classes.bg} ${classes.text} flex-shrink-0 shadow-sm`}>
                  <SeverityIcon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${classes.bg} ${classes.text} ${classes.border} hover:opacity-80`}>
                      {AlertSeverityLabels[severity]}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-[var(--border)] text-[var(--muted-foreground)]">
                      {AlertTypeLabels[alert.type as AlertType]}
                    </Badge>
                    {getStatusBadge()}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg truncate">{alert.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">{alert.message}</p>
                  </div>

                  {/* Vehicle and time info */}
                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    {alert.vehicleRegistration && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--muted)]/50">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">{alert.vehicleRegistration}</span>
                        {(alert.vehicleBrand || alert.vehicleModel) && (
                          <span className="text-xs opacity-70">({alert.vehicleBrand} {alert.vehicleModel})</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(alert.triggeredAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                    </div>
                  </div>

                  {/* Resolution info if resolved */}
                  {alert.isResolved && alert.resolution && (
                    <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1.5 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Résolution
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">{alert.resolution}</p>
                      {alert.resolvedAt && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-2 opacity-70">
                          Résolue le {format(new Date(alert.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Acknowledged info */}
                  {alert.isAcknowledged && !alert.isResolved && alert.acknowledgedAt && (
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Acquittée le {format(new Date(alert.acknowledgedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        {alert.acknowledgedBy && ` par ${alert.acknowledgedBy}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 rounded-xl hover:bg-[var(--muted)]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-xl">
                  {!alert.isAcknowledged && (
                    <DropdownMenuItem onClick={() => onAcknowledge(alert.id)} className="rounded-lg cursor-pointer">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Acquitter
                    </DropdownMenuItem>
                  )}
                  {!alert.isResolved && (
                    <DropdownMenuItem onClick={() => onResolve(alert.id)} className="rounded-lg cursor-pointer">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Résoudre
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[var(--border)]" />
                  <DropdownMenuItem onClick={() => onDelete(alert.id)} className="text-red-600 dark:text-red-400 rounded-lg cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const filters: Record<string, string | boolean | number | undefined> = {};
  if (typeFilter !== 'all') {
    filters.type = parseInt(typeFilter);
  }
  if (severityFilter !== 'all') {
    filters.severity = parseInt(severityFilter);
  }
  if (statusFilter === 'unacknowledged') {
    filters.isAcknowledged = false;
  } else if (statusFilter === 'unresolved') {
    filters.isResolved = false;
  } else if (statusFilter === 'resolved') {
    filters.isResolved = true;
  }

  const { alerts, isLoading, acknowledgeAlert, resolveAlert, deleteAlert } = useAlerts(page, 10, filters);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert({ id, data: { acknowledgedBy: 'Admin' } });
      toast.success('Alerte acquittée avec succès');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erreur: ${err.message || "Erreur lors de l'acquittement"}`);
    }
  };

  const openResolveDialog = (id: string) => {
    setSelectedAlert(id);
    setResolution('');
    setIsResolveOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedAlert || !resolution.trim()) {
      toast.error('Veuillez entrer une résolution');
      return;
    }

    try {
      await resolveAlert({ id: selectedAlert, data: { resolution } });
      toast.success('Alerte résolue avec succès');
      setIsResolveOpen(false);
      setSelectedAlert(null);
      setResolution('');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erreur: ${err.message || 'Erreur lors de la résolution'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      try {
        await deleteAlert(id);
        toast.success('Alerte supprimée avec succès');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const filteredAlerts = alerts?.items?.filter((alert) => {
    const matchesSearch =
      alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats
  const totalAlerts = alerts?.totalCount || 0;
  const unacknowledgedCount = filteredAlerts?.filter(a => !a.isAcknowledged).length || 0;
  const unresolvedCount = filteredAlerts?.filter(a => !a.isResolved).length || 0;
  const criticalCount = filteredAlerts?.filter(a => a.severity === AlertSeverity.Critical && !a.isResolved).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg bg-[var(--card)]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-[var(--muted)] rounded w-24" />
                  <div className="h-8 bg-[var(--muted)] rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-lg bg-[var(--card)]">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-[var(--muted)] rounded-xl" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/25">
            <Bell className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Centre d&apos;alertes</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Alertes</h1>
            <p className="text-[var(--muted-foreground)] mt-1">Gérez et suivez toutes les alertes du système</p>
          </div>
        </div>
        {criticalCount > 0 && (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 animate-pulse px-4 py-2 text-sm shadow-lg shadow-red-500/25">
            <XCircle className="h-4 w-4 mr-2" />
            {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}
          </Badge>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Alertes"
          value={totalAlerts}
          icon={Bell}
          color="blue"
        />
        <StatsCard
          title="Non Acquittées"
          value={unacknowledgedCount}
          icon={Eye}
          trend={unacknowledgedCount > 0 ? "Action requise" : "Tout est acquitté"}
          color="amber"
        />
        <StatsCard
          title="Non Résolues"
          value={unresolvedCount}
          icon={Shield}
          trend={unresolvedCount > 0 ? "À résoudre" : "Tout est résolu"}
          color="red"
        />
        <StatsCard
          title="Critiques Actives"
          value={criticalCount}
          icon={XCircle}
          trend={criticalCount > 0 ? "Priorité haute" : "Aucune critique"}
          color="purple"
        />
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-[var(--card)]/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Rechercher par titre, message, véhicule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 rounded-xl border-[var(--border)] bg-[var(--muted)]/50 focus:bg-[var(--card)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filtres:</span>
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-44 h-11 rounded-xl border-[var(--border)] bg-[var(--muted)]/50 focus:bg-[var(--card)]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <SelectItem value="all" className="rounded-lg">Tous les types</SelectItem>
                    {Object.entries(AlertTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="rounded-lg">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-36 h-11 rounded-xl border-[var(--border)] bg-[var(--muted)]/50 focus:bg-[var(--card)]">
                    <SelectValue placeholder="Sévérité" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <SelectItem value="all" className="rounded-lg">Toutes</SelectItem>
                    {Object.entries(AlertSeverityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="rounded-lg">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-11 rounded-xl border-[var(--border)] bg-[var(--muted)]/50 focus:bg-[var(--card)]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <SelectItem value="all" className="rounded-lg">Toutes</SelectItem>
                    <SelectItem value="unacknowledged" className="rounded-lg">Non acquittées</SelectItem>
                    <SelectItem value="unresolved" className="rounded-lg">Non résolues</SelectItem>
                    <SelectItem value="resolved" className="rounded-lg">Résolues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
      >
        {filteredAlerts && filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={openResolveDialog}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-[var(--card)]">
              <CardContent className="p-16 text-center">
                <div className="p-4 rounded-2xl bg-green-500/10 w-fit mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucune alerte</h3>
                <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                  Aucune alerte ne correspond à vos critères de recherche. Modifiez les filtres pour voir plus de résultats.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      {alerts && alerts.totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-[var(--card)]/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Page <span className="font-semibold text-[var(--foreground)]">{alerts.pageNumber}</span> sur{' '}
                  <span className="font-semibold text-[var(--foreground)]">{alerts.totalPages}</span>
                  {' '}({alerts.totalCount} alertes au total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(alerts.totalPages, p + 1))}
                    disabled={page === alerts.totalPages}
                    className="rounded-xl border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent className="rounded-2xl border-[var(--border)] bg-[var(--card)] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              Résoudre l&apos;alerte
            </DialogTitle>
            <DialogDescription className="text-[var(--muted-foreground)]">
              Décrivez comment cette alerte a été résolue
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution" className="text-sm font-medium">Résolution</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Décrivez comment l'alerte a été résolue..."
                rows={4}
                className="rounded-xl resize-none border-[var(--border)] bg-[var(--muted)]/50 focus:bg-[var(--card)] transition-colors"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResolveOpen(false)}
              className="rounded-xl border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleResolve}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Résoudre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
