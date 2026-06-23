import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import CreatorAPI, { type CreatorProfile, type CreatorCampaign, type CreatorApplication, type CreatorCollaboration } from '../../services/api/CreatorAPI';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Loader2, Star, Users, Briefcase, Send, ExternalLink, Award } from 'lucide-react';
export function CreatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '', niche: '', audienceSize: 0, engagementRate: 0, portfolio: '', socialLinks: {} as Record<string, string> });
  const [profileSaving, setProfileSaving] = useState(false);

  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [collabs, setCollabs] = useState<CreatorCollaboration[]>([]);
  const [openCampaigns, setOpenCampaigns] = useState<CreatorCampaign[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const p = await CreatorAPI.getMyProfile();
      setProfile(p);
      setHasProfile(true);
      setProfileForm({
        bio: p.bio ?? '',
        niche: p.niche ?? '',
        audienceSize: p.audienceSize ?? 0,
        engagementRate: p.engagementRate ?? 0,
        portfolio: p.portfolio ?? '',
        socialLinks: p.socialLinks ?? {},
      });
    } catch {
      setHasProfile(false);
      setProfile(null);
      try {
        const catalog = await CreatorAPI.listCreators({ verified: true });
        setOpenCampaigns([]);
      } catch {}
      try {
        const allCampaigns = await CreatorAPI.listCreators();
        setOpenCampaigns([]);
      } catch {}
    }
    try {
      const apps = await CreatorAPI.getMyApplications();
      setApplications(apps);
    } catch {}
    try {
      const c = await CreatorAPI.getMyCollaborations();
      setCollabs(c);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleCreateProfile = async () => {
    if (!profileForm.niche) { toast.error('La niche est requise'); return; }
    setProfileSaving(true);
    try {
      const created = await CreatorAPI.createProfile(profileForm);
      setProfile(created);
      setHasProfile(true);
      toast.success('Profil créé !');
      setEditingProfile(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally { setProfileSaving(false); }
  };

  const handleUpdateProfile = async () => {
    setProfileSaving(true);
    try {
      const updated = await CreatorAPI.updateMyProfile(profileForm);
      setProfile(updated);
      toast.success('Profil mis à jour');
      setEditingProfile(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally { setProfileSaving(false); }
  };

  const handleApply = async (campaignId: string) => {
    if (!hasProfile || !profile) { toast.error('Créez votre profil avant de postuler'); setActiveTab('profile'); return; }
    setApplyingTo(campaignId);
    try {
      await CreatorAPI.applyToCampaign(campaignId, applyMsg);
      toast.success('Candidature envoyée !');
      setApplyMsg('');
      setApplyingTo(null);
      loadProfile();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally { setApplyingTo(null); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', open: 'bg-blue-100 text-blue-800', in_progress: 'bg-purple-100 text-purple-800', completed: 'bg-gray-100 text-gray-800', negotiating: 'bg-orange-100 text-orange-800', active: 'bg-indigo-100 text-indigo-800', delivered: 'bg-teal-100 text-teal-800', paid: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1e1e1e] tracking-tight">Espace Créateur</h1>
          <p className="text-gray-500 mt-1">Collaborez avec des organisateurs et faites grandir votre audience</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="profile" className="gap-1"><Award className="w-4 h-4" />Profil</TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1"><Briefcase className="w-4 h-4" />Campagnes</TabsTrigger>
            <TabsTrigger value="applications" className="gap-1"><Send className="w-4 h-4" />Candidatures</TabsTrigger>
            <TabsTrigger value="collabs" className="gap-1"><Users className="w-4 h-4" />Collaborations</TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {!hasProfile || editingProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle>{hasProfile ? 'Modifier mon profil' : 'Créer mon profil créateur'}</CardTitle>
                  <CardDescription>Renseignez vos informations pour apparaître dans le catalogue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Biographie</Label>
                    <Textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="Décrivez votre style, vos valeurs..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Niche</Label>
                      <Select value={profileForm.niche} onValueChange={v => setProfileForm(f => ({ ...f, niche: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="musique">Musique</SelectItem>
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="cuisine">Cuisine</SelectItem>
                          <SelectItem value="voyage">Voyage</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="comedie">Comédie / Humour</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="beaute">Beauté</SelectItem>
                          <SelectItem value="autres">Autres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Audience totale (abonnés)</Label>
                      <Input type="number" value={profileForm.audienceSize} onChange={e => setProfileForm(f => ({ ...f, audienceSize: parseInt(e.target.value) || 0 }))} placeholder="50000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Taux d'engagement (%)</Label>
                      <Input type="number" step="0.1" value={profileForm.engagementRate} onChange={e => setProfileForm(f => ({ ...f, engagementRate: parseFloat(e.target.value) || 0 }))} placeholder="4.5" />
                    </div>
                    <div>
                      <Label>Portfolio / site web</Label>
                      <Input value={profileForm.portfolio} onChange={e => setProfileForm(f => ({ ...f, portfolio: e.target.value }))} placeholder="https://mon-site.com" />
                    </div>
                  </div>
                  <div>
                    <Label>Réseaux sociaux (liens)</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Input placeholder="Instagram URL" value={profileForm.socialLinks.instagram || ''} onChange={e => setProfileForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))} />
                      <Input placeholder="TikTok URL" value={profileForm.socialLinks.tiktok || ''} onChange={e => setProfileForm(f => ({ ...f, socialLinks: { ...f.socialLinks, tiktok: e.target.value } }))} />
                      <Input placeholder="YouTube URL" value={profileForm.socialLinks.youtube || ''} onChange={e => setProfileForm(f => ({ ...f, socialLinks: { ...f.socialLinks, youtube: e.target.value } }))} />
                      <Input placeholder="X / Twitter URL" value={profileForm.socialLinks.twitter || ''} onChange={e => setProfileForm(f => ({ ...f, socialLinks: { ...f.socialLinks, twitter: e.target.value } }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={hasProfile ? handleUpdateProfile : handleCreateProfile} disabled={profileSaving} className="bg-indigo-600 hover:bg-indigo-700">
                      {profileSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {hasProfile ? 'Mettre à jour' : 'Créer mon profil'}
                    </Button>
                    {hasProfile && <Button variant="outline" onClick={() => setEditingProfile(false)}>Annuler</Button>}
                  </div>
                </CardContent>
              </Card>
            ) : profile ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {profile.user.name}
                        {profile.isVerified && <Badge className="bg-blue-100 text-blue-700">Vérifié</Badge>}
                      </CardTitle>
                      <CardDescription>{profile.niche} · {profile.user.email}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>Modifier</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && <p className="text-gray-600 text-sm">{profile.bio}</p>}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-indigo-600">{(profile.audienceSize ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Abonnés</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-indigo-600">{(profile.engagementRate ?? 0).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-indigo-600">{profile.collaborationCount}</p>
                      <p className="text-xs text-gray-500">Collabs</p>
                    </div>
                  </div>
                  {profile.rating && profile.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{profile.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({profile.reviewCount} avis)</span>
                    </div>
                  )}
                  {Object.keys(profile.socialLinks).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.socialLinks).filter(([, v]) => v).map(([k, v]) => (
                        <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                          {k} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Aucun profil créateur</h3>
                <p className="text-gray-500 text-sm mb-4">Créez votre profil pour commencer à postuler à des campagnes</p>
                <Button onClick={() => { setEditingProfile(true); setProfileForm({ bio: '', niche: '', audienceSize: 0, engagementRate: 0, portfolio: '', socialLinks: {} }); }}>Créer mon profil</Button>
              </Card>
            )}
          </TabsContent>

          {/* ── Campaigns Tab ── */}
          <TabsContent value="campaigns" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Campagnes ouvertes</h2>
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
            {openCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune campagne disponible pour le moment</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {openCampaigns.map(c => (
                  <Card key={c.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{c.title}</h3>
                          <p className="text-sm text-gray-500">{c.organizer?.name} · Budget: {c.budget.toLocaleString()} {c.currency}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                          <div className="flex gap-2 mt-2">
                            {c.niche && <Badge variant="outline">{c.niche}</Badge>}
                            {c.minAudience && <Badge variant="outline">Min {c.minAudience.toLocaleString()} abonnés</Badge>}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleApply(c.id)}>Postuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Applications Tab ── */}
          <TabsContent value="applications" className="space-y-6 mt-6">
            <h2 className="text-xl font-bold">Mes candidatures</h2>
            {applications.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-gray-500">Aucune candidature pour le moment</p></Card>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <Card key={app.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{app.campaign?.title}</p>
                        <p className="text-xs text-gray-500">{app.message ? 'Message inclus' : 'Sans message'}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Collaborations Tab ── */}
          <TabsContent value="collabs" className="space-y-6 mt-6">
            <h2 className="text-xl font-bold">Mes collaborations</h2>
            {collabs.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-gray-500">Aucune collaboration pour le moment</p></Card>
            ) : (
              <div className="space-y-3">
                {collabs.map(collab => (
                  <Card key={collab.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{collab.campaign?.title}</p>
                          <p className="text-sm text-gray-500">Avec {collab.organizer?.name} · {collab.agreedFee.toLocaleString()} {collab.currency}</p>
                        </div>
                        <StatusBadge status={collab.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Apply modal */}
      <Dialog open={!!applyingTo} onOpenChange={open => !open && setApplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postuler à la campagne</DialogTitle>
            <DialogDescription>Ajoutez un message à votre candidature (optionnel)</DialogDescription>
          </DialogHeader>
          <Textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)} placeholder="Pourquoi êtes-vous la personne idéale pour cette campagne ?" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyingTo(null)}>Annuler</Button>
            <Button onClick={() => applyingTo && handleApply(applyingTo)} className="bg-indigo-600 hover:bg-indigo-700">Envoyer ma candidature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Acceptée', cls: 'bg-green-100 text-green-800' },
    rejected: { label: 'Refusée', cls: 'bg-red-100 text-red-800' },
    open: { label: 'Ouverte', cls: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En cours', cls: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Terminée', cls: 'bg-gray-100 text-gray-800' },
    negotiating: { label: 'Négociation', cls: 'bg-orange-100 text-orange-800' },
    active: { label: 'Active', cls: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Livré', cls: 'bg-teal-100 text-teal-800' },
    paid: { label: 'Payé', cls: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-800' },
    withdrawn: { label: 'Retirée', cls: 'bg-gray-100 text-gray-800' },
  };
  const info = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.cls}`}>{info.label}</span>;
}
