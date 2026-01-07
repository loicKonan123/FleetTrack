'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Captcha, { CaptchaHandle } from '@/components/auth/Captcha';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  User,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const captchaToken = await captchaRef.current?.execute();

      if (!captchaToken) {
        setError('Erreur lors de la validation CAPTCHA');
        setIsSubmitting(false);
        return;
      }

      await login({ username, password, captchaToken });
    } catch (err: unknown) {
      const error = err as { response?: { data?: string }; message?: string };
      setError(error.response?.data || error.message || 'Echec de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoginLoading || isSubmitting;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
          >
            <Truck className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FleetTrack</h1>
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Fleet Management</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl shadow-2xl p-6"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Connexion</h2>
            <p className="text-white/50 text-sm">Accedez a votre tableau de bord</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70 text-sm font-medium">
                Nom d&apos;utilisateur
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identifiant"
                  className="h-11 pl-11 pr-4 rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-blue-500/20 transition-all"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/70 text-sm font-medium">
                  Mot de passe
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Mot de passe oublie?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="h-11 pl-11 pr-11 rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-blue-500/20 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <Captcha ref={captchaRef} action="LOGIN" />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-5 text-center text-white/50 text-sm">
            Pas encore de compte?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Creer un compte
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          Protege par reCAPTCHA Enterprise
        </p>
      </motion.div>
    </div>
  );
}
