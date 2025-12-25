'use client';

import { useState } from 'react';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DriversPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { drivers, isLoading, deleteDriver } = useDrivers(page, 10);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce conducteur ?')) {
      try {
        await deleteDriver(id);
        toast.success('Conducteur supprimé avec succès');
      } catch (error: any) {
        toast.error(`Erreur: ${error.message}`);
      }
    }
  };

  // Filtrage côté client
  const filteredDrivers = drivers?.items?.filter((driver) =>
    driver.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conducteurs</h1>
        <Link href="/drivers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Conducteur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tous les Conducteurs ({drivers?.totalCount || 0})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou permis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDrivers && filteredDrivers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>N° Permis</TableHead>
                    <TableHead>Expiration Permis</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        {driver.firstName} {driver.lastName}
                      </TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.phoneNumber}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>
                        {driver.licenseExpiryDate
                          ? format(new Date(driver.licenseExpiryDate), 'dd/MM/yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={driver.status === 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {driver.status === 0 ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/drivers/${driver.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(driver.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {drivers && drivers.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <span className="py-2 px-4">
                    Page {page} sur {drivers.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(drivers.totalPages, p + 1))}
                    disabled={page === drivers.totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Aucun conducteur trouvé.' : 'Aucun conducteur. Cliquez sur "Ajouter un Conducteur" pour en créer un.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
