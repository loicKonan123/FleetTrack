'use client';

import { Badge } from '@/components/ui/badge';
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
import { useVehicles } from '@/lib/hooks/useVehicles';
import { VehicleStatus, VehicleType } from '@/types/vehicle';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const statusColors: Record<VehicleStatus, string> = {
  [VehicleStatus.Available]: 'bg-green-500',
  [VehicleStatus.InUse]: 'bg-blue-500',
  [VehicleStatus.Maintenance]: 'bg-yellow-500',
  [VehicleStatus.OutOfService]: 'bg-red-500',
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Available]: 'Available',
  [VehicleStatus.InUse]: 'In Use',
  [VehicleStatus.Maintenance]: 'Maintenance',
  [VehicleStatus.OutOfService]: 'Out of Service',
};

const typeLabels: Record<VehicleType, string> = {
  [VehicleType.Car]: 'Voiture',
  [VehicleType.Truck]: 'Camion',
  [VehicleType.Van]: 'Camionnette',
  [VehicleType.Motorcycle]: 'Moto',
  [VehicleType.Bus]: 'Bus',
  [VehicleType.Trailer]: 'Remorque',
  [VehicleType.Other]: 'Autre',
};

export default function VehiclesPage() {
  const [page, setPage] = useState(1);
  const { vehicles, isLoading, deleteVehicle } = useVehicles(page, 10);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Link href="/vehicles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vehicles ({vehicles?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles?.items && vehicles.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.items.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.registrationNumber}
                      </TableCell>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{typeLabels[vehicle.type]}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[vehicle.status]}>
                          {statusLabels[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.currentMileage?.toLocaleString() ?? 0} km</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {vehicles.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="py-2 px-4">
                    Page {page} of {vehicles.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(vehicles.totalPages, p + 1))}
                    disabled={page === vehicles.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vehicles found. Click &quot;Add Vehicle&quot; to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
