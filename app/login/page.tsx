'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, Home, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
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
        className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-3xl p-8 border border-[#0A3659]/10"
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
          <h1 className="font-heading text-2xl font-bold text-[#0A3659] tracking-tight">
            Admin Studio Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to manage Tharika Decors showcases &amp; categories.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
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
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-[#0A3659] focus:outline-none focus:ring-0 transition-colors"
            />
            <label
              htmlFor="admin-email"
              className={`absolute origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 pointer-events-none ${
                email || focusedField === 'email'
                  ? '-top-2.5 scale-75 text-[#0A3659] font-semibold'
                  : 'top-2.5 scale-100 text-gray-400'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
          </div>

          {/* Password Input */}
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
              className="peer block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-[#0A3659] focus:outline-none focus:ring-0 transition-colors"
            />
            <label
              htmlFor="admin-password"
              className={`absolute origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 pointer-events-none ${
                password || focusedField === 'password'
                  ? '-top-2.5 scale-75 text-[#0A3659] font-semibold'
                  : 'top-2.5 scale-100 text-gray-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c4a030] text-[#0A3659] font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A3659]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Studio</span>
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
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-center flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A3659] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
