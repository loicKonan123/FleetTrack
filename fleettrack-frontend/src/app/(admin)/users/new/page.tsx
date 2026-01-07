'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { useRoles, useUsers } from '@/lib/hooks/useUsers';
import { CreateUserRequest } from '@/types/user';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/users">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nouvel Utilisateur</h1>
            <p className="text-sm text-muted-foreground">Creer un nouveau compte utilisateur</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations de l&apos;Utilisateur</CardTitle>
                <CardDescription className="text-green-100">
                  Remplissez les informations pour creer un nouveau compte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Prenom */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prenom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Nom d&apos;utilisateur <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 caracteres</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Telephone
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="roleId" className="text-sm font-medium">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData({ ...formData, roleId: value, driverId: undefined })}
                    required
                  >
                    <SelectTrigger className="h-11 rounded-lg border-gray-200">
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
                    <Label htmlFor="driverId" className="text-sm font-medium">
                      Conducteur associe
                    </Label>
                    <Select
                      value={formData.driverId || ''}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value || undefined })}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-gray-200">
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
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Compte actif
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    L&apos;utilisateur pourra se connecter immediatement
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
                <Link href="/users" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11 rounded-lg">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-lg bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Creation...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Creer l&apos;Utilisateur
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
