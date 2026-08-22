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
      await new Promise((resolve) => setTimeout(resolve, 1400));
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
    <div className="min-h-screen bg-[#FAF7F2] pb-12 sm:pb-20">
      {/* ── 1. Visual Hero Section with Priority Next.js Image ── */}
      <section className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] overflow-hidden flex items-center justify-center mb-10 sm:mb-14">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-950">
          <Image
            src="https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920"
            alt="Tharika Decors Luxury Stage Consultation"
            fill
            priority={true}
            sizes="100vw"
            quality={75}
            className="object-cover object-center scale-105"
          />
        </div>

        {/* Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Text Overlays */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] shadow-2xs mb-3"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Consultation &amp; Date Reservation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-md"
          >
            Book a Consultation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-3 text-sm sm:text-base text-white/90 max-w-lg mx-auto leading-relaxed drop-shadow"
          >
            Let our design directors bring your dream royal mandap and celebratory stage vision to life.
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── SPLIT LAYOUT (Desktop Side-by-Side / Mobile Stacked) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── Left Side (5 cols): Contact & Location Information ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* "Let's Create Magic" Hero Block */}
            <div className="p-7 sm:p-8 rounded-3xl border border-[#D4AF37]/30 bg-white/80 backdrop-blur-md shadow-sm space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A3659]/5 text-[#0A3659] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Bespoke Event Atelier
              </span>

              <h2 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0A3659] leading-tight">
                Let&apos;s Create Magic
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you envision a grand wedding mandap with traditional jasmine arches or an ethereal milestone celebration, our team is dedicated to crafting a stage that leaves lasting impressions.
              </p>

              <div className="w-12 h-0.5 rounded-full bg-[#D4AF37] opacity-80 pt-0.5" />

              {/* Direct Contact Cards */}
              <div className="space-y-3.5 pt-2">
                {/* Phone / WhatsApp */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-slate-200/70 hover:border-[#D4AF37]/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Mobile &amp; WhatsApp
                    </span>
                    <a
                      href="tel:6384947914"
                      className="text-sm sm:text-base font-bold text-[#0A3659] hover:text-[#D4AF37] transition-colors"
                    >
                      +91 6384947914
                    </a>
                    <div className="flex items-center gap-2 mt-1.5">
                      <a
                        href="tel:6384947914"
                        className="text-[11px] font-bold text-[#0A3659] hover:underline"
                      >
                        Call Direct &rarr;
                      </a>
                      <span className="text-slate-300">&bull;</span>
                      <a
                        href="https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20would%20like%20to%20inquire%20about%20booking%20event%20decor."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-slate-200/70 hover:border-[#D4AF37]/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Official Email
                    </span>
                    <a
                      href="mailto:campuscartsvcet@gmail.com"
                      className="text-xs sm:text-sm font-bold text-[#0A3659] hover:text-[#D4AF37] transition-colors break-all"
                    >
                      campuscartsvcet@gmail.com
                    </a>
                    <p className="text-[11px] text-slate-400 mt-0.5">Prompt response within 24 hours</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-slate-200/70">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Headquarters &amp; Service Region
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#0A3659]">
                      Puducherry, India
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Serving all of Tamil Nadu &amp; surrounding districts
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-slate-200/70">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Consultation Hours
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#0A3659]">
                      Monday – Sunday: 9:00 AM – 9:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Trust Promise */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>100% Satisfaction Guarantee:</strong> Every element from fresh floral sourcing to stage lighting is inspected for royal perfection.
              </p>
            </div>
          </motion.div>

          {/* ── Right Side (7 cols): The Consultation Form Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-10 border border-slate-100">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center space-y-4 py-10 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="font-heading font-serif text-2xl sm:text-3xl text-[#0A3659] font-bold">
                      Thank You, {formData.fullName.split(' ')[0] || 'there'}!
                    </h3>
                    <p className="max-w-md text-sm text-slate-600 leading-relaxed">
                      We have received your consultation inquiry for your{' '}
                      <strong>{formData.eventType || 'celebration'}</strong>. Our design directors will get in touch with you shortly with package options.
                    </p>
                    <div className="w-full pt-6 flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://wa.me/916384947914?text=${encodeURIComponent(
                          `Hello Tharika Decors! I just submitted a booking inquiry for ${formData.fullName} (${formData.eventType || 'Event'} on ${formData.eventDate || 'upcoming date'}, Budget: ${formData.estimatedBudget || 'Standard'}). Would love to connect!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
                    <div className="pb-2 border-b border-slate-100">
                      <h3 className="font-heading font-serif text-xl font-bold text-[#0A3659]">
                        Tell Us About Your Event
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please fill in your details below for a customized quote and date check.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Event Date — Fixed Clean Layout without text clipping */}
                      <div className="space-y-1">
                        <label
                          htmlFor="eventDate"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Event Type Select */}
                      <div className="space-y-1">
                        <label
                          htmlFor="eventType"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="" disabled>Select Event Type</option>
                            <option value="Weddings">Wedding Ceremony &amp; Mandap</option>
                            <option value="Reception">Grand Reception Stage</option>
                            <option value="Baby Showers">Baby Shower / Valaikappu</option>
                            <option value="Ear Piercing">Ear Piercing Ceremony</option>
                            <option value="Birthday & Gala">Milestone Birthday / Gala</option>
                            <option value="Corporate / Other">Bespoke Custom Event</option>
                          </select>
                          <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Estimated Budget */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="estimatedBudget"
                          className="block text-xs font-semibold text-slate-700"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                          />
                          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Notes / Vision */}
                      <div className="space-y-1 sm:col-span-2">
                        <label
                          htmlFor="notes"
                          className="block text-xs font-semibold text-slate-700"
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                            <span>Reserving &amp; Processing Inquiry…</span>
                          </>
                        ) : (
                          <>
                            <span>Request Consultation</span>
                            <ArrowRight className="h-4 w-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Return Link */}
            <div className="mt-5 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0A3659] transition-colors"
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
