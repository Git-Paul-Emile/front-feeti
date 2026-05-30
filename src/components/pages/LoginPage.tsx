import { useState, useEffect } from 'react';
import { SEO } from '../SEO';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from "../../imports/svg-wlelb3n4ow";
import imgImage7 from "figma:asset/f40f6ee4358ef1906247ba6b8ed47d57619337b1.png";
import { imgGroup, imgGroup1 } from "../../imports/svg-g8yi2";
import type { RegisterData } from '../../services/api/AuthAPI';
import { ApiError } from '../../services/api/AuthAPI';
import { firebaseClientErrorToUserMessage } from '../../utils/firebaseUserFacingError';
import { resetPassword } from '../../services/firebase-auth';
import { CategoryTab, getCategoryIcon } from '../CategorySelector';
import CountryAPI, { type Country } from '../../services/api/CountryAPI';

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo', 'Madingou', 'Owando', 'Sibiti', 'Mossendjo'],
  'République du Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo', 'Madingou', 'Owando', 'Sibiti', 'Mossendjo'],
  'RDC': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Goma', 'Bukavu', 'Bunia', 'Matadi', 'Kolwezi'],
  'République Démocratique du Congo': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Goma', 'Bukavu', 'Bunia', 'Matadi', 'Kolwezi'],
  'Cameroun': ['Yaoundé', 'Douala', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Nkongsamba', 'Ngaoundéré', 'Bertoua'],
  'Gabon': ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné', 'Tchibanga'],
  "Côte d'Ivoire": ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Divo', 'Man', 'Gagnoa', 'Korhogo'],
  'Sénégal': ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Diourbel', 'Tambacounda'],
  'Mali': ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Kayes', 'Gao', 'Koutiala', 'Kidal'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya', 'Kaya'],
  'Niger': ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Dosso', 'Tahoua', 'Diffa'],
  'Tchad': ["N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Bongor'],
  'Centrafrique': ['Bangui', 'Bimbo', 'Carnot', 'Bambari', 'Bangassou', 'Berberati'],
  'Togo': ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Bassar', 'Tsévié'],
  'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Natitingou', 'Bohicon'],
  'Guinée': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Boké'],
  'Guinée Équatoriale': ['Malabo', 'Bata', 'Ebebiyín', 'Aconibe', 'Evinayong'],
  'Angola': ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  'Belgique': ['Bruxelles', 'Anvers', 'Gand', 'Liège', 'Bruges', 'Namur'],
};

