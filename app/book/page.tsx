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

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    console.log('--- Booking Form Submission Payload ---');
    console.log(JSON.stringify(payload, null, 2));

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
    <div className="min-h-screen bg-tharika-cream py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Background Subtle Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(10, 54, 89, 0.08) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Section with Official Logo */}
        <motion.div
          className="text-center mb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="relative w-48 h-20 mb-4 block hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Tharika Decors & Events"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-tharika-green bg-tharika-green/10 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-tharika-gold" />
            Reserve Your Date
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-tharika-blue tracking-tight">
            Book a Consultation
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-tharika-blue/70 max-w-md mx-auto leading-relaxed">
            Let us bring your celebration to life with bespoke royal decor tailored to your personal aesthetic.
          </p>
        </motion.div>

        {/* Form Container Card */}
        <motion.div
          className="bg-white shadow-xl rounded-3xl p-8 sm:p-10 border border-tharika-blue/10 transition-all duration-300 hover:shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-tharika-green flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-heading text-2xl text-tharika-blue">
                  Thank You, {formData.fullName.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-sm text-gray-600 max-w-sm">
                  We have received your booking inquiry for your {formData.eventType || 'event'}. Our team will review the details and get in touch with you shortly.
                </p>
                <div className="pt-4 w-full">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3 px-4 rounded-xl border border-tharika-blue/20 text-tharika-blue text-sm font-semibold hover:bg-tharika-blue/5 transition-colors cursor-pointer"
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
                {/* 1. Full Name */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('fullName')}
                    onBlur={handleBlur}
                    required
                    placeholder=" "
                    className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
                  />
                  <label
                    htmlFor="fullName"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                      formData.fullName || focusedField === 'fullName'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* 2. Email Address */}
                <div className="relative z-0 w-full group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    required
                    placeholder=" "
                    className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                      formData.email || focusedField === 'email'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* 3. Phone Number */}
                <div className="relative z-0 w-full group">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={handleBlur}
                    required
                    placeholder=" "
                    className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
                  />
                  <label
                    htmlFor="phone"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                      formData.phone || focusedField === 'phone'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* 4. Event Date */}
                <div className="relative z-0 w-full group">
                  <input
                    type="date"
                    name="eventDate"
                    id="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    onFocus={() => handleFocus('eventDate')}
                    onBlur={handleBlur}
                    required
                    className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                  />
                  <label
                    htmlFor="eventDate"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                      formData.eventDate || focusedField === 'eventDate'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Event Date <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* 5. Event Type */}
                <div className="relative z-0 w-full group">
                  <div className="relative">
                    <select
                      name="eventType"
                      id="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      onFocus={() => handleFocus('eventType')}
                      onBlur={handleBlur}
                      required
                      className={`block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors cursor-pointer ${
                        formData.eventType ? 'text-gray-900' : 'text-transparent'
                      }`}
                    >
                      <option value="" disabled hidden></option>
                      <option value="Wedding" className="text-gray-800">Wedding Ceremony &amp; Reception</option>
                      <option value="Baby Shower" className="text-gray-800">Baby Shower Celebration</option>
                      <option value="Ear Piercing" className="text-gray-800">Ear Piercing Ceremony</option>
                      <option value="Birthday" className="text-gray-800">Milestone Birthday / Gala</option>
                      <option value="Other" className="text-gray-800">Other Bespoke Event</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <label
                    htmlFor="eventType"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-pointer flex items-center gap-1.5 ${
                      formData.eventType || focusedField === 'eventType'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Event Type <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* 6. Estimated Budget */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    name="estimatedBudget"
                    id="estimatedBudget"
                    value={formData.estimatedBudget}
                    onChange={handleChange}
                    onFocus={() => handleFocus('estimatedBudget')}
                    onBlur={handleBlur}
                    placeholder=" "
                    className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 font-medium focus:border-tharika-blue focus:outline-none focus:ring-0 transition-colors"
                  />
                  <label
                    htmlFor="estimatedBudget"
                    className={`absolute top-2.5 -z-10 origin-[0] text-sm duration-300 transform cursor-text flex items-center gap-1.5 ${
                      formData.estimatedBudget || focusedField === 'estimatedBudget'
                        ? '-translate-y-5 scale-75 text-tharika-blue font-semibold'
                        : 'translate-y-0 scale-100 text-gray-400'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Estimated Budget (e.g. ₹50,000 - ₹2,00,000)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-4 px-6 rounded-xl bg-tharika-gold-gradient text-tharika-blue font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-tharika-blue" />
                        <span>Submitting Your Request...</span>
                      </>
                    ) : (
                      <span>Request Consultation</span>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-tharika-blue/70 hover:text-tharika-blue transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
