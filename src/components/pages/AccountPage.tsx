import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api/AuthAPI';

// ── Validation frontale ────────────────────────────────────────────────────────

function validateProfile(name: string, email: string, phone: string) {
  const errs: Record<string, string> = {};
  if (name && name.trim().length < 2) errs.name = 'Le nom doit contenir au moins 2 caractères';
  if (name && name.trim().length > 50) errs.name = 'Le nom ne peut pas dépasser 50 caractères';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Adresse email invalide';
  if (phone && phone.trim() && !/^\+?[0-9]{8,15}$/.test(phone.trim())) errs.phone = 'Numéro invalide (8–15 chiffres)';
  return errs;
}

function validatePassword(current: string, next: string, confirm: string) {
  const errs: Record<string, string> = {};
  if (!current) errs.currentPassword = 'Le mot de passe actuel est requis';
  if (!next) { errs.newPassword = 'Le nouveau mot de passe est requis'; }
  else {
    if (next.length < 8) errs.newPassword = 'Au moins 8 caractères';
    else if (!/[A-Z]/.test(next)) errs.newPassword = 'Au moins une majuscule';
    else if (!/[0-9]/.test(next)) errs.newPassword = 'Au moins un chiffre';
  }
  if (!confirm) errs.confirmPassword = 'Confirmation requise';
  else if (next && confirm !== next) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
  return errs;
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Field({
  label, id, type = 'text', value, onChange, error, placeholder, hint,
  suffix,
}: {
  label: string; id: string; type?: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; hint?: string; suffix?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-${isPassword ? '10' : '3'}
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {show ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {suffix && !isPassword && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{suffix}</div>
        )}
      </div>
      <FieldError msg={error} />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export function AccountPage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // --- Profil ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile(profileForm.name, profileForm.email, profileForm.phone);
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name.trim() || undefined,
        email: profileForm.email.trim() || undefined,
        phone: profileForm.phone.trim() || null,
      });
      toast.success('Profil mis à jour');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) setProfileErrors(err.errors);
        else toast.error(err.message);
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Mot de passe ---
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmPassword);
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      toast.success('Mot de passe modifié');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) setPwErrors(err.errors);
        else toast.error(err.message);
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setPwLoading(false);
    }
  };

  // --- Suppression compte ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Le mot de passe est requis'); return; }
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Compte supprimé');
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err.errors?.password ?? err.message);
      } else {
        setDeleteError('Erreur inattendue');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-500"
            aria-label="Retour"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Informations du profil */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Informations personnelles</h2>
          <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
            <Field
              id="name" label="Nom complet"
              value={profileForm.name}
              onChange={(v) => setProfileForm(f => ({ ...f, name: v }))}
              error={profileErrors.name}
              placeholder="Votre nom"
            />
            <Field
              id="email" label="Adresse email" type="email"
              value={profileForm.email}
              onChange={(v) => setProfileForm(f => ({ ...f, email: v }))}
              error={profileErrors.email}
              placeholder="email@exemple.com"
            />
            <Field
              id="phone" label="Téléphone" type="tel"
              value={profileForm.phone}
              onChange={(v) => setProfileForm(f => ({ ...f, phone: v }))}
              error={profileErrors.phone}
              placeholder="+242 06 ..."
              hint="Optionnel — format international recommandé"
            />
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                text-white text-sm font-medium rounded-lg transition"
            >
              {profileLoading ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>

        {/* Accès rapide — Mes billets */}
        <section className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Mes billets</h2>
          <p className="text-sm text-gray-500 mb-4">Consultez tous vos billets achetés et téléchargez-les en PDF.</p>
          <button
            onClick={() => navigate('/tickets')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Voir mes billets
          </button>
        </section>

        {/* Changer le mot de passe */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <Field
              id="currentPassword" label="Mot de passe actuel" type="password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm(f => ({ ...f, currentPassword: v }))}
              error={pwErrors.currentPassword}
              placeholder="••••••••"
            />
            <Field
              id="newPassword" label="Nouveau mot de passe" type="password"
              value={pwForm.newPassword}
              onChange={(v) => setPwForm(f => ({ ...f, newPassword: v }))}
              error={pwErrors.newPassword}
              placeholder="••••••••"
              hint="8 caractères min., 1 majuscule, 1 chiffre"
            />
            <Field
              id="confirmPassword" label="Confirmer le nouveau mot de passe" type="password"
              value={pwForm.confirmPassword}
              onChange={(v) => setPwForm(f => ({ ...f, confirmPassword: v }))}
              error={pwErrors.confirmPassword}
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                text-white text-sm font-medium rounded-lg transition"
            >
              {pwLoading ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </form>
        </section>

        {/* Zone de danger */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Zone de danger</h2>
          <p className="text-sm text-gray-500 mb-4">
            La suppression de votre compte est définitive et irréversible.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium
              rounded-lg hover:bg-red-50 transition"
          >
            Supprimer mon compte
          </button>
        </section>
      </div>

      {/* Modal confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cette action est irréversible. Entrez votre mot de passe pour confirmer.
            </p>
            <div className="mb-4">
              <label htmlFor="del-pw" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="del-pw"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none
                    focus:ring-2 focus:ring-red-400 transition
                    ${deleteError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              <FieldError msg={deleteError} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium
                  rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50
                  text-white text-sm font-medium rounded-lg transition"
              >
                {deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
