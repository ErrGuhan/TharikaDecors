'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Heart,
  Star,
  Award,
  ArrowRight,
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

const stats = [
  { icon: Award, label: '8+ Years', sub: 'of Experience' },
  { icon: Star, label: '500+', sub: 'Events Crafted' },
  { icon: Heart, label: '100%', sub: 'Bespoke Work' },
];

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ── SECTION 1: About Tharika Decors ── */}
      <section className="relative overflow-hidden bg-[#FAF7F2] px-4 pt-14 pb-16 sm:px-6 lg:px-8">
        {/* Ambient decorative elements */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(10,54,89,0.05) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A3659] shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            Our Story
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-4 font-heading text-4xl font-bold tracking-tight text-[#0A3659] sm:text-5xl"
          >
            About Tharika Decors
          </motion.h1>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mb-6 h-px w-24 origin-center bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          {/* Story paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 text-base leading-relaxed text-[#0A3659]/75 sm:text-lg"
          >
            Founded with a passion for blending tradition with timeless elegance, Tharika Decors &amp; Events
            has been transforming celebrations across Tamil Nadu for over eight years. From grand wedding
            mandaps draped in jasmine and marigold to intimate baby shower stages adorned with brass lamps
            and lotus blooms — every detail is handcrafted with intention and love.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mb-10 text-sm leading-relaxed text-[#0A3659]/60 sm:text-base"
          >
            Our signature approach combines authentic Tamil heritage with contemporary luxury styling.
            We believe every family's story deserves a stage worthy of its moments — designed bespoke,
            executed with precision, and delivered with warmth.
          </motion.p>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {stats.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#D4AF37]/20 bg-white/80 px-7 py-4 shadow-sm backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A3659]/5">
                  <Icon className="h-4.5 w-4.5 text-[#D4AF37]" />
                </div>
                <span className="font-heading text-2xl font-bold text-[#0A3659]">{label}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0A3659]/50">{sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Decorative wave between sections */}
      <div className="relative -mt-2 overflow-hidden">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* ── SECTION 2: Booking Form ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">

          {/* Form header */}
          <div className="mb-8 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#0A3659]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#0A3659]">
              <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
              Reserve Your Date
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#0A3659] sm:text-4xl">
              Book a Consultation
            </h2>
            <p className="mt-2 text-sm text-[#0A3659]/60">
              Let us bring your celebration to life with bespoke royal decor tailored to your personal aesthetic.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-[#0A3659]/8 bg-white p-8 shadow-xl sm:p-10 hover:shadow-2xl transition-shadow duration-300"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center space-y-4 py-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="font-heading text-2xl text-[#0A3659]">
                    Thank You, {formData.fullName.split(' ')[0] || 'there'}!
                  </h3>
                  <p className="max-w-sm text-sm text-gray-600">
                    We have received your inquiry for your{' '}
                    <strong>{formData.eventType || 'event'}</strong>. Our team will get in touch
                    with you shortly to begin planning your dream celebration.
                  </p>
                  <div className="w-full pt-4 flex flex-col gap-2.5">
                    <a
                      href={`https://wa.me/916384947914?text=${encodeURIComponent(
                        `Hello Tharika Decors! I just submitted a booking inquiry for ${formData.fullName} (${formData.eventType || 'Event'} on ${formData.eventDate || 'upcoming date'}, Budget: ${formData.estimatedBudget || 'Standard'}). Would love to connect!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                    >
                      <span>Connect on WhatsApp</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full cursor-pointer rounded-xl border border-[#0A3659]/20 px-4 py-3 text-sm font-semibold text-[#0A3659] transition-colors hover:bg-[#0A3659]/5"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Full Name */}
                  <FloatingField
                    id="fullName" name="fullName" type="text"
                    label="Full Name" required icon={<User className="h-3.5 w-3.5" />}
                    value={formData.fullName} onChange={handleChange}
                    onFocus={() => handleFocus('fullName')} onBlur={handleBlur}
                    focused={focusedField === 'fullName'}
                  />

                  {/* Email */}
                  <FloatingField
                    id="email" name="email" type="email"
                    label="Email Address" required icon={<Mail className="h-3.5 w-3.5" />}
                    value={formData.email} onChange={handleChange}
                    onFocus={() => handleFocus('email')} onBlur={handleBlur}
                    focused={focusedField === 'email'}
                  />

                  {/* Phone */}
                  <FloatingField
                    id="phone" name="phone" type="tel"
                    label="Phone Number" required icon={<Phone className="h-3.5 w-3.5" />}
                    value={formData.phone} onChange={handleChange}
                    onFocus={() => handleFocus('phone')} onBlur={handleBlur}
                    focused={focusedField === 'phone'}
                  />

                  {/* Event Date */}
                  <FloatingField
                    id="eventDate" name="eventDate" type="date"
                    label="Event Date" required icon={<Calendar className="h-3.5 w-3.5" />}
                    value={formData.eventDate} onChange={handleChange}
                    onFocus={() => handleFocus('eventDate')} onBlur={handleBlur}
                    focused={focusedField === 'eventDate'}
                  />

                  {/* Event Type — select */}
                  <div className="relative z-0 w-full">
                    <div className="relative">
                      <select
                        name="eventType" id="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        onFocus={() => handleFocus('eventType')}
                        onBlur={handleBlur}
                        required
                        className={`block w-full cursor-pointer appearance-none border-0 border-b-2 bg-transparent py-3 px-0 text-sm font-medium transition-colors focus:outline-none focus:ring-0 ${
                          formData.eventType ? 'text-gray-900' : 'text-transparent'
                        } ${
                          focusedField === 'eventType' || formData.eventType
                            ? 'border-[#0A3659]'
                            : 'border-gray-200'
                        }`}
                      >
                        <option value="" disabled hidden />
                        <option value="Wedding" className="text-gray-800">Wedding Ceremony &amp; Reception</option>
                        <option value="Baby Shower" className="text-gray-800">Baby Shower Celebration</option>
                        <option value="Ear Piercing" className="text-gray-800">Ear Piercing Ceremony</option>
                        <option value="Birthday" className="text-gray-800">Milestone Birthday / Gala</option>
                        <option value="Other" className="text-gray-800">Other Bespoke Event</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-0 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <label
                      htmlFor="eventType"
                      className={`absolute origin-[0] transform text-sm transition-all duration-300 flex items-center gap-1.5 pointer-events-none ${
                        formData.eventType || focusedField === 'eventType'
                          ? '-top-2 scale-75 font-semibold text-[#0A3659]'
                          : 'top-3 scale-100 text-gray-400'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Event Type <span className="text-red-500">*</span>
                    </label>
                  </div>

                  {/* Budget */}
                  <FloatingField
                    id="estimatedBudget" name="estimatedBudget" type="text"
                    label="Estimated Budget (e.g. ₹50,000 – ₹2,00,000)"
                    icon={<DollarSign className="h-3.5 w-3.5" />}
                    value={formData.estimatedBudget} onChange={handleChange}
                    onFocus={() => handleFocus('estimatedBudget')} onBlur={handleBlur}
                    focused={focusedField === 'estimatedBudget'}
                  />

                  {/* Notes (optional) */}
                  <div className="relative z-0 w-full">
                    <textarea
                      name="notes" id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      onFocus={() => handleFocus('notes')}
                      onBlur={handleBlur}
                      rows={3}
                      placeholder=" "
                      className={`peer block w-full resize-none appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-sm font-medium text-gray-900 transition-colors focus:outline-none focus:ring-0 ${
                        focusedField === 'notes' ? 'border-[#0A3659]' : 'border-gray-200'
                      }`}
                    />
                    <label
                      htmlFor="notes"
                      className="absolute top-2.5 -z-10 origin-[0] transform text-sm duration-300 flex items-center gap-1.5 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-[#0A3659] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75 text-gray-400"
                    >
                      Any special notes or vision?
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c4a030] px-6 py-4 text-sm font-bold tracking-wide text-[#0A3659] shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#0A3659]" />
                          <span>Submitting Your Request…</span>
                        </>
                      ) : (
                        <>
                          <span>Request Consultation</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#0A3659]/60 transition-colors hover:text-[#0A3659]"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Reusable floating-label input ──────────────────────────────────────────
interface FloatingFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
}

function FloatingField({
  id, name, type, label, required, icon, value, onChange, onFocus, onBlur, focused,
}: FloatingFieldProps) {
  const lifted = !!value || focused;
  return (
    <div className="relative z-0 w-full">
      <input
        type={type} name={name} id={id}
        value={value} onChange={onChange}
        onFocus={onFocus} onBlur={onBlur}
        required={required}
        placeholder=" "
        className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-3 px-0 text-sm font-medium text-gray-900 transition-colors focus:outline-none focus:ring-0 ${
          focused ? 'border-[#0A3659]' : 'border-gray-200'
        }`}
      />
      <label
        htmlFor={id}
        className={`absolute origin-[0] transform text-sm transition-all duration-300 flex items-center gap-1.5 pointer-events-none ${
          lifted
            ? '-top-2 scale-75 font-semibold text-[#0A3659]'
            : 'top-3 scale-100 text-gray-400'
        }`}
      >
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}
