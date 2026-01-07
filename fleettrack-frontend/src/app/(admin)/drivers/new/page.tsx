'use client';

import { useRouter } from 'next/navigation';
import { useDrivers } from '@/lib/hooks/useDrivers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/drivers">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nouveau Conducteur</h1>
            <p className="text-sm text-muted-foreground">Ajouter un conducteur a la flotte</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations du Conducteur</CardTitle>
                <CardDescription className="text-blue-100">
                  Remplissez les informations pour creer un nouveau conducteur
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prenom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Jean"
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Dupont"
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  required
                  className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Telephone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  required
                  className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-sm font-medium">
                    Numero de Permis <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="ex: ABC123456"
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate" className="text-sm font-medium">
                    Date d&apos;Expiration <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licenseExpiryDate"
                    name="licenseExpiryDate"
                    type="date"
                    required
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
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
                <Link href="/drivers" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11 rounded-lg">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Creation...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Creer le Conducteur
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
