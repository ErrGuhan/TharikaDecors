'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  User,
  DollarSign,
  ChevronDown,
  Home,
  MapPin,
  Clock,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Heart,
} from 'lucide-react';

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  estimatedBudget: string;
  notes?: string;
}

const initialFormState: BookingFormData = {
  fullName: '',
  email: '',
  phone: '',
  eventDate: '',
  eventType: '',
  estimatedBudget: '',
  notes: '',
};

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (fieldName: string) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { ...formData, submittedAt: new Date().toISOString() };
    console.log('--- Booking Submission ---', JSON.stringify(payload, null, 2));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] pb-28 sm:pb-24 overflow-hidden">
      {/* ── 1. Visual Hero Section with Priority Next.js Image & Golden Caustics ── */}
      <section className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden flex items-center justify-center mb-10 sm:mb-16">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-950">
          <Image
            src="https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920"
            alt="Tharika Decors Luxury Stage Consultation"
            fill
            priority={true}
            fetchPriority="high"
            sizes="100vw"
            quality={80}
            className="object-cover object-center scale-105"
          />
        </div>

        {/* Ambient Moving Gold Caustic Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50 mix-blend-color-dodge"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(229, 184, 66, 0.5) 0%, rgba(11, 43, 74, 0.25) 60%, transparent 85%)',
          }}
          aria-hidden="true"
        />

        {/* Dark Twilight Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#07192C]/80 via-[#0B2B4A]/50 to-[#07192C]/90 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Text Overlays */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5B842]/50 bg-white/15 backdrop-blur-xl px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FFF3C4] shadow-lg mb-3"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E5B842]" />
            <span>Consultation &amp; Date Reservation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          >
            Book a Consultation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-3 text-sm sm:text-base md:text-lg text-white/95 max-w-lg mx-auto leading-relaxed drop-shadow"
          >
            Let our design directors bring your dream royal mandap and celebratory stage vision to life.
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── SPLIT LAYOUT (Desktop Side-by-Side / Mobile Stacked) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── Left Side (5 cols): Contact & Location Information in Liquid Glass ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* "Let's Create Magic" Hero Block */}
            <div className="liquid-glass-card p-7 sm:p-9 rounded-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0B2B4A]/5 text-[#0B2B4A] text-xs font-extrabold uppercase tracking-wider border border-[#0B2B4A]/12">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B842]" />
                Bespoke Event Atelier
              </span>

              <h2 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0B2B4A] leading-tight">
                Let&apos;s Create Magic
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you envision a grand wedding mandap with traditional jasmine arches or an ethereal milestone celebration, our team is dedicated to crafting a stage that leaves lasting impressions.
              </p>

              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#E5B842] to-transparent opacity-90 my-3" />

              {/* Direct Contact Cards in Liquid Glass */}
              <div className="space-y-3.5 pt-2">
                {/* Phone / WhatsApp */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs hover:border-[#E5B842]/50 hover:bg-white transition-all group">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B2B4A] text-[#E5B842] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Mobile &amp; WhatsApp
                    </span>
                    <a
                      href="tel:6384947914"
                      className="text-sm sm:text-base font-extrabold text-[#0B2B4A] hover:text-[#E5B842] transition-colors"
                    >
                      +91 6384947914
                    </a>
                    <div className="flex items-center gap-2 mt-1.5">
                      <a
                        href="tel:6384947914"
                        className="text-[11px] font-bold text-[#0B2B4A] hover:underline"
                      >
                        Call Direct &rarr;
                      </a>
                      <span className="text-slate-300">&bull;</span>
                      <a
                        href="https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20would%20like%20to%20inquire%20about%20booking%20event%20decor."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs hover:border-[#E5B842]/50 hover:bg-white transition-all group">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B2B4A] text-[#E5B842] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Official Email
                    </span>
                    <a
                      href="mailto:campuscartsvcet@gmail.com"
                      className="text-xs sm:text-sm font-bold text-[#0B2B4A] hover:text-[#E5B842] transition-colors break-all"
                    >
                      campuscartsvcet@gmail.com
                    </a>
                    <p className="text-[11px] text-slate-400 mt-0.5">Prompt response within 24 hours</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B2B4A] text-[#E5B842] flex items-center justify-center flex-shrink-0 shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Headquarters &amp; Service Region
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#0B2B4A]">
                      Puducherry, India
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Serving all of Tamil Nadu &amp; surrounding districts
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B2B4A] text-[#E5B842] flex items-center justify-center flex-shrink-0 shadow-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Consultation Hours
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#0B2B4A]">
                      Monday – Sunday: 9:00 AM – 9:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Trust Promise */}
            <div className="liquid-glass-card p-5 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>100% Satisfaction Guarantee:</strong> Every element from fresh floral sourcing to stage lighting is inspected for royal perfection.
              </p>
            </div>
          </motion.div>

          {/* ── Right Side (7 cols): The Consultation Form Card (Frosted Liquid Glass) ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="liquid-glass-card shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/80">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center space-y-5 py-12 text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner border border-emerald-200/70">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h3 className="font-heading font-serif text-2xl sm:text-3xl text-[#0B2B4A] font-bold">
                      Thank You, {formData.fullName.split(' ')[0] || 'there'}!
                    </h3>
                    <p className="max-w-md text-sm text-slate-600 leading-relaxed">
                      We have received your consultation inquiry for your{' '}
                      <strong>{formData.eventType || 'celebration'}</strong>. Our design directors will get in touch with you shortly with tailored options.
                    </p>
                    <div className="w-full pt-6 flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://wa.me/916384947914?text=${encodeURIComponent(
                          `Hello Tharika Decors! I just submitted a booking inquiry for ${formData.fullName} (${formData.eventType || 'Event'} on ${formData.eventDate || 'upcoming date'}, Budget: ${formData.estimatedBudget || 'Standard'}). Would love to connect!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gold-shimmer flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/80"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="pb-3 border-b border-[#E5B842]/25">
                      <h3 className="font-heading font-serif text-2xl font-bold text-[#0B2B4A]">
                        Tell Us About Your Event
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Please fill in your details below for a customized quote and date check.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onFocus={() => handleFocus('fullName')}
                            onBlur={handleBlur}
                            required
                            placeholder="e.g. Priyadharshini Raman"
                            className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <User className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label
                          htmlFor="email"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                            required
                            placeholder="you@domain.com"
                            className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <Mail className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label
                          htmlFor="phone"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onFocus={() => handleFocus('phone')}
                            onBlur={handleBlur}
                            required
                            placeholder="e.g. 9876543210"
                            className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <Phone className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Event Date */}
                      <div className="space-y-1">
                        <label
                          htmlFor="eventDate"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Event Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="eventDate"
                            id="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            onFocus={() => handleFocus('eventDate')}
                            onBlur={handleBlur}
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none cursor-pointer"
                          />
                          <Calendar className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Event Type Select */}
                      <div className="space-y-1">
                        <label
                          htmlFor="eventType"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Event Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="eventType"
                            id="eventType"
                            value={formData.eventType}
                            onChange={handleChange}
                            onFocus={() => handleFocus('eventType')}
                            onBlur={handleBlur}
                            required
                            className="w-full pl-11 pr-10 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none cursor-pointer appearance-none"
                          >
                            <option value="" disabled>Select Event Type</option>
                            <option value="Weddings">Wedding Ceremony &amp; Mandap</option>
                            <option value="Reception">Grand Reception Stage</option>
                            <option value="Baby Showers">Baby Shower / Valaikappu</option>
                            <option value="Ear Piercing">Ear Piercing Ceremony</option>
                            <option value="Birthday & Gala">Milestone Birthday / Gala</option>
                            <option value="Corporate / Other">Bespoke Custom Event</option>
                          </select>
                          <Sparkles className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Estimated Budget */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="estimatedBudget"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Estimated Budget (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="estimatedBudget"
                            id="estimatedBudget"
                            value={formData.estimatedBudget}
                            onChange={handleChange}
                            onFocus={() => handleFocus('estimatedBudget')}
                            onBlur={handleBlur}
                            placeholder="e.g. ₹50,000 – ₹1,50,000"
                            className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <DollarSign className="w-4 h-4 text-[#E5B842] absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Notes / Vision */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="notes"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Special Requests &amp; Design Vision (Optional)
                        </label>
                        <textarea
                          name="notes"
                          id="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          onFocus={() => handleFocus('notes')}
                          onBlur={handleBlur}
                          rows={3}
                          placeholder="Tell us about your preferred color palette, stage size, floral preferences, or venue details..."
                          className="w-full px-4 py-3 rounded-xl liquid-glass-input text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button with Refractive Gold Shimmer */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="gold-shimmer group w-full py-4 px-6 rounded-xl bg-tharika-gold-gradient text-[#0B2B4A] font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-[0_8px_25px_rgba(229,184,66,0.38)] hover:shadow-[0_12px_35px_rgba(229,184,66,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99] border border-white/50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#0B2B4A]" />
                            <span>Reserving &amp; Processing Inquiry…</span>
                          </>
                        ) : (
                          <>
                            <span>Request Consultation</span>
                            <ArrowRight className="h-4 w-4 text-[#0B2B4A] group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Return Link */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B2B4A] transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Homepage</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