const DIAL_CODES_BY_COUNTRY: Record<string, string> = {
  'Congo': '+242',
  'République du Congo': '+242',
  'RDC': '+243',
  'République Démocratique du Congo': '+243',
  'Cameroun': '+237',
  'Gabon': '+241',
  "Côte d'Ivoire": '+225',
  'Sénégal': '+221',
  'Mali': '+223',
  'Burkina Faso': '+226',
  'Niger': '+227',
  'Tchad': '+235',
  'Centrafrique': '+236',
  'Togo': '+228',
  'Bénin': '+229',
  'Guinée': '+224',
  'Guinée Équatoriale': '+240',
  'Angola': '+244',
  'France': '+33',
  'Belgique': '+32',
};

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
  onGoogleLogin?: () => Promise<void>;
  onGoogleRegister?: () => Promise<void>;
  onForgotPassword?: () => void;
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
  role: 'user' | 'organizer' | 'establishment_owner';
  country: string;
  city: string;
  acceptTerms: boolean;
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
                  <div className="absolute inset-[-1.87%_-12.1%_-8.73%_-8.87%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-[2.007px_0.329px] mask-size-[24.241px_24.241px]" style={{ maskImage: `url('${imgGroup}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 27">
                      <g>
                        <path d={svgPaths.p33924880} fill="#FF0000" />
                        <path d={svgPaths.p3c5310f0} fill="#FF0000" />
                        <path d={svgPaths.pf6d70f0} fill="#009543" />
                      </g>
                    </svg>
                  </div>
                  <div className="absolute contents inset-[5.42%_-17.93%_5.77%_-27.15%]">
                    <div className="absolute inset-[-14.34%_-17.86%_-13.7%_-25.05%] mask-position-[5.891px,-0.504px_3.322px,4.742px] mask-[24.241px_24.241px,34.819px_21.314px]" style={{ maskImage: `url('${imgGroup}'), url('${imgGroup1}')` }}>
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
    <p className="mt-1 text-[13px] text-red-400 font-['Inter',sans-serif] pl-1">
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
        className="flex-1 bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
        {...registration}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-[#adb3bc] hover:text-white transition-colors shrink-0"
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
function LoginForm({ onLogin, onGoogleLogin, onSwitchToRegister, onForgotPassword }: {
  onLogin: LoginPageProps['onLogin'];
  onGoogleLogin?: LoginPageProps['onGoogleLogin'];
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
}) {
  const [serverError, setServerError] = useState('');
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]   = useState('');
  const [forgotDone, setForgotDone]     = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ mode: 'onBlur' });

  const handleSendReset = async () => {
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotError('');
    const result = await resetPassword(forgotEmail.trim());
    setForgotLoading(false);
    if (result.success) {
      setForgotDone(true);
    } else {
      setForgotError(result.error ?? "Erreur lors de l'envoi de l'email");
    }
  };

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
        setServerError(firebaseClientErrorToUserMessage(err, 'Erreur de connexion'));
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
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
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
        <div className="text-right mt-1">
          <button
            type="button"
            onClick={() => { setShowForgot(true); setForgotDone(false); setForgotEmail(''); setForgotError(''); onForgotPassword?.(); }}
            className="text-white/70 text-[13px] font-['Inter',sans-serif] hover:text-white transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </div>

      {/* Erreur serveur globale */}
      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2">
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
          <span className="text-black text-[18px] font-semibold tracking-[-0.72px] font-['Inter',sans-serif] group-hover:scale-105 transition-transform">
            Se connecter
          </span>
        )}
      </button>

      {/* Ou */}
      <div className="flex items-center justify-center py-2">
        <span className="text-white text-[14px] font-medium font-['Poppins',sans-serif]">ou</span>
      </div>

      {/* Bouton Google (UI uniquement) */}
      <button
        type="button"
        onClick={() => void onGoogleLogin?.()}
        disabled={isSubmitting}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center gap-[10px] hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-[28px] h-[28px] bg-center bg-cover bg-no-repeat group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('${imgImage7}')` }} />
        <span className="text-black text-[14px] text-center font-['Poppins',sans-serif]">
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

      {/* Modal mot de passe oublié */}
      {showForgot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowForgot(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-gray-900 font-semibold text-lg mb-1">Mot de passe oublié</h3>
            {forgotDone ? (
              <>
                <p className="text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm mt-3">
                  Un email de réinitialisation a été envoyé à <strong>{forgotEmail}</strong>. Vérifiez votre boîte mail (et les spams).
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-full mt-4 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-4 mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  onKeyDown={e => e.key === 'Enter' && void handleSendReset()}
                  autoFocus
                />
                {forgotError && <p className="text-red-500 text-xs mb-3">{forgotError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSendReset()}
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Envoi…' : 'Envoyer le lien'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
      <p className="text-white/70 text-[14px] font-['Inter',sans-serif] mb-4">
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
        <p className="text-[#c0a9ed] text-[13px] font-['Inter',sans-serif] mb-4">
          {selected.length} centre{selected.length > 1 ? 's' : ''} d'intérêt{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
        </p>
      )}

      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2 mb-4">
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
          <span className="text-[16px] font-['Inter',sans-serif]">← Retour</span>
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
            <span className="text-black text-[17px] font-semibold font-['Inter',sans-serif] group-hover:scale-105 transition-transform">
              S'inscrire
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Formulaire d'inscription ─────────────────────────────────────────────────
function RegisterForm({ onRegister, onSwitchToLogin, onGoogleRegister }: {
  onRegister?: LoginPageProps['onRegister'];
  onGoogleRegister?: LoginPageProps['onGoogleRegister'];
  onSwitchToLogin: () => void;
}) {
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    CountryAPI.getAll().then(data => setCountries(data.filter(c => c.isActive))).catch(() => {});
  }, []);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterFields>({ mode: 'onBlur' });

  const roleValue = watch('role');
  const passwordValue = watch('password');
  const countryValue = watch('country');
  const availableCities = CITIES_BY_COUNTRY[countryValue] ?? [];
  const selectedCountry = countries.find(c => c.name === countryValue);
  const dialCode = DIAL_CODES_BY_COUNTRY[countryValue] ?? '';

  useEffect(() => {
    setValue('city', '');
  }, [countryValue, setValue]);

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
      // Organisateur / Propriétaire établissement : inscription directe sans intérêts
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
        country: data.country,
        city: data.city,
      });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([field, msg]) => {
          setError(field as keyof RegisterFields, { message: msg });
        });
        setStep(1);
      } else {
        setServerError(firebaseClientErrorToUserMessage(err, "Erreur lors de l'inscription"));
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
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
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
            className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
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
          {selectedCountry ? (
            <>
              <span className="text-[22px] leading-none">{selectedCountry.flag}</span>
              <span className="text-[#adb3bc] text-[18.35px] font-medium tracking-[-0.734px] font-['Inter',sans-serif] ml-2">
                {dialCode || ''}
              </span>
            </>
          ) : (
            <>
              <DrapeauCongo />
              <span className="text-[#adb3bc] text-[18.35px] font-medium tracking-[-0.734px] font-['Inter',sans-serif] ml-2">+242</span>
            </>
          )}
          <div className="h-[34px] w-px bg-[#C0A9ED] opacity-50 mx-2" />
          <input
            type="tel"
            placeholder="Ton numéro de téléphone"
            autoComplete="tel"
            className="flex-1 bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
            {...register('phone', {
              validate: (v) => {
                if (!v) return true;
                return /^[0-9]{6,15}$/.test(v) || 'Numéro invalide (chiffres uniquement, sans indicatif)';
              },
            })}
          />
        </div>
        <FieldError message={errors.phone?.message} />
      </div>

      {/* Pays */}
      <div>
        <div className={inputClass(!!errors.country)}>
          <select
            className="w-full bg-transparent text-white text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
            style={{ colorScheme: 'dark' }}
            {...register('country', { required: 'Le pays est requis' })}
            defaultValue=""
          >
            <option value="" disabled style={{ background: '#1e1b4b', color: '#adb3bc' }}>Votre pays</option>
            {countries.map(c => (
              <option key={c.code} value={c.name} style={{ background: '#1e1b4b', color: '#ffffff' }}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <FieldError message={errors.country?.message} />
      </div>

      {/* Ville */}
      <div>
        <div className={inputClass(!!errors.city)}>
          {availableCities.length > 0 ? (
            <select
              className="w-full bg-transparent text-white text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
              style={{ colorScheme: 'dark' }}
              {...register('city', { required: 'La ville est requise' })}
              defaultValue=""
            >
              <option value="" disabled style={{ background: '#1e1b4b', color: '#adb3bc' }}>Votre ville</option>
              {availableCities.map(city => (
                <option key={city} value={city} style={{ background: '#1e1b4b', color: '#ffffff' }}>{city}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Votre ville"
              autoComplete="address-level2"
              className="w-full bg-transparent text-white placeholder:text-[#adb3bc] text-[18px] tracking-[-0.72px] border-none outline-none font-['Inter',sans-serif]"
              {...register('city', {
                required: 'La ville est requise',
                minLength: { value: 2, message: 'Minimum 2 caractères' },
              })}
            />
          )}
        </div>
        <FieldError message={errors.city?.message} />
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
        <p className="text-white/70 text-[14px] font-['Inter',sans-serif] mb-2">Je suis :</p>
        <div className="flex gap-3">
          {(['user', 'organizer', 'establishment_owner'] as const).map((r) => {
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
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isSelected ? 'border-[#c0a9ed] bg-[#c0a9ed]' : 'border-white/40'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0e0434]" />}
                </span>
                <span className="text-[15px] font-['Inter',sans-serif]">
                  {r === 'user' ? 'Participant' : r === 'organizer' ? 'Organisateur' : 'Propriétaire établ.'}
                </span>
              </label>
            );
          })}
        </div>
        <FieldError message={errors.role?.message} />
      </div>

      {/* Conditions d'utilisation */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-[rgba(192,169,237,0.5)] bg-transparent accent-[#c0a9ed] cursor-pointer shrink-0"
            {...register('acceptTerms', {
              required: "Vous devez accepter les conditions d'utilisation",
            })}
          />
          <span className="text-white/70 text-[13px] font-['Inter',sans-serif] leading-snug">
            J'accepte les{' '}
            <button type="button" className="text-[#c0a9ed] underline hover:text-white transition-colors">
              Conditions d'utilisation
            </button>{' '}
            et la{' '}
            <button type="button" className="text-[#c0a9ed] underline hover:text-white transition-colors">
              Politique de confidentialité
            </button>{' '}
            de Feeti
          </span>
        </label>
        <FieldError message={errors.acceptTerms?.message} />
      </div>

      {/* Erreur serveur globale */}
      {serverError && (
        <p className="text-red-400 text-[14px] font-['Inter',sans-serif] text-center bg-red-400/10 rounded-lg px-4 py-2">
          {serverError}
        </p>
      )}

      {/* Bouton soumettre */}
      <button
        type="submit"
        disabled={!onRegister}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-black text-[18px] font-semibold tracking-[-0.72px] font-['Inter',sans-serif] group-hover:scale-105 transition-transform">
          {roleValue === 'user' ? 'Suivant →' : "S'inscrire"}
        </span>
      </button>

      <div className="flex items-center justify-center py-1">
        <span className="text-white text-[14px] font-medium font-['Poppins',sans-serif]">ou</span>
      </div>

      <button
        type="button"
        onClick={() => void onGoogleRegister?.()}
        disabled={isSubmitting}
        className="w-full bg-[#f4f6f4] rounded-[12px] px-[10px] py-[20px] h-[62px] flex items-center justify-center gap-[10px] hover:bg-white hover:shadow-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-[28px] h-[28px] bg-center bg-cover bg-no-repeat group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('${imgImage7}')` }} />
        <span className="text-black text-[14px] text-center font-['Poppins',sans-serif]">
          S'inscrire avec Google
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
export function LoginPage({ onLogin, onRegister, onGoogleLogin, onGoogleRegister, onForgotPassword, onBack }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="bg-[#0e0434] relative size-full min-h-screen" data-name="Login">
      <SEO
        title="Connexion & Inscription"
        description="Connectez-vous ou créez votre compte Feeti pour accéder à la billetterie, au streaming live et aux loisirs en Afrique."
        url="https://feeti.io/login"
        keywords="connexion feeti, inscription, compte feeti, login"
      />
      <div className="flex flex-row items-center justify-center relative size-full min-h-screen px-4">
        <div className="box-border content-stretch flex gap-[10px] items-center px-[36px] py-[33px] relative w-full max-w-[430px]">
          <div className="w-full">
            {/* En-tête */}
            <div className="text-center mb-6">
              <h1 className="text-white text-[40px] font-['Inter',sans-serif] font-bold leading-[1.04] tracking-[-1.6px] mb-3">
                {isLogin ? 'Fééter' : 'Devenir Fééteur(se)'}
              </h1>
              <p className="text-white text-[17.2px] font-['Inter',sans-serif] leading-[22.933px] tracking-[-0.516px] opacity-80 max-w-[360px] mx-auto">
                {isLogin
                  ? 'Connectez-vous à votre compte Feeti pour accéder à vos billets'
                  : 'Créez votre compte pour découvrir les événements Feeti'}
              </p>
            </div>

            {isLogin ? (
              <LoginForm onLogin={onLogin} onGoogleLogin={onGoogleLogin} onSwitchToRegister={() => setIsLogin(false)} onForgotPassword={onForgotPassword} />
            ) : (
              <RegisterForm onRegister={onRegister} onGoogleRegister={onGoogleRegister} onSwitchToLogin={() => setIsLogin(true)} />
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
