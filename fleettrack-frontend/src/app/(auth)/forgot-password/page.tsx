'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Captcha, { CaptchaHandle } from '@/components/auth/Captcha';
import { authApi } from '@/lib/api/auth';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Execute reCAPTCHA Enterprise and get token
      const captchaToken = await captchaRef.current?.execute();

      if (!captchaToken) {
        setError('Erreur lors de la validation CAPTCHA');
        setIsLoading(false);
        return;
      }

      await authApi.forgotPassword({ email, captchaToken });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: string }; message?: string };
      setError(error.response?.data || error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaExecute = () => {
    // reCAPTCHA Enterprise executed successfully
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Email envoye!</h2>
              <p className="text-muted-foreground">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
                vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifiez votre boite de reception et vos spams.
              </p>
              <Link href="/login">
                <Button className="w-full mt-4">
                  Retour a la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>Mot de passe oublie</CardTitle>
              <CardDescription>Entrez votre email pour recevoir un lien de reinitialisation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="votre.email@example.com"
              />
            </div>

            {/* reCAPTCHA Enterprise - invisible */}
            <Captcha
              ref={captchaRef}
              onExecute={handleCaptchaExecute}
              action="FORGOT_PASSWORD"
            />

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>

            <div className="text-center text-sm">
              Vous vous souvenez de votre mot de passe?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>

            <div className="text-center text-xs text-muted-foreground mt-2">
              Ce site est protege par reCAPTCHA Enterprise
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
