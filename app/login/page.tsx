'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, Home, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LiquidGlass from '@/components/ui/LiquidGlass';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Check if user is already logged in, redirect to /admin automatically
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = '/admin';
      }
    });
  }, []);

  // Authentication Logic
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session || data?.user) {
        // Force Next.js server components to read the newly set auth session cookie
        router.refresh();
        window.location.href = '/admin';
      } else {
        throw new Error('Authentication succeeded but no active session was established.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Invalid email or password. Please verify your admin credentials.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage('Email address has not been confirmed in Supabase yet.');
      } else {
        setErrorMessage(msg || 'Authentication failed. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient Liquid Glass Caustics */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 55% at 50% 15%, rgba(212,175,55,0.18) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(10,54,89,0.12) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <LiquidGlass
          tint="glass"
          shape="rounded"
          specular={true}
          interactive={true}
          className="p-8 sm:p-10 shadow-2xl"
        >
          {/* Official Brand Logo */}
          <div className="text-center mb-7 flex flex-col items-center">
            <Link
              href="/"
              className="relative w-44 h-20 mb-3 block hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            >
              <Image
                src="/logo.png"
                alt="Tharika Decors & Events"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#0A3659] text-[11px] font-semibold tracking-wider uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Secure Studio Access
            </div>

            <h1 className="font-heading text-2xl font-bold text-[#0A3659] tracking-tight">
              Admin Studio Portal
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Sign in to manage Tharika Decors showcases &amp; event collections.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#0A3659] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="admin@tharikadecors.com"
                className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm text-[#0A3659] placeholder:text-stone-400 font-medium transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#0A3659] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                Password
              </label>
              <input
                type="password"
                name="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="••••••••••••"
                className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm text-[#0A3659] placeholder:text-stone-400 font-medium transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="gold-shimmer w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4E078] to-[#D4AF37] text-[#0A3659] font-bold text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer border border-[#D4AF37]/50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A3659]" />
                    <span>Authenticating Studio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0A3659]" />
                    <span>Sign In to Studio</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-center flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#0A3659] transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Return to Public Showcase</span>
              </Link>
            </div>
          </form>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
