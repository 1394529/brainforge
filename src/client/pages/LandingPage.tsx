import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Brain,
  Zap,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  Activity,
  Layers,
  Award,
  ChevronRight,
  Sparkle,
  Mail,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onDiscover: () => void;
  onSignUp: () => void;
  onLogin?: () => void;
  onPricing?: () => void;
  onContact?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onDiscover,
  onSignUp,
  onPricing,
  onContact,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-20 animate-fade-in">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Brain className="w-4 h-4" />
          <span>{t.landing.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
          <span className="block">{t.landing.heroTitleLine1 || 'Défiez votre esprit.'}</span>
          <span className="block">{t.landing.heroTitleLine2 || '5 minutes par jour.'}</span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.landing.ctaPrimary}</span>
          </button>

          <button
            type="button"
            onClick={onDiscover}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{t.landing.ctaSecondary}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* 2. Section — Pourquoi BrainForge ? (6 Cartes) */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.landing.whyTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            {t.landing.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Mémoire */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition-all group hover:shadow-xl hover:shadow-amber-500/5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featureMemoryTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featureMemoryDesc}
            </p>
          </div>

          {/* Logique */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/50 transition-all group hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featureLogicTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featureLogicDesc}
            </p>
          </div>

          {/* Attention */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/50 transition-all group hover:shadow-xl hover:shadow-rose-500/5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featureAttentionTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featureAttentionDesc}
            </p>
          </div>

          {/* Patterns */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 transition-all group hover:shadow-xl hover:shadow-purple-500/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featurePatternsTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featurePatternsDesc}
            </p>
          </div>

          {/* Réaction */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition-all group hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featureReactionTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featureReactionDesc}
            </p>
          </div>

          {/* Quiz */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/50 transition-all group hover:shadow-xl hover:shadow-blue-500/5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.landing.featureQuizTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.landing.featureQuizDesc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Section — Comment ça marche ? (4 Étapes) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-10 relative overflow-hidden">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.landing.howTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            {t.landing.howSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 hover:border-emerald-500/40 transition-colors">
            <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
              {t.landing.stepPrefix} 01
            </span>
            <h4 className="text-base font-bold text-zinc-100">
              {t.landing.step1}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.landing.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 hover:border-emerald-500/40 transition-colors">
            <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
              {t.landing.stepPrefix} 02
            </span>
            <h4 className="text-base font-bold text-zinc-100">
              {t.landing.step2}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.landing.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 hover:border-emerald-500/40 transition-colors">
            <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
              {t.landing.stepPrefix} 03
            </span>
            <h4 className="text-base font-bold text-zinc-100">
              {t.landing.step3}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.landing.step3Desc}
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 hover:border-emerald-500/40 transition-colors">
            <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
              {t.landing.stepPrefix} 04
            </span>
            <h4 className="text-base font-bold text-zinc-100">
              {t.landing.step4}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.landing.step4Desc}
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onDiscover}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group"
          >
            <span>{t.landing.discoverDetailed}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 4. Section — Une Expérience Gamifiée */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.landing.gamificationBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.landing.gamificationTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {t.landing.gamificationSubtitle}
          </p>
        </div>

        {/* 5 blocs gamification */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-mono font-black text-white text-base">XP</div>
            <div className="text-[11px] text-zinc-400">{t.landing.effortPoints}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div className="font-mono font-black text-white text-base">Niveaux</div>
            <div className="text-[11px] text-zinc-400">{t.landing.levelsTiers}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div className="font-mono font-black text-white text-base">Progression</div>
            <div className="text-[11px] text-zinc-400">{t.landing.levelUpBar}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div className="font-mono font-black text-white text-base">{t.landing.scoresStepTitle || 'Scores'}</div>
            <div className="text-[11px] text-zinc-400">{t.landing.accuracySpeed}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 mx-auto rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div className="font-mono font-black text-white text-base">{t.landing.historyStepTitle || 'Historique'}</div>
            <div className="text-[11px] text-zinc-400">{t.landing.sessionHistory}</div>
          </div>
        </div>

        {/* Clear non-medical disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-zinc-200">{t.landing.noteLabel}</strong> {t.landing.disclaimer} {t.landing.noteDisclaimer}
          </p>
        </div>
      </section>

      {/* 5. Section — 5 Minutes Par Jour */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.landing.shortDailyBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.landing.fiveMinutesTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            {t.landing.fiveMinutesSubtitle}
          </p>
        </div>

        {/* Visual equation */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-4 sm:gap-6">
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">5 min</div>
            <div className="text-xs text-zinc-400 font-medium">{t.landing.quickSession}</div>
          </div>

          <div className="text-xl font-bold text-zinc-600 font-mono">+</div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{t.landing.oneChallenge || '1 défi'}</div>
            <div className="text-xs text-zinc-400 font-medium">{t.landing.clearGoal}</div>
          </div>

          <div className="text-xl font-bold text-zinc-600 font-mono">+</div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{t.landing.oneScore || '1 score'}</div>
            <div className="text-xs text-zinc-400 font-medium">{t.landing.directResult}</div>
          </div>

          <div className="text-xl font-bold text-zinc-600 font-mono">=</div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">{t.landing.oneProgression || '1 progression'}</div>
            <div className="text-xs text-zinc-400 font-medium">{t.landing.continuousXp}</div>
          </div>
        </div>
      </section>

      {/* 6. CTA Final */}
      <section className="p-8 sm:p-14 rounded-3xl bg-zinc-900 border-2 border-emerald-500/50 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.landing.readyTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t.landing.readySubtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onSignUp}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.landing.ctaFree}</span>
          </button>

          {onPricing && (
            <button
              type="button"
              onClick={onPricing}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.nav.pricing}</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>
      </section>

      {/* 7. Section Contact — Une question ? */}
      <section className="p-8 sm:p-10 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.landing.contactBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.landing.contactTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {t.landing.contactDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {onContact && (
            <button
              type="button"
              onClick={onContact}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>{t.landing.contactCta}</span>
            </button>
          )}

          <a
            href="mailto:ai.novacrew@gmail.com"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ai.novacrew@gmail.com</span>
          </a>
        </div>
      </section>
    </div>
  );
};
