'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useMissions } from '@/lib/hooks/useMissions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { MissionPriority } from '@/types/mission';
import { ArrowLeft, Save, Route } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewMissionPage() {
  const router = useRouter();
  const { createMission } = useMissions();
  const { vehicles } = useVehicles(1, 100);
  const { drivers } = useDrivers(1, 100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vehicleId: '',
    driverId: '',
    priority: MissionPriority.Medium,
    startDate: '',
    endDate: '',
    estimatedDistance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createMission({
        name: formData.name,
        description: formData.description,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        estimatedDistance: formData.estimatedDistance,
      });

      toast.success('Mission creee avec succes');
      router.push('/missions');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la creation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available vehicles and drivers
  const availableVehicles = vehicles?.items?.filter((v) => v.status === 0) || [];
  const availableDrivers = drivers?.items?.filter((d) => d.status === 0) || [];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/missions">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nouvelle Mission</h1>
            <p className="text-sm text-muted-foreground">Creer une nouvelle mission de transport</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations de la Mission</CardTitle>
                <CardDescription className="text-purple-100">
                  Remplissez les informations necessaires pour creer une nouvelle mission
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom de la mission */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nom de la Mission <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Livraison Paris-Lyon"
                  required
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Vehicule */}
                <div className="space-y-2">
                  <Label htmlFor="vehicleId" className="text-sm font-medium">
                    Vehicule <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    required
                  >
                    <SelectTrigger id="vehicleId" className="h-11 rounded-lg border-gray-200">
                      <SelectValue placeholder="Selectionner un vehicule" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableVehicles.length === 0 && (
                    <p className="text-xs text-red-500">Aucun vehicule disponible</p>
                  )}
                </div>

                {/* Conducteur */}
                <div className="space-y-2">
                  <Label htmlFor="driverId" className="text-sm font-medium">
                    Conducteur <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.driverId}
                    onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    required
                  >
                    <SelectTrigger id="driverId" className="h-11 rounded-lg border-gray-200">
                      <SelectValue placeholder="Selectionner un conducteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDrivers.length === 0 && (
                    <p className="text-xs text-red-500">Aucun conducteur disponible</p>
                  )}
                </div>

                {/* Priorite */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priorite <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: parseInt(value) as MissionPriority })
                    }
                    required
                  >
                    <SelectTrigger id="priority" className="h-11 rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Faible</SelectItem>
                      <SelectItem value="1">Moyenne</SelectItem>
                      <SelectItem value="2">Haute</SelectItem>
                      <SelectItem value="3">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance Estimee */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedDistance" className="text-sm font-medium">
                    Distance Estimee (km) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estimatedDistance"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.estimatedDistance}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                {/* Date de Debut */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Date de Debut <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                {/* Date de Fin */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    Date de Fin
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details de la mission, instructions speciales..."
                  rows={4}
                  className="rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-4">
                <Link href="/missions" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11 rounded-lg">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-lg bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Creation en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Creer la Mission
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
