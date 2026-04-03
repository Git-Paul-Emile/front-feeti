import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from "../../imports/svg-wlelb3n4ow";
import imgImage7 from "figma:asset/f40f6ee4358ef1906247ba6b8ed47d57619337b1.png";
import { imgGroup, imgGroup1 } from "../../imports/svg-g8yi2";
import type { RegisterData } from '../../services/api/AuthAPI';
import { ApiError } from '../../services/api/AuthAPI';
import { CategoryTab, getCategoryIcon } from '../CategorySelector';

const EVENT_CATEGORIES = [
  { slug: 'musique',     label: 'Musique' },
  { slug: 'concert',     label: 'Concert' },
  { slug: 'festival',    label: 'Festival' },
  { slug: 'jazz',        label: 'Jazz' },
  { slug: 'theatre',     label: 'Théâtre' },
  { slug: 'art-culture', label: 'Art & Culture' },
  { slug: 'danse',       label: 'Danse' },
  { slug: 'cinema',      label: 'Cinéma' },
  { slug: 'sport',       label: 'Sport' },
  { slug: 'competition', label: 'Compétition' },
  { slug: 'conference',  label: 'Conférence' },
  { slug: 'formation',   label: 'Formation' },
  { slug: 'tech',        label: 'Tech' },
  { slug: 'gastronomie', label: 'Gastronomie' },
  { slug: 'humour',      label: 'Humour' },
  { slug: 'soiree',      label: 'Soirée' },
  { slug: 'culte',       label: 'Culte' },
  { slug: 'autre',       label: 'Autre' },
];

export interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister?: (data: RegisterData) => Promise<void>;
  onBack?: () => void;
}

// ── Champs du formulaire ─────────────────────────────────────────────────────
interface LoginFields {
  email: string;
  password: string;
}

interface RegisterFields {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'organizer';
}

