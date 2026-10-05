import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Mail, Send, CheckCircle2, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ContactClientSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: 'NAME_REQUIRED' })
    .max(100, { message: 'NAME_MAX' }),
  email: z.string()
    .trim()
    .email({ message: 'EMAIL_INVALID' })
    .max(150, { message: 'EMAIL_MAX' }),
  subject: z.string()
    .trim()
    .min(1, { message: 'SUBJECT_REQUIRED' }),
  message: z.string()
    .trim()
    .min(10, { message: 'MESSAGE_MIN' })
    .max(3000, { message: 'MESSAGE_MAX' }),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof ContactClientSchema>;

interface ContactPageProps {
  onBackToHome?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const { locale, t } = useLanguage();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync document title for SEO
  useEffect(() => {
    document.title = locale === 'fr' ? 'Contact — BrainForge' : 'Contact Us — BrainForge';
    return () => {
      document.title = 'BrainForge - Cognitive Training SaaS';
    };
  }, [locale]);

  const subjectOptions = [
    t.contact.subjects.general,
    t.contact.subjects.technical,
    t.contact.subjects.suggestion,
    t.contact.subjects.issue,
    t.contact.subjects.billing,
    t.contact.subjects.partnership,
    t.contact.subjects.other,
  ];

  const getValidationMessage = (code: string) => {
    switch (code) {
      case 'NAME_REQUIRED':
        return locale === 'fr' ? 'Veuillez saisir votre nom.' : 'Please enter your name.';
      case 'NAME_MAX':
        return locale === 'fr' ? 'Le nom ne peut dépasser 100 caractères.' : 'Name cannot exceed 100 characters.';
      case 'EMAIL_INVALID':
        return locale === 'fr' ? 'Veuillez saisir une adresse e-mail valide.' : 'Please enter a valid email address.';
      case 'EMAIL_MAX':
        return locale === 'fr' ? "L'adresse e-mail est trop longue." : 'Email address is too long.';
      case 'SUBJECT_REQUIRED':
        return locale === 'fr' ? 'Veuillez sélectionner un sujet.' : 'Please select a subject.';
      case 'MESSAGE_MIN':
        return locale === 'fr'
          ? 'Veuillez saisir votre message (au moins 10 caractères).'
          : 'Please enter your message (at least 10 characters).';
      case 'MESSAGE_MAX':
        return locale === 'fr'
          ? 'Le message ne peut dépasser 3000 caractères.'
          : 'Message cannot exceed 3000 characters.';
      default:
        return code;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate with Zod
    const validation = ContactClientSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = getValidationMessage(issue.message);
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (locale === 'fr'
              ? "Impossible d'envoyer votre message pour le moment. Veuillez réessayer plus tard."
              : 'Unable to send your message at this time. Please try again later.')
        );
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
      });
    } catch (err: any) {
      setServerError(
        err.message ||
          (locale === 'fr'
            ? "Impossible d'envoyer votre message pour le moment. Veuillez réessayer plus tard."
            : 'Unable to send your message at this time. Please try again later.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setServerError(null);
    setErrors({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.contact.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t.contact.title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {t.contact.subtitle}
        </p>
      </section>

      {/* Main Grid: Form + Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
          {isSuccess ? (
            <div className="py-10 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  {t.contact.successTitle}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {t.contact.successDesc}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {t.contact.sendAnother}
                </button>
                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.contact.backHome}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {serverError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Honeypot field */}
              <div
                style={{ display: 'none' }}
                aria-hidden="true"
                className="hidden"
              >
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Nom complet */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono"
                >
                  {t.contact.nameLabel} <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.contact.namePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border ${
                    errors.name ? 'border-rose-500/60 focus:border-rose-500' : 'border-zinc-800 focus:border-emerald-500'
                  } text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Adresse e-mail */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono"
                >
                  {t.contact.emailLabel} <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.contact.emailPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border ${
                    errors.email ? 'border-rose-500/60 focus:border-rose-500' : 'border-zinc-800 focus:border-emerald-500'
                  } text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Sujet */}
              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono"
                >
                  {t.contact.subjectLabel} <span className="text-emerald-400">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border ${
                    errors.subject ? 'border-rose-500/60 focus:border-rose-500' : 'border-zinc-800 focus:border-emerald-500'
                  } text-sm text-zinc-100 outline-none transition-colors cursor-pointer`}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>
                    {t.contact.subjectPlaceholder}
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-950 text-zinc-200">
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-xs text-rose-400 font-medium">{errors.subject}</p>
                )}
              </div>

              {/* Votre message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono"
                  >
                    {t.contact.messageLabel} <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {formData.message.length} / 3000
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.contact.messagePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border ${
                    errors.message ? 'border-rose-500/60 focus:border-rose-500' : 'border-zinc-800 focus:border-emerald-500'
                  } text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors resize-y leading-relaxed`}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-xs text-rose-400 font-medium">{errors.message}</p>
                )}
              </div>

              {/* Bouton Envoyer */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t.contact.sendingBtn}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.contact.submitBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Information Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              AI Nova Crew
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {locale === 'fr'
                ? 'Nous sommes à votre écoute pour toute question relative au fonctionnement de BrainForge, vos données, des suggestions de nouvelles fonctionnalités ou des opportunités de partenariats.'
                : 'We are here to help with any questions regarding BrainForge workouts, data, feature suggestions, or partnership opportunities.'}
            </p>

            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    {locale === 'fr' ? 'Email de contact' : 'Contact email'}
                  </div>
                  <a
                    href="mailto:ai.novacrew@gmail.com"
                    className="text-emerald-400 hover:underline"
                  >
                    ai.novacrew@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    {locale === 'fr' ? 'Délai de réponse' : 'Response time'}
                  </div>
                  <div className="text-zinc-400">
                    {locale === 'fr' ? 'Généralement sous 24 à 48 heures ouvrées' : 'Typically within 24 to 48 business hours'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-500 leading-relaxed">
            {locale === 'fr'
              ? 'Vos informations sont strictement utilisées pour vous répondre et ne sont jamais transmises à des tiers.'
              : 'Your information is strictly used to reply to your inquiry and is never shared with third parties.'}
          </div>
        </div>
      </div>
    </div>
  );
};
