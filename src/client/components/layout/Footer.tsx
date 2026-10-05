import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Brain, Mail, Sparkles, Shield, ArrowUpRight, Heart } from 'lucide-react';
import { AppTab } from './Header';

interface FooterProps {
  onNavigate: (tab: AppTab | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { locale, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Column 1 & 2: AI Nova Crew & BrainForge Identity */}
          <div className="lg:col-span-2 space-y-4">
            {/* Brand Header */}
            <div
              onClick={() => onNavigate(user ? 'dashboard' : 'home')}
              className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-4 h-4 font-black" />
              </div>
              <span className="font-black text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                BrainForge
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                by AI Nova Crew
              </span>
            </div>

            {/* AI Nova Crew Copywriting */}
            <p className="text-zinc-300 font-medium leading-relaxed">
              {t.footer.brandDesc}
            </p>

            {/* Short Tagline */}
            <p className="text-zinc-500 text-[11px] italic">
              {t.footer.tagline}
            </p>

            {/* BrainForge Description (No medical / QI claims) */}
            <p className="text-zinc-400 leading-relaxed text-[11px] pt-1">
              {t.footer.brainForgeDesc}
            </p>
          </div>

          {/* Column 3: BrainForge Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {t.footer.colBrand}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.nav.pricing}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.footer.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Compte / User Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {t.footer.colAccount}
            </h4>
            <ul className="space-y-2">
              {!user ? (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.signIn}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('signup')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.signUp}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.dashboard}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('profile')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.profile}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('history')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.history}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('settings')}
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      {t.nav.settings}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 5: Informations & Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {t.footer.colInfo}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.footer.privacy}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t.footer.terms}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>{t.footer.contact}</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="block text-[11px] text-zinc-500 uppercase font-mono font-bold mb-1">
                {t.footer.directContact}
              </span>
              <a
                href="mailto:ai.novacrew@gmail.com"
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>ai.novacrew@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Discrete Signature */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-zinc-500 text-[11px]">
          <div>
            © {currentYear} AI Nova Crew. {t.footer.rightsReserved}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium">
              {t.footer.slogan}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
