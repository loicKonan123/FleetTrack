'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useRoles, useUsers } from '@/lib/hooks/useUsers';
import { CreateUserRequest } from '@/types/user';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewUserPage() {
  const router = useRouter();
  const { createUser } = useUsers();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { drivers } = useDrivers(1, 100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roleId: '',
    driverId: undefined,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createUser(formData);
      toast.success('Utilisateur cree avec succes');
      router.push('/users');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles?.find((r) => r.id === formData.roleId);
  const isDriverRole = selectedRole?.name === 'Driver';

  // Filter drivers that don't have a user account yet
  const availableDrivers = drivers?.items || [];

  if (rolesLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nouvel Utilisateur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;Utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Prenom */}
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nom d&apos;utilisateur *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Minimum 8 caracteres</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telephone</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="roleId">Role *</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => setFormData({ ...formData, roleId: value, driverId: undefined })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver (only if role is Driver) */}
              {isDriverRole && (
                <div className="space-y-2">
                  <Label htmlFor="driverId">Conducteur associe</Label>
                  <Select
                    value={formData.driverId || ''}
                    onValueChange={(value) => setFormData({ ...formData, driverId: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un conducteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Compte actif</Label>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Creation...' : 'Creer l\'Utilisateur'}
              </Button>
              <Link href="/users">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
