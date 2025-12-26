'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsers } from '@/lib/hooks/useUsers';
import { format } from 'date-fns';
import { Edit, Plus, Trash2, UserCheck, UserX, Key } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const roleColors: Record<string, string> = {
  Admin: 'bg-purple-500',
  Dispatcher: 'bg-blue-500',
  Driver: 'bg-green-500',
  Viewer: 'bg-gray-500',
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { users, isLoading, deleteUser, activateUser, deactivateUser } = useUsers(page, 10);

  const handleDelete = async (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(id);
        toast.success('Utilisateur supprime avec succes');
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(`Erreur: ${err.message || 'Erreur lors de la suppression'}`);
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser(id);
        toast.success('Utilisateur desactive');
      } else {
        await activateUser(id);
        toast.success('Utilisateur active');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erreur: ${err.message || 'Erreur lors du changement de statut'}`);
    }
  };

  const filteredUsers = users?.items?.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Link href="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les Utilisateurs</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Derniere Connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>{user.fullName}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.roleName] || 'bg-gray-500'}>
                        {user.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginDate
                        ? format(new Date(user.lastLoginDate), 'dd/MM/yyyy HH:mm')
                        : 'Jamais'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/users/${user.id}`}>
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/users/${user.id}?reset=true`}>
                          <Button variant="ghost" size="sm" title="Reinitialiser mot de passe">
                            <Key className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          title={user.isActive ? 'Desactiver' : 'Activer'}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-orange-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouve
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {users && users.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {users.pageNumber} sur {users.totalPages} ({users.totalCount} utilisateurs)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Precedent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(users.totalPages, p + 1))}
                  disabled={page === users.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
