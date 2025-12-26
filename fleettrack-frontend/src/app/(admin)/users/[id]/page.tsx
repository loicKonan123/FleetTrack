'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser, useUsers, useRoles } from '@/lib/hooks/useUsers';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { UpdateUserRequest, ResetPasswordRequest } from '@/types/user';
import { format } from 'date-fns';
import { ArrowLeft, Save, Key, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showReset = searchParams.get('reset') === 'true';

  const { data: user, isLoading } = useUser(id);
  const { updateUser, resetPassword, activateUser, deactivateUser } = useUsers();
  const { data: roles } = useRoles();
  const { drivers } = useDrivers(1, 100);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [newPassword, setNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(showReset);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        roleId: user.roleId,
        driverId: user.driverId,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateUser({ id, data: formData });
      toast.success('Utilisateur mis a jour');
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la mise a jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data: ResetPasswordRequest = { newPassword };
      await resetPassword({ id, data });
      toast.success('Mot de passe reinitialise');
      setNewPassword('');
      setShowResetForm(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur lors de la reinitialisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (user?.isActive) {
        await deactivateUser(id);
        toast.success('Utilisateur desactive');
      } else {
        await activateUser(id);
        toast.success('Utilisateur active');
      }
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Erreur');
    }
  };

  const selectedRole = roles?.find((r) => r.id === formData.roleId);
  const isDriverRole = selectedRole?.name === 'Driver';
  const availableDrivers = drivers?.items || [];

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">Utilisateur non trouve</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant={user.isActive ? 'default' : 'destructive'}>
            {user.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Badge className="bg-purple-500">{user.roleName}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations de l&apos;Utilisateur</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Modifier
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                  Annuler
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Prenom */}
                <div className="space-y-2">
                  <Label>Prenom</Label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">{user.firstName}</p>
                  )}
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <Label>Nom</Label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">{user.lastName}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label>Nom d&apos;utilisateur</Label>
                  {isEditing ? (
                    <Input
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">@{user.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-sm">{user.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Telephone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.phoneNumber || 'Non renseigne'}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  {isEditing ? (
                    <Select
                      value={formData.roleId}
                      onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{user.roleName} - {user.roleDescription}</p>
                  )}
                </div>

                {/* Driver (only if role is Driver) */}
                {isDriverRole && isEditing && (
                  <div className="space-y-2">
                    <Label>Conducteur associe</Label>
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
                            {driver.firstName} {driver.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Status */}
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Compte actif</Label>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isEditing && (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Reset Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Mot de passe
            </CardTitle>
            <CardDescription>Reinitialiser le mot de passe de l&apos;utilisateur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showResetForm ? (
              <>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 caracteres"
                    minLength={8}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleResetPassword} disabled={isSubmitting}>
                    {isSubmitting ? 'Reinitialisation...' : 'Reinitialiser'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowResetForm(false)}>
                    Annuler
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowResetForm(true)}>
                <Key className="mr-2 h-4 w-4" />
                Reinitialiser le mot de passe
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion du Compte</CardTitle>
            <CardDescription>Activer ou desactiver le compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Statut actuel</p>
                <p className="text-sm text-muted-foreground">
                  {user.isActive ? 'Le compte est actif' : 'Le compte est desactive'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleToggleStatus}
              >
                {user.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Desactiver
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activer
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Derniere connexion:{' '}
                {user.lastLoginDate
                  ? format(new Date(user.lastLoginDate), 'dd/MM/yyyy HH:mm')
                  : 'Jamais'}
              </p>
              <p className="text-sm text-muted-foreground">
                Cree le: {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
              {user.updatedAt && (
                <p className="text-sm text-muted-foreground">
                  Mis a jour le: {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
