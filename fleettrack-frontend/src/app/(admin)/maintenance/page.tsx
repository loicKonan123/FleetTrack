'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMaintenance } from '@/lib/hooks/useMaintenance';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { CreateMaintenanceRequest, MaintenanceType, MaintenanceTypeLabels, MaintenanceDto } from '@/types/maintenance';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Wrench,
  Search,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Building2,
  Sparkles,
} from 'lucide-react';
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
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState<Partial<CreateMaintenanceRequest>>({
    type: MaintenanceType.Preventive,
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    mileageAtMaintenance: 0,
    cost: 0,
    serviceProvider: '',
    notes: '',
    vehicleId: '',
  });

  const filters: Record<string, string | number | boolean | undefined> = {};
  if (typeFilter !== 'all') filters.type = parseInt(typeFilter);
  if (statusFilter !== 'all') filters.isCompleted = statusFilter === 'completed';

  const { maintenance, isLoading, createMaintenance, completeMaintenance, deleteMaintenance } = useMaintenance(page, 12, filters);
  const { vehicles } = useVehicles(1, 100);

  const handleCreate = async () => {
    if (!newMaintenance.vehicleId || !newMaintenance.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      await createMaintenance({
        type: newMaintenance.type ?? MaintenanceType.Preventive,
        description: newMaintenance.description,
        scheduledDate: newMaintenance.scheduledDate ?? new Date().toISOString(),
        mileageAtMaintenance: newMaintenance.mileageAtMaintenance ?? 0,
        cost: newMaintenance.cost ?? 0,
        serviceProvider: newMaintenance.serviceProvider,
        notes: newMaintenance.notes,
        vehicleId: newMaintenance.vehicleId,
      });
      toast.success('Maintenance creee avec succes');
      setIsCreateOpen(false);
      setNewMaintenance({ type: MaintenanceType.Preventive, description: '', scheduledDate: new Date().toISOString().split('T')[0], mileageAtMaintenance: 0, cost: 0, serviceProvider: '', notes: '', vehicleId: '' });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erreur: ${err.message || 'Erreur lors de la creation'}`);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeMaintenance({ id, data: { completedDate: new Date().toISOString() } });
      toast.success('Maintenance terminee');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette maintenance ?')) {
      try {
        await deleteMaintenance(id);
        toast.success('Maintenance supprimee');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message}`);
      }
    }
  };

  const filteredMaintenance = maintenance?.items?.filter((m) =>
    m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.serviceProvider?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isOverdue = (scheduledDate: string, isCompleted: boolean) => !isCompleted && new Date(scheduledDate) < new Date();

  const stats = {
    total: maintenance?.totalCount || 0,
    completed: maintenance?.items?.filter((m) => m.isCompleted).length || 0,
    pending: maintenance?.items?.filter((m) => !m.isCompleted).length || 0,
    overdue: maintenance?.items?.filter((m) => isOverdue(m.scheduledDate, m.isCompleted)).length || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[var(--warning)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Sparkles className="w-4 h-4 text-[var(--warning)]" />
              <span>Gestion technique</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-[var(--muted-foreground)]">Gerez les maintenances de votre flotte</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-11 px-5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="w-4 h-4" />
                Planifier une maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl border-[var(--border)]">
              <DialogHeader>
                <DialogTitle>Planifier une maintenance</DialogTitle>
                <DialogDescription>Creez une nouvelle maintenance pour un vehicule</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Vehicule *</Label>
                  <Select value={newMaintenance.vehicleId} onValueChange={(value) => setNewMaintenance({ ...newMaintenance, vehicleId: value })}>
                    <SelectTrigger className="rounded-xl border-[var(--border)]"><SelectValue placeholder="Selectionner un vehicule" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--border)]">
                      {vehicles?.items?.map((v) => <SelectItem key={v.id} value={v.id}>{v.registrationNumber} - {v.brand} {v.model}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Select value={String(newMaintenance.type)} onValueChange={(value) => setNewMaintenance({ ...newMaintenance, type: parseInt(value) })}>
                    <SelectTrigger className="rounded-xl border-[var(--border)]"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--border)]">
                      {Object.entries(MaintenanceTypeLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description *</Label>
                  <Textarea value={newMaintenance.description} onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })} placeholder="Description de la maintenance" className="rounded-xl border-[var(--border)]" />
                </div>
                <div className="grid gap-2">
                  <Label>Date prevue *</Label>
                  <Input type="date" value={newMaintenance.scheduledDate} onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })} className="rounded-xl border-[var(--border)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kilometrage</Label>
                    <Input type="number" value={newMaintenance.mileageAtMaintenance} onChange={(e) => setNewMaintenance({ ...newMaintenance, mileageAtMaintenance: parseInt(e.target.value) || 0 })} className="rounded-xl border-[var(--border)]" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cout (EUR)</Label>
                    <Input type="number" value={newMaintenance.cost} onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })} className="rounded-xl border-[var(--border)]" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Prestataire</Label>
                  <Input value={newMaintenance.serviceProvider} onChange={(e) => setNewMaintenance({ ...newMaintenance, serviceProvider: e.target.value })} placeholder="Nom du prestataire" className="rounded-xl border-[var(--border)]" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-[var(--border)]">Annuler</Button>
                <Button onClick={handleCreate} className="rounded-xl gradient-primary text-white">Creer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total" value={stats.total} icon={Wrench} color="primary" />
          <StatsCard label="Terminees" value={stats.completed} icon={CheckCircle} color="success" />
          <StatsCard label="En attente" value={stats.pending} icon={Clock} color="warning" />
          <StatsCard label="En retard" value={stats.overdue} icon={AlertTriangle} color="destructive" />
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-11 pl-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--card)] transition-all" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 h-11 rounded-xl border-[var(--border)]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--border)]">
                  <SelectItem value="all">Tous types</SelectItem>
                  {Object.entries(MaintenanceTypeLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 rounded-xl border-[var(--border)]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--border)]">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[var(--muted)] rounded-lg w-3/4" />
                  <div className="h-4 bg-[var(--muted)] rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredMaintenance.length > 0 && (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredMaintenance.map((m) => (
                <MaintenanceCard key={m.id} maintenance={m} onComplete={handleComplete} onDelete={handleDelete} isOverdue={isOverdue(m.scheduledDate, m.isCompleted)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty */}
        {!isLoading && filteredMaintenance.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="p-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                <Wrench className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune maintenance trouvee</h3>
              <p className="text-[var(--muted-foreground)] mb-6">{searchTerm ? 'Aucun resultat' : 'Planifiez votre premiere maintenance'}</p>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {maintenance && maintenance.totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-[var(--border)]" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, maintenance.totalPages))].map((_, i) => (
                <Button key={i + 1} variant={page === i + 1 ? 'default' : 'ghost'} size="icon" className={`w-10 h-10 rounded-xl ${page === i + 1 ? 'gradient-primary text-white' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</Button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-[var(--border)]" onClick={() => setPage((p) => Math.min(maintenance.totalPages, p + 1))} disabled={page === maintenance.totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: 'primary' | 'success' | 'warning' | 'destructive' }) {
  const styles = {
    primary: { bg: 'bg-[var(--primary)]/10', text: 'text-[var(--primary)]', border: 'border-[var(--primary)]/20' },
    success: { bg: 'bg-[var(--success)]/10', text: 'text-[var(--success)]', border: 'border-[var(--success)]/20' },
    warning: { bg: 'bg-[var(--warning)]/10', text: 'text-[var(--warning)]', border: 'border-[var(--warning)]/20' },
    destructive: { bg: 'bg-[var(--destructive)]/10', text: 'text-[var(--destructive)]', border: 'border-[var(--destructive)]/20' },
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

function MaintenanceCard({ maintenance: m, onComplete, onDelete, isOverdue }: { maintenance: MaintenanceDto; onComplete: (id: string) => void; onDelete: (id: string) => void; isOverdue: boolean }) {
  const getStatusBadge = () => {
    if (m.isCompleted) return <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-0"><CheckCircle className="w-3 h-3 mr-1" />Terminee</Badge>;
    if (isOverdue) return <Badge className="bg-[var(--destructive)]/10 text-[var(--destructive)] border-0"><AlertTriangle className="w-3 h-3 mr-1" />En retard</Badge>;
    return <Badge className="bg-[var(--warning)]/10 text-[var(--warning)] border-0"><Clock className="w-3 h-3 mr-1" />Planifiee</Badge>;
  };

  return (
    <motion.div variants={itemVariants} layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className="group rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--warning)]/30 transition-all overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--primary)]/10">
              <Wrench className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold">{m.vehicleRegistration}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{m.vehicleBrand} {m.vehicleModel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-[var(--muted)]">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl border-[var(--border)] shadow-xl">
                {!m.isCompleted && (
                  <DropdownMenuItem onClick={() => onComplete(m.id)} className="gap-2 cursor-pointer rounded-lg">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    Marquer terminee
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(m.id)} className="gap-2 cursor-pointer rounded-lg text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10">
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Badge variant="outline" className="mb-2 border-[var(--border)]">
              <Wrench className="w-3 h-3 mr-1" />
              {MaintenanceTypeLabels[m.type as MaintenanceType]}
            </Badge>
            <p className="text-sm text-(--muted-foreground) line-clamp-2">{m.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-(--muted)/50">
              <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                <Calendar className="w-3 h-3" />
                Date prevue
              </div>
              <p className="text-sm font-medium">{format(new Date(m.scheduledDate), 'dd MMM yyyy', { locale: fr })}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--muted)]/50">
              <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                <DollarSign className="w-3 h-3" />
                Cout
              </div>
              <p className="text-sm font-medium">{m.cost > 0 ? `${m.cost.toFixed(2)} EUR` : '-'}</p>
            </div>
          </div>
          {m.serviceProvider && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Building2 className="w-4 h-4" />
              <span>{m.serviceProvider}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
