import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Badge } from '../components/ui/Badge';
import {
  Shield,
  ShieldAlert,
  Database,
  Users,
  Calendar,
  Trophy,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminPageProps {
  onBackToDashboard: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToDashboard }) => {
  const { user, token } = useAuth();
  const { t, locale } = useLanguage();

  const [activeTab, setActiveTab] = useState<'challenges' | 'users' | 'daily' | 'achievements'>('challenges');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);

  // New Daily Challenge Form
  const [dailyFormChallengeId, setDailyFormChallengeId] = useState<string>('');
  const [dailyFormDate, setDailyFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyFormDifficulty, setDailyFormDifficulty] = useState<number>(2);
  const [dailyFormBonus, setDailyFormBonus] = useState<number>(25);

  // New Achievement Form
  const [achCode, setAchCode] = useState<string>('');
  const [achName, setAchName] = useState<string>('');
  const [achNameFr, setAchNameFr] = useState<string>('');
  const [achDesc, setAchDesc] = useState<string>('');
  const [achDescFr, setAchDescFr] = useState<string>('');
  const [achIcon, setAchIcon] = useState<string>('Award');
  const [achReqType, setAchReqType] = useState<string>('total_challenges');
  const [achReqVal, setAchReqVal] = useState<number>(1);
  const [achBonus, setAchBonus] = useState<number>(50);

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    setIsForbidden(false);

    try {
      const [cRes, uRes, dRes, aRes] = await Promise.all([
        fetch('/api/admin/challenges', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/daily', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/achievements', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (cRes.status === 403 || uRes.status === 403) {
        setIsForbidden(true);
        return;
      }

      if (cRes.ok && uRes.ok) {
        const cData = await cRes.json();
        const uData = await uRes.json();
        setChallenges(cData.challenges || []);
        setUsers(uData.users || []);
        if (cData.challenges?.length > 0 && !dailyFormChallengeId) {
          setDailyFormChallengeId(cData.challenges[0].id);
        }
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDailyChallenges(dData.dailyChallenges || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAchievements(aData.achievements || []);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleCreateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dailyFormChallengeId || !dailyFormDate) return;
    try {
      const res = await fetch('/api/admin/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: dailyFormChallengeId,
          challengeDate: dailyFormDate,
          difficulty: Number(dailyFormDifficulty),
          bonusXp: Number(dailyFormBonus),
        }),
      });
      if (res.ok) {
        alert('Défi du jour programmé avec succès !');
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la programmation');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !achCode || !achName) return;
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: achCode,
          name: achName,
          nameFr: achNameFr || achName,
          description: achDesc,
          descriptionFr: achDescFr || achDesc,
          icon: achIcon,
          category: 'general',
          requirementType: achReqType,
          requirementValue: Number(achReqVal),
          xpBonus: Number(achBonus),
          isActive: true,
        }),
      });
      if (res.ok) {
        alert('Achievement enregistré !');
        setAchCode('');
        setAchName('');
        setAchNameFr('');
        setAchDesc('');
        setAchDescFr('');
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la création');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleAchievement = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/achievements/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isForbidden) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">{t.admin.unauthorizedTitle}</h2>
        <p className="text-sm text-zinc-400">{t.admin.unauthorizedDesc}</p>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
        >
          {t.common.backToDashboard}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-black text-white">{t.admin.title}</h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                RBAC Level: Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{t.admin.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{locale === 'fr' ? 'Rafraîchir' : 'Refresh'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'challenges'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{locale === 'fr' ? `Défis (${challenges.length})` : `Challenges (${challenges.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Challenges ({dailyChallenges.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Achievements ({achievements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Utilisateurs ({users.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Daily Challenges Admin Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Schedule form */}
              <form onSubmit={handleCreateDaily} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  {locale === 'fr' ? 'Programmer un Défi Quotidien' : 'Schedule a Daily Challenge'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      required
                      value={dailyFormDate}
                      onChange={(e) => setDailyFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">
                      {locale === 'fr' ? 'Défi' : 'Challenge'}
                    </label>
                    <select
                      value={dailyFormChallengeId}
                      onChange={(e) => setDailyFormChallengeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100 cursor-pointer"
                    >
                      {challenges.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.type.toUpperCase()}] {c.titleFr || c.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">
                      {locale === 'fr' ? 'Difficulté (1-5)' : 'Difficulty (1-5)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={dailyFormDifficulty}
                      onChange={(e) => setDailyFormDifficulty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Bonus XP</label>
                    <input
                      type="number"
                      min={0}
                      value={dailyFormBonus}
                      onChange={(e) => setDailyFormBonus(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
                  >
                    {locale === 'fr' ? 'Enregistrer le Daily Challenge' : 'Save Daily Challenge'}
                  </button>
                </div>
              </form>

              {/* Daily challenges table */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase">
                      <th className="pb-3 pl-2">Date</th>
                      <th className="pb-3">Challenge ID</th>
                      <th className="pb-3">{locale === 'fr' ? 'Difficulté' : 'Difficulty'}</th>
                      <th className="pb-3">Bonus XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {dailyChallenges.map((d) => (
                      <tr key={d.id} className="hover:bg-zinc-850/40">
                        <td className="py-3 pl-2 font-bold text-white">{d.challengeDate}</td>
                        <td className="py-3 text-zinc-300">{d.challengeId}</td>
                        <td className="py-3 text-zinc-400">Niveau {d.difficulty}</td>
                        <td className="py-3 text-amber-400 font-bold">+{d.bonusXp} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Achievements Admin Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Create Achievement Form */}
              <form onSubmit={handleCreateAchievement} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Créer ou Mettre à Jour un Achievement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Code Unique (ex: STREAK_50)</label>
                    <input
                      type="text"
                      required
                      value={achCode}
                      onChange={(e) => setAchCode(e.target.value.toUpperCase().trim())}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Nom (FR)</label>
                    <input
                      type="text"
                      required
                      value={achNameFr}
                      onChange={(e) => setAchNameFr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Nom (EN)</label>
                    <input
                      type="text"
                      required
                      value={achName}
                      onChange={(e) => setAchName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1 font-mono">Description (FR)</label>
                    <input
                      type="text"
                      value={achDescFr}
                      onChange={(e) => setAchDescFr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Condition Type</label>
                    <select
                      value={achReqType}
                      onChange={(e) => setAchReqType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100 cursor-pointer"
                    >
                      <option value="total_challenges">Total Challenges</option>
                      <option value="streak">Streak (Jours)</option>
                      <option value="first_challenge">First Challenge</option>
                      <option value="first_daily">First Daily</option>
                      <option value="level">Level</option>
                      <option value="quiz_score">Quiz Score</option>
                      <option value="memory_score">Memory Score</option>
                      <option value="reaction_score">Reaction Score</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Valeur requise</label>
                    <input
                      type="number"
                      value={achReqVal}
                      onChange={(e) => setAchReqVal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-mono">Bonus XP</label>
                    <input
                      type="number"
                      value={achBonus}
                      onChange={(e) => setAchBonus(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
                  >
                    Enregistrer l'Achievement
                  </button>
                </div>
              </form>

              {/* Achievements table */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase">
                      <th className="pb-3 pl-2">Code</th>
                      <th className="pb-3">Nom (FR)</th>
                      <th className="pb-3">Condition</th>
                      <th className="pb-3">Bonus XP</th>
                      <th className="pb-3">Statut</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {achievements.map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-850/40">
                        <td className="py-3 pl-2 font-mono font-bold text-amber-400">{a.code}</td>
                        <td className="py-3 text-white font-medium">{a.nameFr || a.name}</td>
                        <td className="py-3 text-zinc-400 font-mono">{a.requirementType} ({a.requirementValue})</td>
                        <td className="py-3 text-emerald-400 font-mono font-bold">+{a.xpBonus} XP</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {a.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAchievement(a.id, a.isActive)}
                            className="text-xs text-zinc-400 hover:text-white cursor-pointer underline"
                          >
                            {locale === 'fr'
                              ? (a.isActive ? 'Désactiver' : 'Activer')
                              : (a.isActive ? 'Deactivate' : 'Activate')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase">
                    <th className="pb-3 pl-2">ID</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">{locale === 'fr' ? 'Difficulté' : 'Difficulty'}</th>
                    <th className="pb-3">{locale === 'fr' ? 'Titre' : 'Title'}</th>
                    <th className="pb-3">{locale === 'fr' ? 'Statut' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-850/40">
                      <td className="py-3 pl-2 font-mono text-zinc-400">{c.id}</td>
                      <td className="py-3">
                        <Badge variant="type" type={c.type} />
                      </td>
                      <td className="py-3 font-mono text-zinc-300">Niv. {c.difficulty}</td>
                      <td className="py-3 text-zinc-100 font-medium">
                        {locale === 'en' ? (c.titleEn || c.titleFr) : (c.titleFr || c.titleEn)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase">
                    <th className="pb-3 pl-2">{locale === 'fr' ? 'Utilisateur' : 'User'}</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">{locale === 'fr' ? 'Rôle' : 'Role'}</th>
                    <th className="pb-3">{locale === 'fr' ? 'Niveau' : 'Level'}</th>
                    <th className="pb-3">Total XP</th>
                    <th className="pb-3">{locale === 'fr' ? 'Défis Joués' : 'Played Challenges'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-850/40">
                      <td className="py-3 pl-2 font-bold text-zinc-200">{u.displayName}</td>
                      <td className="py-3 font-mono text-zinc-400">{u.email}</td>
                      <td className="py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-zinc-200">Lvl {u.currentLevel}</td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">{u.totalXp} XP</td>
                      <td className="py-3 font-mono text-zinc-400">{u.attemptsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
