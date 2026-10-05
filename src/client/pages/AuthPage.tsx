import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup, googleAuth, requestPasswordReset, resetPassword } = useAuth();
  const { t, locale } = useLanguage();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>(initialMode);

  // Form Fields
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // UI state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!acceptedTerms) {
          throw new Error(
            locale === 'fr'
              ? "Veuillez accepter les Conditions d'utilisation et la Politique de confidentialité."
              : 'Please accept the Terms of Service and Privacy Policy.'
          );
        }
        if (password.length < 8) {
          throw new Error(t.auth.passwordReq);
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup(displayName, email, password, confirmPassword);
        onSuccess();
      } else if (mode === 'login') {
        await login(email, password);
        onSuccess();
      } else if (mode === 'forgot-password') {
        const res = await requestPasswordReset(email);
        setInfoMessage(res.message);
        setResetToken(res.resetToken);
        setMode('reset-password');
      } else if (mode === 'reset-password') {
        if (password.length < 8) {
          throw new Error(t.auth.passwordReq);
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await resetPassword(resetToken, password, confirmPassword);
        setInfoMessage(res.message);
        setMode('login');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoUser = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login('alex@brainforge.io', 'password123');
      onSuccess();
    } catch (e: any) {
      setErrorMessage(e.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login('admin@brainforge.io', 'admin1234');
      onSuccess();
    } catch (e: any) {
      setErrorMessage(e.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await googleAuth();
      onSuccess();
    } catch (e: any) {
      setErrorMessage(e.message || 'Google Auth failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 mx-auto shadow-md shadow-emerald-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {mode === 'login'
              ? t.auth.signInTitle
              : mode === 'signup'
              ? t.auth.signUpTitle
              : mode === 'forgot-password'
              ? t.auth.forgotTitle
              : t.auth.resetTitle}
          </h1>
          <p className="text-xs text-zinc-400">
            BrainForge Secure Authentication with Supabase & Server RLS.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-zinc-400">
                {t.auth.displayNameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.auth.displayNamePlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode !== 'reset-password' && (
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-zinc-400">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'reset-password' && (
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-zinc-400">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="rst-..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {mode !== 'forgot-password' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-bold text-zinc-400">
                  {mode === 'reset-password' ? 'New Password' : t.auth.passwordLabel}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('forgot-password');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {t.auth.forgotPasswordLink}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <span className="text-[11px] text-zinc-500 block">
                  {t.auth.passwordReq}
                </span>
              )}
            </div>
          )}

          {(mode === 'signup' || mode === 'reset-password') && (
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-zinc-400">
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-400 select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-zinc-900 cursor-pointer"
                />
                <span className="leading-snug">
                  {locale === 'fr' ? (
                    <>
                      J'ai lu et j'accepte les{' '}
                      <a
                        href="/fr/conditions"
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', '/fr/conditions');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="text-emerald-400 underline hover:text-emerald-300 font-medium"
                      >
                        Conditions d'utilisation
                      </a>{' '}
                      et la{' '}
                      <a
                        href="/fr/confidentialite"
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', '/fr/confidentialite');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="text-emerald-400 underline hover:text-emerald-300 font-medium"
                      >
                        Politique de confidentialité
                      </a>.
                    </>
                  ) : (
                    <>
                      I have read and agree to the{' '}
                      <a
                        href="/en/terms"
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', '/en/terms');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="text-emerald-400 underline hover:text-emerald-300 font-medium"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="/en/privacy"
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', '/en/privacy');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="text-emerald-400 underline hover:text-emerald-300 font-medium"
                      >
                        Privacy Policy
                      </a>.
                    </>
                  )}
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>
                {mode === 'login'
                  ? t.auth.submitSignIn
                  : mode === 'signup'
                  ? t.auth.submitSignUp
                  : mode === 'forgot-password'
                  ? t.auth.submitForgot
                  : t.auth.submitReset}
              </span>
            )}
          </button>
        </form>

        {/* Google OAuth & Demo buttons */}
        {mode === 'login' && (
          <div className="space-y-3 pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="flex-shrink mx-3 text-zinc-500 text-[11px] uppercase font-semibold">or</span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-zinc-200 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.27 21.39 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.09z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"/>
              </svg>
              <span>{t.auth.continueWithGoogle}</span>
            </button>

            {/* Quick Demo Access Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDemoUser}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[11px] font-semibold border border-zinc-700 transition-colors cursor-pointer"
              >
                {t.auth.demoAlex}
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>{t.auth.demoAdmin}</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle between Login and Signup */}
        <div className="pt-2 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <div>
              <span>{t.auth.dontHaveAccount} </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode('signup');
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {t.nav.signUp}
              </button>
            </div>
          ) : (
            <div>
              <span>{t.auth.alreadyHaveAccount} </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode('login');
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {t.nav.signIn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
