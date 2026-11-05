import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, Mail, Users, Phone, MessageCircle, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { useCountry } from '../../context/CountryContext';
import { contactAPI, type ContactReason, type ContactRequest } from '../../services/api/ContactAPI';
import { SEO } from '../SEO';
import './ContactPage.css';

const VERTICALS = [
  'Concerts & festivals',
  'Clubs & soirées',
  'Conférences & salons',
  'Sport',
  'Culture & arts',
  'Événements religieux',
  'Restaurants, bars & loisirs',
  'Autre',
];

const REASONS: { value: ContactReason; label: string }[] = [
  { value: 'ticketing', label: 'Vendre des billets sur Féeti' },
  { value: 'partnership', label: 'Devenir partenaire' },
  { value: 'advertising', label: 'Annonceur / publicité' },
  { value: 'press', label: 'Presse & médias' },
  { value: 'support', label: "Besoin d'aide" },
  { value: 'other', label: 'Autre' },
];

const FAQ = [
  {
    q: 'Comment acheter un billet sur Féeti ?',
    a: "Choisissez votre événement, sélectionnez le type et le nombre de billets puis payez. Votre billet avec QR code arrive par email et reste disponible dans « Mes billets ».",
  },
  {
    q: 'Je n’ai pas reçu mon billet, que faire ?',
    a: "Vérifiez vos spams, puis connectez-vous à votre compte : tous vos billets sont dans « Mes billets ». Si le billet n'y est pas, écrivez-nous avec votre référence de commande.",
  },
  {
    q: 'Comment publier mon événement ?',
    a: "Créez un compte organisateur, remplissez la fiche de votre événement et vos tarifs. Notre équipe valide l'événement avant sa mise en vente.",
  },
  {
    q: 'Puis-je être remboursé ?',
    a: "Un billet non utilisé peut faire l'objet d'une demande de remboursement depuis votre compte. En cas d'annulation par l'organisateur, les acheteurs sont remboursés intégralement.",
  },
  {
    q: 'Comment mettre en avant mon événement ?',
    a: "Depuis votre tableau de bord organisateur, choisissez un pack de mise en avant (OR, ARGENT, BRONZE ou LITE) pour gagner en visibilité sur la plateforme.",
  },
  {
    q: 'Comment fonctionne Feeti Na Feeti ?',
    a: "C'est notre programme de fidélité : chaque achat, participation, partage ou parrainage vous rapporte des points, utilisables en réduction sur vos prochains billets.",
  },
];

const EMPTY: ContactRequest = {
  firstName: '', lastName: '', email: '', phone: '', company: '', vertical: '', country: '',
  ticketsPerYear: '', averagePrice: '', reason: 'ticketing', message: '', website: '',
};

const fieldClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-[#16bda0] focus:outline-none focus:ring-2 focus:ring-[#16bda0]/20';

export function ContactPage() {
  const { countries } = useCountry();
  const [form, setForm] = useState<ContactRequest>(EMPTY);
  const [reasonTouched, setReasonTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof ContactRequest) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await contactAPI.send(form);
      if (res && res.success === false) throw new Error(res.error);
      setSent(true);
      setForm(EMPTY);
      setReasonTouched(false);
    } catch (err: any) {
      toast.error(err?.message || "Impossible d'envoyer votre demande, réessayez.");
    } finally {
      setSending(false);
    }
  };

  const scrollToForm = () => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <SEO title="Nous contacter" description="Contactez l'équipe Féeti : support billetterie, organisateurs, partenariats et presse." />

      {/* Bandeau */}
      <section className="relative overflow-hidden bg-[#03033b] pb-40 pt-[180px] text-center text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <span className="inline-block rounded-full bg-[#16bda0] px-3 py-1 text-xs font-semibold text-[#03033b]">Support</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Comment pouvons-nous <span className="text-[#16bda0]">vous aider ?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Une question sur un billet, un événement à lancer ou un projet de partenariat ? Notre équipe vous répond.
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-28 max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 sm:p-10">
          {/* Cartes d'orientation */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-6">
              <BookOpen className="h-6 w-6 text-[#16bda0]" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Centre d'aide</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Achat de billets, paiement, remboursement, compte : les réponses aux questions les plus fréquentes.
              </p>
              <Link to="/legal/faq" className="mt-4 inline-block text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-[#16bda0]">
                Voir la FAQ
              </Link>
            </div>
            <div className="rounded-2xl bg-gray-50 p-6">
              <Mail className="h-6 w-6 text-[#16bda0]" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Nous écrire</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Organisateur, établissement ou annonceur : décrivez votre projet, nous revenons vers vous rapidement.
              </p>
              <button onClick={scrollToForm} className="mt-4 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-[#16bda0]">
                Remplir le formulaire
              </button>
            </div>
            <div className="rounded-2xl bg-[#03033b] p-6 text-white">
              <Users className="h-6 w-6 text-[#16bda0]" />
              <h2 className="mt-4 text-lg font-semibold">Communauté Féeti</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Actualités, coulisses des événements et bons plans partagés par la communauté des Feeteurs.
              </p>
              <Link to="/blog" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-[#16bda0]">
                Rejoindre la communauté
              </Link>
            </div>
          </div>

          {/* Contacts directs */}
          <div className="mt-8 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-3">
            <a href="mailto:support@feeti.com" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50">
              <Mail className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-sm"><span className="block font-medium text-gray-900">Support billetterie</span><span className="text-gray-600">support@feeti.com</span></span>
            </a>
            <a href="https://wa.me/242981231925" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50">
              <MessageCircle className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-sm"><span className="block font-medium text-gray-900">WhatsApp</span><span className="text-gray-600">+242 981-23-19-25</span></span>
            </a>
            <div className="flex items-center gap-3 rounded-xl p-3">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-sm"><span className="block font-medium text-gray-900">Siège</span><span className="text-gray-600">Plateau, Brazzaville — Congo</span></span>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Questions fréquentes</h2>
              <p className="mt-3 text-gray-600">
                Les réponses aux demandes que nous recevons le plus souvent. Vous ne trouvez pas la vôtre ?{' '}
                <Link to="/legal/faq" className="font-medium text-gray-900 underline underline-offset-4">Toute la FAQ</Link>.
              </p>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`q${i}`} className="rounded-xl border-none bg-gray-50 px-4">
                  <AccordionTrigger className="text-left text-[15px] font-medium text-gray-900 hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-gray-600">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Formulaire */}
        <section id="contact-form" className="mt-10 scroll-mt-24 rounded-3xl bg-[#f4f4f0] lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <div className="py-6 lg:py-16">
            <p className="text-sm font-semibold text-gray-900">Vous organisez des événements à grande échelle ?</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">Parlons de votre projet</h2>
            <p className="mt-4 text-gray-700">
              Pour la billetterie à fort volume, les programmes multi-événements ou un partenariat, notre <strong>équipe commerciale</strong> vous propose une offre et un accompagnement sur mesure.
            </p>
            <p className="mt-6 text-sm italic text-gray-600">
              Une question sur un billet ou votre compte ? Consultez le{' '}
              <Link to="/legal/faq" className="font-semibold not-italic text-gray-900 underline underline-offset-4">centre d'aide</Link>.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-gray-400" /> Organisateurs : <a href="tel:+242981231924" className="font-medium text-gray-900">+242 981-23-19-24</a>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-[#16bda0]" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Merci, votre demande est envoyée</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-600">Notre équipe vous recontacte par email ou par téléphone dans les meilleurs délais.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-gray-900 underline underline-offset-4">
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required placeholder="Prénom*" value={form.firstName} onChange={set('firstName')} className={fieldClass} autoComplete="given-name" />
                  <input required placeholder="Nom*" value={form.lastName} onChange={set('lastName')} className={fieldClass} autoComplete="family-name" />
                  <input required type="email" placeholder="Email professionnel*" value={form.email} onChange={set('email')} className={fieldClass} autoComplete="email" />
                  <input required type="tel" placeholder="Téléphone*" value={form.phone} onChange={set('phone')} className={fieldClass} autoComplete="tel" />
                </div>
                <input required placeholder="Nom de la société*" value={form.company} onChange={set('company')} className={fieldClass} autoComplete="organization" />
                <select required value={form.vertical} onChange={set('vertical')} className={`${fieldClass} ${form.vertical ? '' : 'text-gray-400'}`}>
                  <option value="" disabled>Secteur d'activité*</option>
                  {VERTICALS.map((v) => <option key={v} value={v} className="text-gray-900">{v}</option>)}
                </select>
                <select required value={form.country} onChange={set('country')} className={`${fieldClass} ${form.country ? '' : 'text-gray-400'}`}>
                  <option value="" disabled>Pays*</option>
                  {countries.map((c) => <option key={c.code} value={c.name} className="text-gray-900">{c.name}</option>)}
                  <option value="Autre" className="text-gray-900">Autre</option>
                </select>
                <input inputMode="numeric" placeholder="Combien de billets payants prévoyez-vous de vendre sur un an ? (ex. 2 000)" value={form.ticketsPerYear} onChange={set('ticketsPerYear')} className={fieldClass} />
                <input placeholder="Prix moyen d'un billet pour vos événements ? (ex. 10 000 FCFA)" value={form.averagePrice} onChange={set('averagePrice')} className={fieldClass} />
                <select
                  required
                  value={reasonTouched ? form.reason : ''}
                  onChange={(e) => { setReasonTouched(true); set('reason')(e); }}
                  className={`${fieldClass} ${reasonTouched ? '' : 'text-gray-400'}`}
                >
                  <option value="" disabled>Motif de votre demande*</option>
                  {REASONS.map((r) => <option key={r.value} value={r.value} className="text-gray-900">{r.label}</option>)}
                </select>
                <textarea rows={3} placeholder="Votre message (facultatif)" value={form.message} onChange={set('message')} className={fieldClass} />
                {/* Champ piège anti-robot, invisible pour les humains */}
                <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} className="hidden" />
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-full bg-[#03033b] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16bda0] hover:text-[#03033b] disabled:opacity-60"
                  >
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Contacter l'équipe
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContactPage;
