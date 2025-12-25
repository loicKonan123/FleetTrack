'use client';

import { useRouter } from 'next/navigation';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewDriverPage() {
  const router = useRouter();
  const { createDriver } = useDrivers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      await createDriver({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        licenseNumber: formData.get('licenseNumber') as string,
        licenseExpiryDate: formData.get('licenseExpiryDate') as string,
      });

      toast.success('Conducteur cree avec succes');
      router.push('/drivers');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la creation';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/drivers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nouveau Conducteur</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du Conducteur</CardTitle>
          <CardDescription>
            Remplissez les informations pour creer un nouveau conducteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Jean"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jean.dupont@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telephone *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Numero de Permis *</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="ex: ABC123456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate">Date d&apos;Expiration du Permis *</Label>
              <Input
                id="licenseExpiryDate"
                name="licenseExpiryDate"
                type="date"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/drivers">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creation...' : 'Creer le Conducteur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
