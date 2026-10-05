import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Brain,
  Zap,
  Sparkles,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  User,
  LayoutDashboard,
  Target,
  Activity,
  Layers,
  Award,
  ShieldAlert,
} from 'lucide-react';

interface HowItWorksPageProps {
  onSignUp: () => void;
  onViewPricing: () => void;
  onStart: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onSignUp,
  onViewPricing,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-20 animate-fade-in">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Brain className="w-4 h-4" />
          <span>{t.howItWorks.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          {t.howItWorks.heroTitle}
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {t.howItWorks.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onSignUp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.howItWorks.ctaStart}</span>
          </button>
          <button
            type="button"
            onClick={onViewPricing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{t.howItWorks.ctaPricing}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* 2. Étape 1 — Créez votre compte */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
              {t.howItWorks.step1Title}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t.howItWorks.step1Headline}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.step1Desc}
            </p>
          </div>

          <button
            type="button"
            onClick={onSignUp}
            className="shrink-0 px-6 py-3.5 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.howItWorks.step1Btn}</span>
          </button>
        </div>

        {/* Visual pipeline: Inscription -> Profil -> Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase font-mono">
                {t.howItWorks.pipeSignupTitle}
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {t.howItWorks.pipeSignupDesc}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase font-mono">
                {t.howItWorks.pipeProfileTitle}
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {t.howItWorks.pipeProfileDesc}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase font-mono">
                {t.howItWorks.pipeDashboardTitle}
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {t.howItWorks.pipeDashboardDesc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Étape 2 — Choisissez un défi (6 Catégories) */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
            {t.howItWorks.step2Title}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.howItWorks.step2Headline}
          </h2>
          <p className="text-sm text-zinc-400">
            {t.howItWorks.step2Desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Mémoire */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catMemoryTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catMemoryDesc}
            </p>
          </div>

          {/* Logique */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catLogicTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catLogicDesc}
            </p>
          </div>

          {/* Attention */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catAttentionTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catAttentionDesc}
            </p>
          </div>

          {/* Patterns */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catPatternsTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catPatternsDesc}
            </p>
          </div>

          {/* Réaction */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catReactionTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catReactionDesc}
            </p>
          </div>

          {/* Quiz */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              {t.howItWorks.catQuizTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.howItWorks.catQuizDesc}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Étape 3 — Jouez */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
            {t.howItWorks.step3Title}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.howItWorks.step3Headline}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.howItWorks.step3Desc}
          </p>
        </div>

        {/* Challenge -> Réponse -> Validation -> Score */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
                {t.howItWorks.stageA}
              </div>
              <div className="text-base font-black text-white">
                {t.howItWorks.flowChallenge}
              </div>
              <div className="text-xs text-zinc-400">
                {t.howItWorks.stageADesc}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase">
                {t.howItWorks.stageB}
              </div>
              <div className="text-base font-black text-white">
                {t.howItWorks.flowResponse}
              </div>
              <div className="text-xs text-zinc-400">
                {t.howItWorks.stageBDesc}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <div className="text-xs font-mono font-bold text-teal-400 uppercase">
                {t.howItWorks.stageC}
              </div>
              <div className="text-base font-black text-white">
                {t.howItWorks.flowValidation}
              </div>
              <div className="text-xs text-zinc-400">
                {t.howItWorks.stageCDesc}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                {t.howItWorks.stageD}
              </div>
              <div className="text-base font-black text-white">
                {t.howItWorks.flowScore}
              </div>
              <div className="text-xs text-zinc-400">
                {t.howItWorks.stageDDesc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Étape 4 — Obtenez votre score */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
            {t.howItWorks.step4Title}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.howItWorks.step4Headline}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.howItWorks.step4Desc}
          </p>
        </div>

        {/* 4 Métriques: Score, Pourcentage, Durée, XP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
              {t.howItWorks.metric1Label}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100 / 100</div>
            <div className="text-xs text-zinc-300 font-semibold">{t.howItWorks.metricScore}</div>
            <div className="text-[11px] text-zinc-500">{t.howItWorks.metric1Sub}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
              {t.howItWorks.metric2Label}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">100 %</div>
            <div className="text-xs text-zinc-300 font-semibold">{t.howItWorks.metricAccuracy}</div>
            <div className="text-[11px] text-zinc-500">{t.howItWorks.metric2Sub}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
              {t.howItWorks.metric3Label}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">245 ms</div>
            <div className="text-xs text-zinc-300 font-semibold">{t.howItWorks.metricDuration}</div>
            <div className="text-[11px] text-zinc-500">{t.howItWorks.metric3Sub}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
              {t.howItWorks.metric4Label}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">+120 XP</div>
            <div className="text-xs text-zinc-300 font-semibold">{t.howItWorks.metricXp}</div>
            <div className="text-[11px] text-zinc-500">{t.howItWorks.metric4Sub}</div>
          </div>
        </div>
      </section>

      {/* 6. Étape 5 — Progressez */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider">
            {t.howItWorks.step5Title}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.howItWorks.step5Headline}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.howItWorks.step5Desc}
          </p>
        </div>

        {/* XP -> Niveau -> Progression -> Historique */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-white">
              {t.howItWorks.cardXpTitle}
            </div>
            <div className="text-xs text-zinc-400">
              {t.howItWorks.cardXpDesc}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-white">
              {t.howItWorks.cardLevelsTitle}
            </div>
            <div className="text-xs text-zinc-400">
              {t.howItWorks.cardLevelsDesc}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-white">
              {t.howItWorks.cardProgressTitle}
            </div>
            <div className="text-xs text-zinc-400">
              {t.howItWorks.cardProgressDesc}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-white">
              {t.howItWorks.cardHistoryTitle}
            </div>
            <div className="text-xs text-zinc-400">
              {t.howItWorks.cardHistoryDesc}
            </div>
          </div>
        </div>

        {/* Ethical disclaimer card */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-200">{t.howItWorks.disclaimerTitle}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.howItWorks.disclaimerText}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border-2 border-emerald-500/50 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t.howItWorks.ctaTitle}
          </h2>
          <p className="text-sm text-zinc-400">
            {t.howItWorks.ctaSubtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onSignUp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.howItWorks.ctaStart}</span>
          </button>
          <button
            type="button"
            onClick={onViewPricing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.howItWorks.ctaPricing}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
