import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  User,
  Mail,
  Phone,
  Lock,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Shield
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function UserProfilePage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // ── Onglet actif ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'danger'>('info');

  // ── Formulaire infos ──────────────────────────────────────────────────
  const nameParts = (user?.name || '').trim().split(' ');
  const [profileForm, setProfileForm] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Formulaire mot de passe ───────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  // ── Suppression de compte ─────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim()) {
      toast.error('Le prénom est obligatoire');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        name: `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim(),
        phone: profileForm.phone || undefined,
      });
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Mot de passe modifié avec succès');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mot de passe actuel incorrect');
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Tapez "SUPPRIMER" pour confirmer');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      await logout();
      navigate('/');
      toast.success('Compte supprimé');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const roleLabel = {
    user: 'Utilisateur',
    organizer: 'Organisateur',
    controller: 'Contrôleur',
  }[user.role];

  const tabs = [
    { key: 'info' as const, label: 'Informations', icon: User },
    { key: 'security' as const, label: 'Sécurité', icon: Shield },
    { key: 'danger' as const, label: 'Compte', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Mon profil</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Avatar & résumé */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
                <p className="text-gray-500 text-sm truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
                  {user.phone && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Onglet Informations ─────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Input value={user.email} disabled className="bg-gray-50 text-gray-500" />
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <p className="text-xs text-gray-400">L'email ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+242 06 XXX XX XX"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {savingProfile ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Enregistrement...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Onglet Sécurité ─────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-5 h-5" />
                Changer le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mot de passe actuel */}
              <div className="space-y-2">
                <Label htmlFor="currentPw">Mot de passe actuel *</Label>
                <div className="relative">
                  <Input
                    id="currentPw"
                    type={showPw.current ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Separator />

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="newPw">Nouveau mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="newPw"
                    type={showPw.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 8 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwForm.newPassword && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < Math.min(4, Math.floor(pwForm.newPassword.length / 3))
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPw">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="confirmPw"
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwForm.confirmPassword && pwForm.newPassword && (
                  <p className={`text-xs ${pwForm.newPassword === pwForm.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {pwForm.newPassword === pwForm.confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={savingPw}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {savingPw ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Modification...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Modifier le mot de passe
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Onglet Compte (danger zone) ────────────────────────────────── */}
        {activeTab === 'danger' && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-red-600">
                <Trash2 className="w-5 h-5" />
                Supprimer mon compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium mb-1">⚠ Cette action est irréversible</p>
                <p className="text-sm text-red-600">
                  La suppression de votre compte effacera définitivement toutes vos données :
                  billets, historique d'achats, points de fidélité, favoris.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deletePassword">Mot de passe pour confirmer *</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer *
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'SUPPRIMER' || !deletePassword}
                variant="destructive"
                className="w-full"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Suppression...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement mon compte
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
