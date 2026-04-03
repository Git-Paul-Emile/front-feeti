import {
  ArrowLeft, Gift, Share2, Users, Trophy, Zap, Crown, Star, TrendingUp,
  Award, Copy, Check, Target, Calendar, Loader2, AlertCircle, Store,
  MessageSquare, Medal, Sparkles, Plus, ThumbsUp, Send,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  loyaltyApi,
  type LoyaltyProfile, type LoyaltyReward, type LoyaltyMission,
  type LeaderboardEntry, type LoyaltyPartner, type CommunityPost,
  type AmbassadorBadge, type LoyaltyBonus,
} from '../../api/loyalty';

interface FeetiNaFeetiPageProps {
  onBack: () => void;
  currentUser: any;
}

const LEVELS = [
  { name: 'Mobembo', min: 0,    max: 999,    color: 'from-gray-400 to-gray-600',     icon: Star,   benefits: ['Réductions de base', 'Points sur achats'] },
  { name: 'Elengi',  min: 1000, max: 1999,   color: 'from-blue-400 to-blue-600',     icon: Award,  benefits: ['Accès prioritaire', '10% bonus points', 'Réductions partenaires'] },
  { name: 'Momi',    min: 2000, max: 2999,   color: 'from-purple-400 to-purple-600', icon: Crown,  benefits: ['Files VIP', '15% bonus points', 'Invitations exclusives'] },
  { name: 'Mwana',   min: 3000, max: 3999,   color: 'from-orange-400 to-orange-600', icon: Zap,    benefits: ['Accès backstage', '20% bonus points', 'Événements privés'] },
  { name: 'Boboto',  min: 4000, max: 999999, color: 'from-yellow-400 to-amber-600',  icon: Trophy, benefits: ['Concierge VIP', '30% bonus points', 'Expériences sur-mesure'] },
];

