'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { VehicleType, FuelType } from '@/types/vehicle';
import { ArrowLeft, Save, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

const typeLabels: Record<VehicleType, string> = {
  [VehicleType.Car]: 'Voiture',
  [VehicleType.Truck]: 'Camion',
  [VehicleType.Van]: 'Camionnette',
  [VehicleType.Motorcycle]: 'Moto',
  [VehicleType.Bus]: 'Bus',
  [VehicleType.Trailer]: 'Remorque',
  [VehicleType.Other]: 'Autre',
};

const fuelTypeLabels: Record<FuelType, string> = {
  [FuelType.Gasoline]: 'Essence',
  [FuelType.Diesel]: 'Diesel',
  [FuelType.Electric]: 'Electrique',
  [FuelType.Hybrid]: 'Hybride',
  [FuelType.LPG]: 'GPL',
  [FuelType.CNG]: 'GNC',
  [FuelType.Hydrogen]: 'Hydrogene',
};

export default function NewVehiclePage() {
  const router = useRouter();
  const { createVehicle } = useVehicles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    registrationNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: VehicleType.Car,
    fuelType: FuelType.Gasoline,
    fuelCapacity: 50,
    currentFuelLevel: 100,
    mileage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createVehicle(formData);
      router.push('/vehicles');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vehicles">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-[var(--muted)]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nouveau Vehicule</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Ajoutez un vehicule a votre flotte</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--primary)]/20">
                <Truck className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="font-semibold">Informations du Vehicule</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Remplissez les details du vehicule</p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20">
                <p className="text-sm text-[var(--destructive)] font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-sm font-medium">Immatriculation *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="AB-123-CD"
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">Annee *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">Marque *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Renault, Peugeot, etc."
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">Modele *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Clio, 308, etc."
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type de vehicule *</Label>
                  <Select
                    value={formData.type.toString()}
                    onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--border)]">
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="rounded-lg">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type de carburant *</Label>
                  <Select
                    value={formData.fuelType.toString()}
                    onValueChange={(value) => setFormData({ ...formData, fuelType: parseInt(value) })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--border)]">
                      {Object.entries(fuelTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="rounded-lg">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelCapacity" className="text-sm font-medium">Capacite reservoir (L) *</Label>
                  <Input
                    id="fuelCapacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fuelCapacity}
                    onChange={(e) => setFormData({ ...formData, fuelCapacity: parseFloat(e.target.value) || 0 })}
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentFuelLevel" className="text-sm font-medium">Niveau carburant (%)</Label>
                  <Input
                    id="currentFuelLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentFuelLevel}
                    onChange={(e) => setFormData({ ...formData, currentFuelLevel: parseFloat(e.target.value) || 0 })}
                    className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-sm font-medium">Kilometrage actuel</Label>
                <Input
                  id="mileage"
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                  className="h-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Link href="/vehicles" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11 rounded-xl border-[var(--border)]" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Creer le vehicule
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