// ── Drapeau Congo (inchangé) ─────────────────────────────────────────────────
function DrapeauCongo() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Drapeau congo">
      <div className="absolute contents inset-[-0.5%_-0.5%_-0.51%_-0.5%]">
        <div className="absolute contents inset-[-0.5%_-0.5%_-0.51%_-0.5%]">
          <div className="absolute contents inset-[-0.5%_-0.5%_-0.51%_-0.5%]">
            <div className="absolute contents inset-[-0.5%_-0.5%_-0.51%_-0.5%]">
              <div className="absolute inset-[6.255%] mix-blend-multiply">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
                  <g style={{ mixBlendMode: "multiply" }}>
                    <path d={svgPaths.pbfb4f00} fill="black" />
                  </g>
                </svg>
              </div>
              <div className="absolute flex inset-[-0.48%_-0.48%_-0.49%_-0.48%] items-center justify-center">
                <div className="flex-none rotate-[359.44deg] size-[23.999px]">
                  <div className="relative size-full">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPaths.p7b78900} fill="url(#paint0_radial_89_491)" />
                      <defs>
                        <radialGradient cx="0" cy="0" gradientTransform="translate(8.95411 6.69884) rotate(0.56) scale(13.5406 13.5406)" gradientUnits="userSpaceOnUse" id="paint0_radial_89_491" r="1">
                          <stop stopColor="#F2F2F2" />
                          <stop offset="1" stopColor="#D6D6D6" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="absolute contents inset-[-0.5%_-0.5%_-0.51%_-0.5%]">
                <div className="absolute contents inset-[-1.87%_-17.93%_-8.73%_-27.15%]">
                  <div className="absolute inset-[-1.87%_-12.1%_-8.73%_-8.87%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.007px_0.329px] mask-size-[24.241px_24.241px]" style={{ maskImage: `url('${imgGroup}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 27">
                      <g>
                        <path d={svgPaths.p33924880} fill="#FF0000" />
                        <path d={svgPaths.p3c5310f0} fill="#FF0000" />
                        <path d={svgPaths.pf6d70f0} fill="#009543" />
                      </g>
                    </svg>
                  </div>
                  <div className="absolute contents inset-[5.42%_-17.93%_5.77%_-27.15%]">
                    <div className="absolute inset-[-14.34%_-17.86%_-13.7%_-25.05%] mask-position-[5.891px,_-0.504px_3.322px,_4.742px] mask-size-[24.241px_24.241px,_34.819px_21.314px]" style={{ maskImage: `url('${imgGroup}'), url('${imgGroup1}')` }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 31">
                        <g>
                          <path d={svgPaths.pfe1eb00} fill="#FBDE4A" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Composant champ avec message d'erreur ────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[13px] text-red-400 font-['Inter',_sans-serif] pl-1">
      {message}
    </p>
  );
}

// ── Champ mot de passe avec œil ─────────────────────────────────────────────
function PasswordInput({
  hasError,
  placeholder,
  autoComplete,
  registration,
}: {
  hasError: boolean;
  placeholder: string;
  autoComplete: string;
  registration: object;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`box-border border rounded-[12px] px-[20px] py-[12px] h-[62px] flex items-center gap-2 bg-transparent transition-colors duration-200 ${
      hasError
        ? 'border-red-400 hover:border-red-300'
        : 'border-[rgba(192,169,237,0.8)] hover:border-[rgba(192,169,237,1)]'
    }`}>
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',_sans-serif]"
        {...registration}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-[#adb3bc] hover:text-white transition-colors flex-shrink-0"
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `box-border border rounded-[12px] px-[20px] py-[12px] h-[62px] flex items-center bg-transparent transition-colors duration-200 ${
    hasError
      ? 'border-red-400 hover:border-red-300'
      : 'border-[rgba(192,169,237,0.8)] hover:border-[rgba(192,169,237,1)]'
  }`;
}

// ── Formulaire de connexion ──────────────────────────────────────────────────
function LoginForm({ onLogin, onSwitchToRegister }: {
  onLogin: LoginPageProps['onLogin'];
  onSwitchToRegister: () => void;
}) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ mode: 'onBlur' });

  const onSubmit = async (data: LoginFields) => {
    setServerError('');
    try {
      await onLogin(data.email, data.password);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([field, msg]) => {
          setError(field as keyof LoginFields, { message: msg });
        });
      } else {
        setServerError(err instanceof Error ? err.message : 'Erreur de connexion');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-10" noValidate>
      {/* Email */}
      <div>
        <div className={inputClass(!!errors.email)}>
          <input
            type="email"
            placeholder="Votre email"
            autoComplete="email"
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',_sans-serif]"
            {...register('email', {
              required: "L'email est requis",
              validate: (v) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Adresse email invalide',
            })}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Mot de passe */}
      <div>
        <PasswordInput
          hasError={!!errors.password}
          placeholder="Votre mot de passe"
          autoComplete="current-password"
          registration={register('password', {
            required: 'Le mot de passe est requis',
          })}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Erreur serveur globale */}
      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',_sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2">
          {serverError}
        </p>
      )}

      {/* Bouton soumettre */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <span className="text-black text-[18px] font-semibold tracking-[-0.72px] font-['Inter',_sans-serif] group-hover:scale-105 transition-transform">
            Se connecter
          </span>
        )}
      </button>

      {/* Ou */}
      <div className="flex items-center justify-center py-2">
        <span className="text-white text-[14px] font-medium font-['Poppins',_sans-serif]">ou</span>
      </div>

      {/* Bouton Google (UI uniquement) */}
      <button
        type="button"
        disabled={isSubmitting}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center gap-[10px] hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-[28px] h-[28px] bg-center bg-cover bg-no-repeat group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('${imgImage7}')` }} />
        <span className="text-black text-[14px] text-center font-['Poppins',_sans-serif]">
          Se connecter avec Google
        </span>
      </button>

      <div className="text-center pt-2">
        <p className="text-white text-[14px] font-medium">
          Pas de compte ?{' '}
          <button type="button" onClick={onSwitchToRegister} className="text-[#0487ff] underline hover:text-[#0670d4] transition-colors">
            Inscription
          </button>
        </p>
      </div>
    </form>
  );
}

