import React, { useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Mail, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { privacyFr } from '../locales/fr/privacy';
import { privacyEn } from '../locales/en/privacy';

interface PrivacyPolicyPageProps {
  onBackToHome?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  const { locale } = useLanguage();
  const data = locale === 'en' ? privacyEn : privacyFr;

  useEffect(() => {
    // Dynamic SEO Title and Description
    document.title = data.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', data.meta.description);
    }
    document.documentElement.lang = locale;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [locale, data]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in text-zinc-300">
      {/* Navigation retour */}
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{data.header.backButton}</span>
        </button>
      )}

      {/* Header Document */}
      <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{data.header.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {data.header.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
          <span>
            {data.header.lastUpdatedLabel} :{' '}
            <strong className="text-zinc-200">{data.header.lastUpdatedDate}</strong>
          </span>
          <span>•</span>
          <span>
            {data.header.versionLabel} :{' '}
            <strong className="text-zinc-200">{data.header.version}</strong>
          </span>
          <span>•</span>
          <span>
            {data.header.publisherLabel} :{' '}
            <strong className="text-emerald-400">{data.header.publisher}</strong>
          </span>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed pt-2">
          {data.header.intro}
        </p>
      </div>

      {/* Sommaire interactif rapide */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>{data.header.tableOfContentsTitle}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {data.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="text-left text-zinc-400 hover:text-emerald-400 transition-colors py-0.5 truncate"
            >
              <span className="font-mono text-emerald-500 mr-1.5">{section.number}.</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu textuel complet */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-10 shadow-xl leading-relaxed text-sm sm:text-base">
        {data.sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className={`space-y-4 scroll-mt-24 ${idx > 0 ? 'border-t border-zinc-800 pt-8' : ''}`}
          >
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-sm">{section.number}.</span>
              {section.title}
            </h2>

            {section.content.map((p, i) => (
              <p key={i} className="text-zinc-300">
                {p}
              </p>
            ))}

            {/* Optional contact box */}
            {section.contactBox && (
              <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-750 text-xs sm:text-sm space-y-1">
                <p className="font-bold text-white">{section.contactBox.organization}</p>
                <p className="text-zinc-300">{section.contactBox.dpoTitle}</p>
                <p className="text-zinc-400">{section.contactBox.serviceName}</p>
                <a
                  href={`mailto:${section.contactBox.email}`}
                  className="text-emerald-400 font-mono font-bold block pt-1 hover:underline"
                >
                  {section.contactBox.email}
                </a>
              </div>
            )}

            {/* Optional categories */}
            {section.categories && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
                {section.categories.map((cat, ci) => (
                  <div key={ci} className="p-4 rounded-xl bg-zinc-850 border border-zinc-800 space-y-2">
                    <h4 className="font-bold text-white uppercase tracking-wider font-mono text-xs text-emerald-400">
                      {cat.name}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-400">
                      {cat.items.map((item, ii) => (
                        <li key={ii}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Optional bullets */}
            {section.bullets && (
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-zinc-400 pt-1">
                {section.bullets.map((b, bi) => (
                  <li key={bi} className="text-zinc-300 leading-normal">
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Optional warning box */}
            {section.warningBox && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 space-y-2 mt-2">
                <p className="font-bold flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{section.warningBox.title}</span>
                </p>
                <p className="leading-relaxed">{section.warningBox.text}</p>
              </div>
            )}

            {/* Optional contactAction */}
            {section.contactAction && (
              <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-750 text-xs sm:text-sm space-y-2 mt-2">
                <p className="text-zinc-300">
                  <strong className="text-white">Email: </strong>
                  <a
                    href={`mailto:${section.contactAction.email}`}
                    className="text-emerald-400 font-mono font-bold hover:underline"
                  >
                    {section.contactAction.email}
                  </a>
                </p>
                <p className="text-zinc-400 text-xs">
                  <strong className="text-zinc-200">Subject: </strong>
                  {section.contactAction.subject}
                </p>
                <p className="text-zinc-400 text-xs italic">
                  {section.contactAction.instructions}
                </p>
              </div>
            )}

            {/* Optional note */}
            {section.note && (
              <p className="text-xs text-zinc-400 italic pt-1">{section.note}</p>
            )}
          </section>
        ))}
      </div>

      {/* Avertissement important en bas de page */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 space-y-2">
        <p className="font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-emerald-400" />
          <span>{data.disclaimer.title}</span>
        </p>
        <p className="leading-relaxed">{data.disclaimer.text}</p>
      </div>
    </div>
  );
};
