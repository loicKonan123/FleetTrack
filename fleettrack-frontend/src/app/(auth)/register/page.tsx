'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Captcha, { CaptchaHandle } from '@/components/auth/Captcha';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Truck,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  User,
  Mail,
  Phone,
  UserPlus,
  Loader2,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isRegisterLoading } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const captchaToken = await captchaRef.current?.execute();

      if (!captchaToken) {
        setError('Erreur lors de la validation CAPTCHA');
        setIsSubmitting(false);
        return;
      }

      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        captchaToken,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: string }; message?: string };
      setError(error.response?.data || error.message || 'Echec de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isRegisterLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FleetTrack</h1>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">Fleet Management</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Creer un compte</h2>
            <p className="text-[var(--muted-foreground)]">
              Rejoignez FleetTrack pour gerer votre flotte
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Prenom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="h-11 pl-10 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className="h-11 pl-10 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Nom d&apos;utilisateur</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="jean.dupont"
                  className="h-11 pl-10 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@example.com"
                  className="h-11 pl-10 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Telephone <span className="text-[var(--muted-foreground)] font-normal">(optionnel)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className="h-11 pl-10 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caracteres"
                  className="h-11 pl-10 pr-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Retapez votre mot de passe"
                  className="h-11 pl-10 pr-11 rounded-xl bg-[var(--muted)] border-transparent focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <Captcha ref={captchaRef} action="REGISTER" />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Inscription...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Creer mon compte
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Deja un compte?{' '}
            <Link
              href="/login"
              className="font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>

        {/* reCAPTCHA Notice */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-xs text-[var(--muted-foreground)]/60"
        >
          Ce site est protege par reCAPTCHA Enterprise
        </motion.p>
      </motion.div>
    </div>
  );
}