export function FeetiNaFeetiPage({ onBack, currentUser }: FeetiNaFeetiPageProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'missions' | 'leaderboard' | 'referral' | 'partners' | 'community' | 'badges'>('home');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [missions, setMissions] = useState<LoyaltyMission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [partners, setPartners] = useState<LoyaltyPartner[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [badges, setBadges] = useState<AmbassadorBadge[]>([]);
  const [activeBonuses, setActiveBonuses] = useState<LoyaltyBonus[]>([]);

  // Community post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [postSaving, setPostSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, r, m, l, pa, cp, b, ab] = await Promise.all([
        loyaltyApi.getMyProfile(),
        loyaltyApi.getRewards(),
        loyaltyApi.getMissions(),
        loyaltyApi.getLeaderboard(),
        loyaltyApi.getPartners(),
        loyaltyApi.getCommunityPosts(),
        loyaltyApi.getMyBadges(),
        loyaltyApi.getActiveBonuses(),
      ]);
      setProfile(p);
      setRewards(r);
      setMissions(m);
      setLeaderboard(l);
      setPartners(pa);
      setCommunityPosts(cp.items ?? []);
      setBadges(b);
      setActiveBonuses(ab);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentLevel = LEVELS.find(l => l.name === profile?.level) ?? LEVELS[0];
  const nextLevel = LEVELS.find(l => l.min > (profile?.points ?? 0)) ?? currentLevel;
  const progressToNext = profile
    ? ((profile.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 0;
  const pointsToNext = nextLevel.min - (profile?.points ?? 0);
  const LevelIcon = currentLevel.icon;

  const referralLink = `https://feeti.com/ref/${profile?.referralCode ?? ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleRedeem = async (reward: LoyaltyReward) => {
    try {
      await loyaltyApi.redeemReward(reward.id);
      toast.success(`Récompense "${reward.title}" réclamée !`);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'échange');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await loyaltyApi.engageCommunityPost(postId, 'like');
      toast.success(`+${res.data?.pointsEarned ?? 5} pts !`);
      loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Déjà liké');
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) return;
    setPostSaving(true);
    try {
      await loyaltyApi.createCommunityPost(postForm);
      toast.success('Publication soumise — en attente de modération (+50 pts)');
      setShowPostForm(false);
      setPostForm({ title: '', content: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setPostSaving(false);
    }
  };

  const pointsToFCFA = (points: number) => (points * 20).toLocaleString('fr-FR');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-700">{error}</p>
        <Button onClick={loadAll}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 text-white hover:text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">FEETI NA FEETI</h1>
              <p className="text-indigo-100">Programme de fidélité et récompenses</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
            {([
              { key: 'home',        label: 'Ma carte',    Icon: Gift          },
              { key: 'rewards',     label: 'Récompenses', Icon: Award         },
              { key: 'missions',    label: 'Missions',    Icon: Target        },
              { key: 'partners',    label: 'Partenaires', Icon: Store         },
              { key: 'community',   label: 'Communauté',  Icon: MessageSquare },
              { key: 'badges',      label: 'Badges',      Icon: Medal         },
              { key: 'leaderboard', label: 'Classement',  Icon: Trophy        },
              { key: 'referral',    label: 'Parrainage',  Icon: Users         },
            ] as { key: string; label: string; Icon: any }[]).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === key ? 'bg-white text-indigo-600' : 'text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── Tab: Home ── */}
        {activeTab === 'home' && profile && (
          <div className="space-y-6">
            {/* Carte FEETI */}
            <Card className={`bg-gradient-to-br ${currentLevel.color} text-white border-0 shadow-2xl overflow-hidden relative`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-sm text-white/80 mb-1">FEETI CARD</p>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                  </div>
                  <div className="text-right">
                    <LevelIcon className="w-12 h-12 mb-2 mx-auto" />
                    <p className="text-sm font-semibold">{currentLevel.name.toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Points disponibles</p>
                    <p className="text-3xl font-bold">{profile.points.toLocaleString()}</p>
                    <p className="text-xs text-white/70">≈ {pointsToFCFA(profile.points)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80 mb-1">Événements</p>
                    <p className="text-3xl font-bold">{profile.eventsAttended}</p>
                    <p className="text-xs text-white/70">{profile.referrals} parrainages</p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Prochain niveau : {nextLevel.name}</p>
                    <p className="text-sm font-bold">{pointsToNext} pts</p>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(progressToNext, 0), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-1">{profile.points} / {nextLevel.min} points</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { tab: 'rewards',     Icon: Gift,   color: 'text-indigo-600', label: 'Utiliser mes points', sub: `${profile.points} pts` },
                { tab: 'missions',    Icon: Target, color: 'text-green-600',  label: 'Missions',            sub: 'Gagnez plus' },
                { tab: 'referral',    Icon: Users,  color: 'text-purple-600', label: 'Inviter des amis',    sub: '+150 pts/ami' },
                { tab: 'leaderboard', Icon: Trophy, color: 'text-amber-600',  label: 'Classement',          sub: `Rang #${leaderboard.find(u => u.isCurrentUser)?.rank ?? '?'}` },
              ].map(({ tab, Icon, color, label, sub }) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className="h-auto flex-col py-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                >
                  <Icon className={`w-8 h-8 mb-2 ${color}`} />
                  <span className="font-semibold">{label}</span>
                  <span className="text-xs text-gray-500">{sub}</span>
                </Button>
              ))}
            </div>

            {/* Campagnes en cours */}
            {activeBonuses.length > 0 && (
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-800">Campagnes actives — Points boostés !</h3>
                  </div>
                  <div className="space-y-1">
                    {activeBonuses.map(b => (
                      <p key={b.id} className="text-sm text-amber-700">
                        🎯 <strong>{b.title}</strong> — {b.bonusType === 'multiplier' ? `Points ×${b.value}` : `+${b.value} pts`}
                        {b.actionType ? ` (${b.actionType})` : ''} · jusqu'au {new Date(b.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comment gagner des points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Comment gagner des points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { Icon: Gift,           bg: 'bg-indigo-100',  ic: 'text-indigo-600',  title: 'Achat de billet',           sub: '1 point pour 100 FCFA',        val: 'Variable',  vc: 'text-indigo-600' },
                    { Icon: Check,          bg: 'bg-green-100',   ic: 'text-green-600',   title: 'Participation événement',    sub: 'Scan QR à l\'entrée',          val: '+200 pts',  vc: 'text-green-600'  },
                    { Icon: Share2,         bg: 'bg-purple-100',  ic: 'text-purple-600',  title: 'Partage événement',          sub: 'Sur vos réseaux (max 10/j)',    val: '+20 pts',   vc: 'text-purple-600' },
                    { Icon: Store,          bg: 'bg-blue-100',    ic: 'text-blue-600',    title: 'Dépenses partenaires',       sub: '1 pt / 1000 FCFA + bonus',     val: 'Variable',  vc: 'text-blue-600'   },
                    { Icon: MessageSquare,  bg: 'bg-teal-100',    ic: 'text-teal-600',    title: 'Publication communauté',     sub: 'Contenu approuvé',             val: '+50 pts',   vc: 'text-teal-600'   },
                    { Icon: ThumbsUp,       bg: 'bg-pink-100',    ic: 'text-pink-600',    title: 'Engagement communauté',      sub: 'Likes et commentaires',        val: '+5–10 pts', vc: 'text-pink-600'   },
                    { Icon: Users,          bg: 'bg-amber-100',   ic: 'text-amber-600',   title: 'Parrainage',                 sub: 'Ami inscrit + participe',      val: '+450 pts',  vc: 'text-amber-600'  },
                    { Icon: Calendar,       bg: 'bg-orange-100',  ic: 'text-orange-600',  title: 'Bonus activité mensuelle',   sub: '3 ou 5 événements dans le mois',val: '+150/300',  vc: 'text-orange-600' },
                  ].map(({ Icon, bg, ic, title, sub, val, vc }) => (
                    <div key={title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${ic}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{title}</p>
                          <p className="text-xs text-gray-600">{sub}</p>
                        </div>
                      </div>
                      <span className={`${vc} font-bold text-sm whitespace-nowrap ml-2`}>{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Avantages du niveau */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Vos avantages {currentLevel.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {currentLevel.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab: Rewards ── */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Catalogue de récompenses</h2>
              <p className="text-gray-600 mt-1">Vous avez {profile?.points ?? 0} points à dépenser</p>
            </div>

            {rewards.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune récompense disponible pour le moment.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => {
                  const canAfford = (profile?.points ?? 0) >= reward.points;
                  return (
                    <Card key={reward.id} className={`overflow-hidden ${!canAfford ? 'opacity-60' : ''}`}>
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: reward.image ? `url(${reward.image})` : undefined, backgroundColor: reward.image ? undefined : '#e5e7eb' }}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {reward.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">{reward.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-indigo-600">{reward.points} pts</p>
                            <p className="text-xs text-gray-500">{reward.stock} disponible{reward.stock > 1 ? 's' : ''}</p>
                          </div>
                          <Button
                            disabled={!canAfford || reward.stock === 0}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            onClick={() => handleRedeem(reward)}
                          >
                            Échanger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Missions ── */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Missions disponibles</h2>
              <p className="text-gray-600 mt-1">Complétez des missions pour gagner des points bonus</p>
            </div>

            {missions.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucune mission disponible pour le moment.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {missions.map((mission) => {
                  const actionIcons: Record<string, any> = {
                    event_attendance: Calendar,
                    referral_signup: Users,
                    event_share: Share2,
                    ticket_purchase: Gift,
                  };
                  const MissionIcon = actionIcons[mission.actionType] ?? Target;
                  const progressPercent = (mission.progress / mission.target) * 100;

                  return (
                    <Card key={mission.id} className={mission.completed ? 'border-green-200 bg-green-50' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mission.completed ? 'bg-green-100' : 'bg-indigo-100'}`}>
                            <MissionIcon className={`w-6 h-6 ${mission.completed ? 'text-green-600' : 'text-indigo-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900">{mission.title}</h3>
                                <p className="text-sm text-gray-600">{mission.description}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-indigo-600">+{mission.points} pts</p>
                                {mission.completed && <span className="text-xs text-green-600 font-medium">✓ Terminé</span>}
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Progression</span>
                                <span className="text-sm font-medium text-gray-900">{mission.progress} / {mission.target}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${mission.completed ? 'bg-green-500' : 'bg-indigo-600'}`}
                                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Leaderboard ── */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Classement FEETI</h2>
              <p className="text-gray-600 mt-1">Les meilleurs ambassadeurs du mois</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {leaderboard.map((user) => (
                    <div
                      key={`${user.rank}-${user.userId}`}
                      className={`p-4 flex items-center gap-4 ${user.isCurrentUser ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.rank <= 3 ? <Trophy className="w-5 h-5" /> : `#${user.rank}`}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {user.isCurrentUser ? `${user.name} (Vous)` : user.name}
                        </p>
                        <p className="text-sm text-gray-600">Niveau {user.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab: Partners ── */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Partenaires marchands</h2>
              <p className="text-gray-600 mt-1">Vos réductions exclusives selon votre niveau <strong>{profile?.level}</strong></p>
            </div>

            {/* Bonus actifs */}
            {activeBonuses.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-800">Campagnes en cours</h3>
                  </div>
                  <div className="space-y-1">
                    {activeBonuses.map(b => (
                      <p key={b.id} className="text-sm text-amber-700">
                        🎯 <strong>{b.title}</strong> — {b.bonusType === 'multiplier' ? `×${b.value} pts` : `+${b.value} pts`}
                        {b.actionType ? ` sur ${b.actionType}` : ''} · jusqu'au {new Date(b.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {partners.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">Aucun partenaire disponible pour le moment.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map(partner => {
                  const myDiscount = (partner.discountByLevel as any)?.[profile?.level ?? 'Mobembo'] ?? partner.discount;
                  return (
                    <Card key={partner.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {partner.logo || '🏢'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900">{partner.name}</h3>
                            <p className="text-xs text-gray-500">{partner.category}</p>
                            {partner.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{partner.description}</p>}
                          </div>
                        </div>

                        {/* Ma réduction */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3 text-center">
                          <p className="text-xs text-gray-500 mb-0.5">Votre réduction ({profile?.level})</p>
                          <p className="text-2xl font-bold text-indigo-600">{myDiscount}</p>
                          {partner.bonusPoints > 0 && (
                            <p className="text-xs text-green-600 mt-0.5">+{partner.bonusPoints} pts / 1000 FCFA dépensés</p>
                          )}
                        </div>

                        {/* Grille toutes remises */}
                        <div className="grid grid-cols-5 gap-1 mb-3">
                          {(['Mobembo', 'Elengi', 'Momi', 'Mwana', 'Boboto'] as const).map(level => (
                            <div key={level} className={`text-center p-1 rounded text-xs ${
                              level === profile?.level ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <p className="font-bold">{(partner.discountByLevel as any)?.[level] ?? partner.discount}</p>
                              <p className="text-[9px] truncate">{level}</p>
                            </div>
                          ))}
                        </div>

                        {(partner.address || partner.phone) && (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {partner.address && <p>📍 {partner.address}</p>}
                            {partner.phone && <p>📞 {partner.phone}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Community ── */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Communauté</h2>
                <p className="text-gray-600 text-sm mt-1">Partagez vos expériences, gagnez des points</p>
              </div>
              <Button
                onClick={() => setShowPostForm(!showPostForm)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />Publier (+50 pts)
              </Button>
            </div>

            {showPostForm && (
              <Card className="border-indigo-200">
                <CardHeader><CardTitle className="text-base">Nouvelle publication</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPost} className="space-y-3">
                    <input
                      value={postForm.title}
                      onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Titre de votre publication..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                    <textarea
                      value={postForm.content}
                      onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="Partagez votre expérience, un coup de cœur, un avis..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={postSaving} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        {postSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Publier
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowPostForm(false)}>Annuler</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {communityPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Aucune publication pour le moment.</p>
                  <p className="text-sm mt-1">Soyez le premier à partager votre expérience !</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {communityPosts.map(post => (
                  <Card key={post.id} className={post.isFeatured ? 'border-indigo-300 shadow-md' : ''}>
                    <CardContent className="p-5">
                      {post.isFeatured && (
                        <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium mb-2">
                          <Star className="w-3 h-3" />Publication mise en avant
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                        <div className="flex items-center gap-3">
                          <span>💬 {post.commentsCount}</span>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {post.likesCount} (+5 pts)
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Badges ── */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Vos badges ambassadeur</h2>
              <p className="text-gray-600 text-sm mt-1">Débloquez des badges en accomplissant des exploits sur la plateforme</p>
            </div>

            {badges.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucun badge encore</p>
                  <p className="text-sm text-gray-400 mt-2">Participez à des événements, publiez du contenu et parrainez vos amis pour gagner vos premiers badges !</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <Card key={badge.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-5 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Medal className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{badge.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <p className="text-xs text-gray-400">Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Badges à débloquer */}
            <Card>
              <CardHeader><CardTitle>Badges à débloquer</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'first_post',      title: 'Première publication',   desc: 'Publiez votre premier contenu communautaire',     unlocked: badges.some(b => b.badgeType === 'first_post') },
                    { type: 'content_creator', title: 'Créateur de contenu',    desc: 'Publiez 5 contenus dans la communauté',           unlocked: badges.some(b => b.badgeType === 'content_creator') },
                    { type: 'community_star',  title: 'Étoile de la communauté',desc: '20 publications approuvées',                      unlocked: badges.some(b => b.badgeType === 'community_star') },
                    { type: 'first_referral',  title: 'Premier parrain',        desc: 'Parrainez votre premier ami',                     unlocked: badges.some(b => b.badgeType === 'first_referral') },
                    { type: 'referral_master', title: 'Maître du parrainage',   desc: '5 amis parrainés avec succès',                   unlocked: badges.some(b => b.badgeType === 'referral_master') },
                    { type: 'referral_legend', title: 'Légende du parrainage',  desc: '10 amis parrainés',                              unlocked: badges.some(b => b.badgeType === 'referral_legend') },
                  ].map(({ type, title, desc, unlocked }) => (
                    <div key={type} className={`flex items-center gap-3 p-3 rounded-lg ${unlocked ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${unlocked ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {unlocked ? <Check className="w-5 h-5 text-white" /> : <Medal className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${unlocked ? 'text-green-800' : 'text-gray-700'}`}>{title}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      {unlocked && <span className="text-xs text-green-600 font-medium">✓ Obtenu</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab: Referral ── */}
        {activeTab === 'referral' && profile && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Parrainage</h2>
              <p className="text-gray-600 mt-1">Invitez vos amis et gagnez des points</p>
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gagnez jusqu'à 450 points</h3>
                <p className="text-gray-700 mb-6">
                  Invitez un ami et recevez 150 points quand il s'inscrit, puis 300 points supplémentaires quand il participe à son premier événement !
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Votre lien de parrainage</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Rejoins-moi sur FEETI ! ${referralLink}`)}`, '_blank')}>
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')}>
                    Facebook
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=Rejoins-moi sur FEETI !`, '_blank')}>
                    Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vos parrainages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">{profile.referrals}</p>
                    <p className="text-sm text-gray-600 mt-1">Amis inscrits</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{profile.referrals * 150}</p>
                    <p className="text-sm text-gray-600 mt-1">Points inscription</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600">{profile.referralCode}</p>
                    <p className="text-sm text-gray-600 mt-1">Votre code</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
