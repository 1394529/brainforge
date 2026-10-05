import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Brain,
  Check,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface PricingPageProps {
  onSelectFree: () => void;
  onSelectPremium: () => void;
  onViewHow: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectFree,
  onSelectPremium,
  onViewHow,
}) => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: t.pricing.faq1Q, a: t.pricing.faq1A },
    { q: t.pricing.faq2Q, a: t.pricing.faq2A },
    { q: t.pricing.faq3Q, a: t.pricing.faq3A },
    { q: t.pricing.faq4Q, a: t.pricing.faq4A },
    { q: t.pricing.faq5Q, a: t.pricing.faq5A },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-20 animate-fade-in">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Brain className="w-4 h-4" />
          <span>{t.pricing.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          {t.pricing.heroTitle}
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {t.pricing.heroSubtitle}
        </p>
      </section>

      {/* 2. Cartes Tarifaires (Gratuit vs Premium) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plan Gratuit */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-8 relative shadow-xl hover:border-zinc-700 transition-colors">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
                  {t.pricing.freeAccessBadge}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {t.pricing.freeTitle}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white font-mono">
                  {t.pricing.freePrice}
                </span>
                <span className="block text-[11px] text-zinc-400 font-mono">
                  {t.pricing.freePeriod}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.pricing.freeDesc}
            </p>

            <div className="pt-2 border-t border-zinc-800 space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat1}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat2}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat3}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat4} ({t.pricing.limited})</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.noCreditCard}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSelectFree}
            className="w-full py-4 rounded-2xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.pricing.freeCta}</span>
          </button>
        </div>

        {/* Plan Premium */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 border-2 border-emerald-500/60 flex flex-col justify-between space-y-8 relative shadow-2xl">
          {/* Badge Recommandé */}
          <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-emerald-500 text-zinc-950 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            {t.pricing.popularBadge}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-teal-400 font-mono tracking-wider">
                  {t.pricing.premiumAccessBadge}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {t.pricing.premiumTitle}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-emerald-400 font-mono">
                  {t.pricing.premiumPrice}
                </span>
                <span className="block text-[11px] text-zinc-400 font-mono">
                  {t.pricing.premiumPeriod}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.pricing.premiumDesc}
            </p>

            <div className="pt-2 border-t border-zinc-800 space-y-3 text-xs text-zinc-200">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">{t.pricing.everythingInFree}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat5}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat6}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat7}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat8}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.pricing.feat9}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSelectPremium}
            className="w-full py-4 rounded-2xl font-bold text-sm text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{t.pricing.premiumCta}</span>
          </button>
        </div>
      </section>

      {/* 3. Tableau Comparatif Détaillé */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.pricing.comparisonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {t.pricing.comparisonSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[11px]">
                <th className="py-4 px-4 font-bold">{t.pricing.featureCol}</th>
                <th className="py-4 px-4 font-bold text-center w-36 sm:w-44 text-zinc-200">
                  {t.pricing.freeCol}
                </th>
                <th className="py-4 px-4 font-bold text-center w-36 sm:w-44 text-emerald-400">
                  {t.pricing.premiumCol}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat1}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat2}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat3}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat4}</td>
                <td className="py-3.5 px-4 text-center font-mono text-zinc-400">{t.pricing.limited}</td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{t.pricing.unlimited}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat5}</td>
                <td className="py-3.5 px-4 text-center font-mono text-zinc-500">{t.pricing.basic}</td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{t.pricing.advanced}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat7}</td>
                <td className="py-3.5 px-4 text-center font-mono text-zinc-400">{t.pricing.oneSessionPerDay}</td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{t.pricing.unlimited}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat8}</td>
                <td className="py-3.5 px-4 text-center font-mono text-zinc-500">—</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">{t.pricing.feat9}</td>
                <td className="py-3.5 px-4 text-center font-mono text-zinc-500">—</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.pricing.yes}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Section FAQ */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.pricing.faqBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.pricing.faqTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:text-emerald-400 transition-colors"
                >
                  <span className="font-bold text-sm text-zinc-200">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Avertissement Éthique & Transparence */}
      <section className="max-w-3xl mx-auto p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200">{t.pricing.transparencyTitle}</strong> {t.pricing.disclaimerNotice} {t.pricing.transparencyDesc}
        </div>
      </section>

      {/* 6. CTA Final */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border-2 border-emerald-500/50 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t.pricing.ctaReadyTitle}
          </h2>
          <p className="text-sm text-zinc-400">
            {t.pricing.ctaReadySubtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onSelectFree}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.pricing.freeCta}</span>
          </button>
          <button
            type="button"
            onClick={onViewHow}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.pricing.ctaDiscoverHow}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
