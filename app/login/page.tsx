'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Authentication Logic
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session || data?.user) {
        // Refresh server component cache first so cookies are re-read, then navigate
        router.refresh();
        router.push('/admin');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(
        err.message || 'Invalid login credentials. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tharika-cream flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Subtle Gradient */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(10, 54, 89, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-3xl p-8 border border-tharika-blue/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Official Brand Logo */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="relative w-44 h-20 mb-3 block hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Tharika Decors & Events"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-tharika-blue tracking-tight">
            Admin Studio Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to manage Tharika Decors showcases &amp; categories.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input (subtle bottom border) */}
          <div className="relative z-0 w-full group">
            <input
              type="email"
              name="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder=" "
              className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
            />
            <label
              htmlFor="admin-email"
              className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                email || focusedField === 'email'
                  ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                  : 'translate-y-0 scale-100 text-gray-400'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
          </div>

          {/* Password Input (subtle bottom border) */}
          <div className="relative z-0 w-full group">
            <input
              type="password"
              name="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder=" "
              className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
            />
            <label
              htmlFor="admin-password"
              className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                password || focusedField === 'password'
                  ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                  : 'translate-y-0 scale-100 text-gray-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
          </div>

          {/* Submit Button styled with tharika-gold-gradient and dark text */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-tharika-gold-gradient text-tharika-blue font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-tharika-blue" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Studio</span>
              )}
            </motion.button>
          </div>

          {/* Error Message in red below the form */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="pt-2 text-center"
              >
                <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-tharika-blue transition-colors"
            >
              <Home className="w-3 h-3" />
              <span>Back to Website</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