// ── Sélection des centres d'intérêts ────────────────────────────────────────
function InterestsStep({
  selected,
  onToggle,
  onBack,
  onSubmit,
  isSubmitting,
  serverError,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  serverError: string;
}) {
  return (
    <div className="mt-6">
      <p className="text-white/70 text-[14px] font-['Inter',_sans-serif] mb-4">
        Choisis tes centres d'intérêts pour voir les événements qui te correspondent
        <span className="text-white/40 ml-1">(optionnel)</span>
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {EVENT_CATEGORIES.map((cat) => (
          <CategoryTab
            key={cat.slug}
            icon={getCategoryIcon(cat.slug)}
            label={cat.label}
            isSelected={selected.includes(cat.slug)}
            onClick={() => onToggle(cat.slug)}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <p className="text-[#c0a9ed] text-[13px] font-['Inter',_sans-serif] mb-4">
          {selected.length} centre{selected.length > 1 ? 's' : ''} d'intérêt{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
        </p>
      )}

      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',_sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2 mb-4">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 border border-[rgba(192,169,237,0.5)] text-white/70 rounded-[12px] h-[62px] flex items-center justify-center hover:border-[rgba(192,169,237,0.8)] hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          <span className="text-[16px] font-['Inter',_sans-serif]">← Retour</span>
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-[#f4f6f4] rounded-[12px] h-[62px] flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <span className="text-black text-[17px] font-semibold font-['Inter',_sans-serif] group-hover:scale-105 transition-transform">
              S'inscrire
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Formulaire d'inscription ─────────────────────────────────────────────────
function RegisterForm({ onRegister, onSwitchToLogin }: {
  onRegister?: LoginPageProps['onRegister'];
  onSwitchToLogin: () => void;
}) {
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    getValues,
    formState: { errors },
  } = useForm<RegisterFields>({ mode: 'onBlur' });

  const roleValue = watch('role');
  const passwordValue = watch('password');

  const toggleInterest = (slug: string) => {
    setSelectedInterests(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Étape 1 : valider le formulaire et passer à l'étape 2 (intérêts) si role=user
  const handleStep1Submit = async (data: RegisterFields) => {
    if (data.role === 'user') {
      // Passer à l'étape 2 pour choisir les intérêts
      setStep(2);
    } else {
      // Organisateur : inscription directe sans intérêts
      await submitRegistration(data, []);
    }
  };

  const submitRegistration = async (data: RegisterFields, interests: string[]) => {
    setServerError('');
    if (!onRegister) return;
    setIsSubmitting(true);
    try {
      await onRegister({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role: data.role,
        interests: interests.length > 0 ? interests : undefined,
      });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([field, msg]) => {
          setError(field as keyof RegisterFields, { message: msg });
        });
        setStep(1);
      } else {
        setServerError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterestsSubmit = async () => {
    const data = getValues();
    await submitRegistration(data, selectedInterests);
  };

  if (step === 2) {
    return (
      <div className="mt-10">
        <InterestsStep
          selected={selectedInterests}
          onToggle={toggleInterest}
          onBack={() => setStep(1)}
          onSubmit={handleInterestsSubmit}
          isSubmitting={isSubmitting}
          serverError={serverError}
        />
        <div className="text-center pt-4">
          <p className="text-white text-[14px] font-medium">
            Déjà un compte ?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-[#0487ff] underline hover:text-[#0670d4] transition-colors">
              Connexion
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-4 mt-10" noValidate>
      {/* Nom complet */}
      <div>
        <div className={inputClass(!!errors.name)}>
          <input
            type="text"
            placeholder="Prénom(s) et nom"
            autoComplete="name"
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',_sans-serif]"
            {...register('name', {
              required: 'Le nom est requis',
              minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              maxLength: { value: 50, message: 'Le nom ne peut pas dépasser 50 caractères' },
            })}
          />
        </div>
        <FieldError message={errors.name?.message} />
      </div>

      {/* Email */}
      <div>
        <div className={inputClass(!!errors.email)}>
          <input
            type="email"
            placeholder="Votre email"
            autoComplete="email"
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',_sans-serif]"
            {...register('email', {
              required: "L'email est requis",
              validate: (v) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Adresse email invalide',
            })}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Téléphone */}
      <div>
        <div className={inputClass(!!errors.phone)}>
          <DrapeauCongo />
          <span className="text-[#adb3bc] text-[18.35px] font-medium tracking-[-0.734px] font-['Inter',_sans-serif] ml-2">+242</span>
          <div className="h-[34px] w-[1px] bg-[#C0A9ED] opacity-50 mx-2" />
          <input
            type="tel"
            placeholder="Ton numéro de téléphone"
            autoComplete="tel"
            className="flex-1 bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',_sans-serif]"
            {...register('phone', {
              validate: (v) => {
                if (!v) return true;
                return /^[0-9]{8,9}$/.test(v) || 'Numéro invalide (8-9 chiffres sans indicatif)';
              },
            })}
          />
        </div>
        <FieldError message={errors.phone?.message} />
      </div>

      {/* Mot de passe */}
      <div>
        <PasswordInput
          hasError={!!errors.password}
          placeholder="Mot de passe"
          autoComplete="new-password"
          registration={register('password', {
            required: 'Le mot de passe est requis',
            minLength: { value: 8, message: 'Minimum 8 caractères' },
            validate: {
              hasUpper: (v) => /[A-Z]/.test(v) || 'Doit contenir au moins une majuscule',
              hasNumber: (v) => /[0-9]/.test(v) || 'Doit contenir au moins un chiffre',
            },
          })}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Confirmer mot de passe */}
      <div>
        <PasswordInput
          hasError={!!errors.confirmPassword}
          placeholder="Confirmer le mot de passe"
          autoComplete="new-password"
          registration={register('confirmPassword', {
            required: 'Veuillez confirmer le mot de passe',
            validate: (v) => v === passwordValue || 'Les mots de passe ne correspondent pas',
          })}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      {/* Rôle */}
      <div>
        <p className="text-white/70 text-[14px] font-['Inter',_sans-serif] mb-2">Je suis :</p>
        <div className="flex gap-3">
          {(['user', 'organizer'] as const).map((r) => {
            const isSelected = roleValue === r;
            return (
              <label
                key={r}
                className={`flex-1 flex items-center justify-center gap-2 rounded-[12px] px-4 py-3 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[#c0a9ed] bg-[#c0a9ed]/20 text-white font-semibold'
                    : 'border border-[rgba(192,169,237,0.4)] text-white/60 hover:border-[rgba(192,169,237,0.7)] hover:text-white/80'
                }`}
              >
                <input
                  type="radio"
                  value={r}
                  className="sr-only"
                  {...register('role', { required: 'Veuillez sélectionner un rôle' })}
                />
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isSelected ? 'border-[#c0a9ed] bg-[#c0a9ed]' : 'border-white/40'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0e0434]" />}
                </span>
                <span className="text-[15px] font-['Inter',_sans-serif]">
                  {r === 'user' ? 'Participant' : 'Organisateur'}
                </span>
              </label>
            );
          })}
        </div>
        <FieldError message={errors.role?.message} />
      </div>

      {/* Erreur serveur globale */}
      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',_sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2">
          {serverError}
        </p>
      )}

      {/* Bouton soumettre */}
      <button
        type="submit"
        disabled={!onRegister}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-black text-[18px] font-semibold tracking-[-0.72px] font-['Inter',_sans-serif] group-hover:scale-105 transition-transform">
          {roleValue === 'user' ? 'Suivant →' : "S'inscrire"}
        </span>
      </button>

      <div className="text-center pt-2">
        <p className="text-white text-[14px] font-medium">
          Déjà un compte ?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-[#0487ff] underline hover:text-[#0670d4] transition-colors">
            Connexion
          </button>
        </p>
      </div>
    </form>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export function LoginPage({ onLogin, onRegister, onBack }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="bg-[#0e0434] relative size-full min-h-screen" data-name="Login">
      <div className="flex flex-row items-center justify-center relative size-full min-h-screen px-4">
        <div className="box-border content-stretch flex gap-[10px] items-center px-[36px] py-[33px] relative w-full max-w-[430px]">
          <div className="w-full">
            {/* En-tête */}
            <div className="text-center mb-6">
              <h1 className="text-white text-[40px] font-['Inter',_sans-serif] font-bold leading-[1.04] tracking-[-1.6px] mb-3">
                {isLogin ? 'Féeter' : 'Devenir Féeteur(se)'}
              </h1>
              <p className="text-white text-[17.2px] font-['Inter',_sans-serif] leading-[22.933px] tracking-[-0.516px] opacity-80 max-w-[360px] mx-auto">
                {isLogin
                  ? 'Connectez-vous à votre compte Feeti pour accéder à vos billets'
                  : 'Créez votre compte pour découvrir les événements Feeti'}
              </p>
            </div>

            {isLogin ? (
              <LoginForm onLogin={onLogin} onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onRegister={onRegister} onSwitchToLogin={() => setIsLogin(true)} />
            )}

            {onBack && (
              <div className="text-center mt-4">
                <button onClick={onBack} className="text-white/80 text-sm underline hover:text-white transition-colors">
                  ← Retour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
