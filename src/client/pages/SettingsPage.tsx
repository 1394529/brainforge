import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Settings, User, Mail, Shield, Globe, Lock, CheckCircle2, Loader2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateDisplayName, updateProfileSettings, changePassword } = useAuth();
  const { locale, setLocale, t } = useLanguage();

  const [displayNameInput, setDisplayNameInput] = useState<string>(user?.displayName || '');
  const [timezoneInput, setTimezoneInput] = useState<string>(user?.timezone || 'Europe/Paris');
  const [showInLeaderboardInput, setShowInLeaderboardInput] = useState<boolean>(
    user?.showInLeaderboard !== false
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput || displayNameInput.trim().length < 2) return;

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfileSettings({
        displayName: displayNameInput,
        timezone: timezoneInput,
        showInLeaderboard: showInLeaderboardInput,
      });
      setSuccessMessage(t.settings.saveSuccess);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(t.auth.passwordReq || 'Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-black text-white">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          {t.settings.subtitle}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              {t.settings.displayNameLabel}
            </label>
            <input
              type="text"
              required
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Email Address (read only) */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {t.settings.emailLabel}
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-sm cursor-not-allowed select-none"
            />
          </div>

          {/* Role (read only) */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-500" />
              {t.settings.roleLabel}
            </label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                user?.role === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}>
                {user?.role || 'user'}
              </span>
              {user?.role === 'admin' && (
                <span className="text-xs text-amber-400/90 font-medium">
                  Administrator Privileges Active
                </span>
              )}
            </div>
          </div>

          {/* Interface Language */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              {t.settings.languageLabel}
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setLocale('fr')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  locale === 'fr'
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300'
                    : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                Français (FR)
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  locale === 'en'
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300'
                    : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          {/* Timezone for Daily Challenge & Streak */}
          <div className="space-y-1.5 pt-2">
            <label htmlFor="timezone-select" className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              {locale === 'fr' ? 'Fuseau horaire (Daily Challenge & Streak)' : 'Timezone (Daily Challenge & Streak)'}
            </label>
            <select
              id="timezone-select"
              value={timezoneInput}
              onChange={(e) => setTimezoneInput(e.target.value)}
              className="w-full max-w-sm px-4 py-3 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
              <option value="UTC">{locale === 'fr' ? 'UTC (Temps Universel)' : 'UTC (Universal Time)'}</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
            <p className="text-[11px] text-zinc-500">
              {locale === 'fr'
                ? "Détermine l'heure de renouvellement de votre défi quotidien et le calcul de votre streak."
                : 'Sets the reset time for your daily challenge and streak calculation.'}
            </p>
          </div>

          {/* Leaderboard Privacy Toggle */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              {locale === 'fr' ? 'Confidentialité du Classement' : 'Leaderboard Privacy'}
            </label>
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-850/60 border border-zinc-700/80 cursor-pointer hover:bg-zinc-850 transition-colors">
              <input
                type="checkbox"
                checked={showInLeaderboardInput}
                onChange={(e) => setShowInLeaderboardInput(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-400 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  {locale === 'fr'
                    ? 'Afficher mon profil dans le classement public'
                    : 'Display my profile on the public leaderboard'}
                </span>
                <span className="text-[11px] text-zinc-400 block leading-relaxed">
                  {locale === 'fr'
                    ? "Permet à votre pseudo et votre niveau d'apparaître dans le tableau des scores hebdomadaire et général. Si désactivé, vous restez invisible pour les autres joueurs."
                    : 'Allows your username and level to appear on the weekly and all-time leaderboard. If disabled, you stay invisible to other players.'}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.common.saving}</span>
              </>
            ) : (
              <span>{t.common.save}</span>
            )}
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <form onSubmit={handlePasswordChange} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Lock className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">
              {t.settings.securityTitle}
            </h2>
            <p className="text-xs text-zinc-400">
              {t.settings.passwordHelp}
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-zinc-400">
              {locale === 'fr' ? 'Mot de passe actuel' : 'Current password'}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-400">
                {locale === 'fr' ? 'Nouveau mot de passe' : 'New password'}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={locale === 'fr' ? 'Min. 8 caractères' : 'Min. 8 characters'}
                className="w-full px-4 py-3 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-400">
                {locale === 'fr' ? 'Confirmer nouveau mot de passe' : 'Confirm new password'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-3 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.common.saving}</span>
              </>
            ) : (
              <span>{locale === 'fr' ? 'Mettre à jour le mot de passe' : 'Update Password'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Zone de danger : Suppression de compte */}
      <div className="p-6 sm:p-8 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Shield className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider font-mono">
            {locale === 'fr'
              ? 'Zone de danger — Suppression du compte'
              : 'Danger Zone — Account Deletion'}
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {locale === 'fr' ? (
            <>
              La suppression de votre compte entraînera l'effacement ou l'anonymisation de votre profil, de vos résultats, de votre série (streak), de vos points d'XP et de vos badges. Seules les informations strictement requises par les obligations légales ou de sécurité seront conservées de façon limitée conformément à notre{' '}
              <a
                href="/fr/confidentialite"
                className="text-rose-400 underline hover:text-rose-300"
              >
                Politique de confidentialité
              </a>.
            </>
          ) : (
            <>
              Deleting your account will result in the permanent removal or anonymization of your profile, workout results, daily streak, XP points, and badges. Only information strictly required by statutory or security obligations will be retained in accordance with our{' '}
              <a
                href="/en/privacy"
                className="text-rose-400 underline hover:text-rose-300"
              >
                Privacy Policy
              </a>.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            const confirmMsg =
              locale === 'fr'
                ? 'Êtes-vous certain de vouloir supprimer définitivement votre compte BrainForge ? Cette opération est irréversible.'
                : 'Are you sure you want to permanently delete your BrainForge account? This action cannot be undone.';
            const alertMsg =
              locale === 'fr'
                ? 'Votre demande de suppression a été enregistrée. Votre session va être clôturée.'
                : 'Your deletion request has been recorded. Your session will now be terminated.';
            if (window.confirm(confirmMsg)) {
              alert(alertMsg);
              window.location.href = '/';
            }
          }}
          className="px-4 py-2.5 rounded-xl border border-rose-800/80 bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
        >
          {locale === 'fr' ? 'Supprimer mon compte' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
};
