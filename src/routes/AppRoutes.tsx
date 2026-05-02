import { lazy, Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Routes, Route, Navigate, Outlet,
  useNavigate, useParams, useLocation,
} from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useCountry } from '../context/CountryContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import EventsBackendAPI from '../services/api/EventsBackendAPI';
import type { BackendEvent } from '../services/api/EventsBackendAPI';
import FeetiPlayEventsAPI from '../services/api/FeetiPlayEventsAPI';
import type { FeetiPlayEvent } from '../services/api/FeetiPlayEventsAPI';
import type { Ticket } from '../context/AppContext';
import type { RegisterData } from '../services/api/AuthAPI';

// Adapter: BackendEvent → format attendu par les composants
function adaptEvent(e: BackendEvent) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    time: e.time,
    location: e.location,
    image: e.image,
    price: e.price,
    currency: e.currency || 'FCFA',
    category: e.category,
    attendees: e.attendees,
    maxAttendees: e.maxAttendees,
    duration: e.duration || '',
    salesBlocked: e.salesBlocked ?? false,
    isLive: e.isLive,
    vipPrice: e.vipPrice,
    countryCode: e.countryCode,
    isFeatured: e.isFeatured ?? false,
    isFavorite: e.isFavorite ?? false,
    createdAt: e.createdAt,
    organizer: e.organizer?.name || 'Organisateur',
    organizerName: e.organizer?.name || 'Organisateur',
    tags: [] as string[],
    streamUrl: e.streamUrl,
    videoUrl: e.videoUrl,
    promotionType: e.promotionType ?? null,
    promotionStatus: e.promotionStatus ?? null,
    promotionStartDate: e.promotionStartDate ?? null,
    promotionEndDate: e.promotionEndDate ?? null,
    source: 'feeti2' as const,
    isReplay: false,
    externalUrl: undefined as string | undefined,
  };
}

const FEETIPLAY_URL = (import.meta as any).env?.VITE_FEETIPLAY_URL ?? 'http://localhost:5173';
const FEETIPLAY_EVENT_PREFIX = 'feetiplay_';

type AppEvent = ReturnType<typeof adaptEvent>;

function toFeetiPlayRouteId(id: string) {
  return `${FEETIPLAY_EVENT_PREFIX}${id}`;
}

function isFeetiPlayRouteId(id: string) {
  return id.startsWith(FEETIPLAY_EVENT_PREFIX);
}

function fromFeetiPlayRouteId(id: string) {
  return id.replace(FEETIPLAY_EVENT_PREFIX, '');
}

function adaptFeetiPlayEvent(e: FeetiPlayEvent): AppEvent {
  const viewers = e.viewerCount ?? 0;
  return {
    id: toFeetiPlayRouteId(e.id),
    title: e.title,
    description: e.description,
    date: e.date,
    time: e.time,
    location: e.location || `En streaming sur ${e.channelName}`,
    image: e.image || '',
    price: e.isFree ? 0 : (e.price ?? 0),
    currency: e.currency || 'FCFA',
    category: e.category,
    attendees: viewers,
    maxAttendees: Math.max(viewers + 1, 1000),
    duration: e.duration || '',
    salesBlocked: false,
    isLive: e.isLive,
    vipPrice: undefined,
    countryCode: undefined,
    isFeatured: e.isFeatured ?? false,
    isFavorite: false,
    createdAt: e.createdAt,
    organizer: e.channelName || 'FeetiPlay',
    organizerName: e.channelName || 'FeetiPlay',
    tags: e.tags ?? [],
    streamUrl: e.streamUrl,
    videoUrl: e.isReplay ? (e.streamUrl ?? '') : undefined,
    promotionType: null,
    promotionStatus: null,
    promotionStartDate: null,
    promotionEndDate: null,
    source: 'feetiplay' as const,
    isReplay: e.isReplay ?? false,
    externalUrl: `${FEETIPLAY_URL}/event/${e.id}`,
  };
}

function mergeEvents(primary: AppEvent[], secondary: AppEvent[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary]
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const bTime = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return bTime - aTime;
    });
}


import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollUpButton } from '../components/ScrollUpButton';
import { CookieBanner } from '../components/CookieBanner';
import { CookiePreferences } from '../components/CookiePreferences';
import { Toaster } from '../components/ui/sonner';
import { HomePage } from '../components/pages/HomePage';
import { LoginPage } from '../components/pages/LoginPage';
import { AccountPage } from '../components/pages/AccountPage';
import { UserDashboard } from '../components/pages/UserDashboard';
import { ControllerDashboard } from '../components/pages/ControllerDashboard';

// Lazy load des pages lourdes
const EventsListPage         = lazy(() => import('../components/pages/EventsListPage').then(m => ({ default: m.EventsListPage })));
const EventDetailPage        = lazy(() => import('../components/pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const TicketPurchasePage     = lazy(() => import('../components/pages/TicketPurchasePage').then(m => ({ default: m.TicketPurchasePage })));
const TicketVerificationPage = lazy(() => import('../components/pages/TicketVerificationPage').then(m => ({ default: m.TicketVerificationPage })));
const OrganizerDashboard     = lazy(() => import('../components/pages/OrganizerDashboard').then(m => ({ default: m.OrganizerDashboard })));
const OrganizerEventDashboard= lazy(() => import('../components/pages/OrganizerEventDashboard').then(m => ({ default: m.OrganizerEventDashboard })));
const AdminDashboard         = lazy(() => import('../components/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const BackOfficeDashboard    = lazy(() => import('../components/pages/BackOfficeDashboard').then(m => ({ default: m.BackOfficeDashboard })));
const StreamingPage          = lazy(() => import('../components/pages/StreamingPage').then(m => ({ default: m.StreamingPage })));
const LiveEventsPage         = lazy(() => import('../components/pages/LiveEventsPage').then(m => ({ default: m.LiveEventsPage })));
const ReplayPage             = lazy(() => import('../components/pages/ReplayPage').then(m => ({ default: m.ReplayPage })));
const BlogPage               = lazy(() => import('../components/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage         = lazy(() => import('../components/pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const BlogAdminPage          = lazy(() => import('../components/pages/BlogAdminPage').then(m => ({ default: m.BlogAdminPage })));
const BonPlansPage           = lazy(() => import('../components/pages/BonPlansPage').then(m => ({ default: m.BonPlansPage })));
const BonPlanListPage        = lazy(() => import('../components/pages/BonPlanListPage').then(m => ({ default: m.BonPlanListPage })));
const BonPlanDetailPage      = lazy(() => import('../components/pages/BonPlanDetailPage').then(m => ({ default: m.BonPlanDetailPage })));
const LeisurePage            = lazy(() => import('../components/pages/LeisurePage').then(m => ({ default: m.LeisurePage })));
const HotelsPage             = lazy(() => import('../components/pages/HotelsPage').then(m => ({ default: m.HotelsPage })));
const RestaurantsPage        = lazy(() => import('../components/pages/RestaurantsPage').then(m => ({ default: m.RestaurantsPage })));
const SportsWellnessPage     = lazy(() => import('../components/pages/SportsWellnessPage').then(m => ({ default: m.SportsWellnessPage })));
const EnvoleePage            = lazy(() => import('../components/pages/EnvoleePage').then(m => ({ default: m.EnvoleePage })));
const LoisirsPage            = lazy(() => import('../components/pages/LoisirsPage').then(m => ({ default: m.LoisirsPage })));
const BarNightPage           = lazy(() => import('../components/pages/BarNightPage').then(m => ({ default: m.BarNightPage })));
const EstablishmentDetailPage= lazy(() => import('../components/pages/EstablishmentDetailPage').then(m => ({ default: m.EstablishmentDetailPage })));
const EventSubmissionPage    = lazy(() => import('../components/pages/EventSubmissionPage').then(m => ({ default: m.EventSubmissionPage })));
const LegalPages             = lazy(() => import('../components/pages/LegalPages').then(m => ({ default: m.LegalPages })));
const TermsOfServicePage     = lazy(() => import('../components/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const PrivacyPolicyPage      = lazy(() => import('../components/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const CookiePolicyPage       = lazy(() => import('../components/pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const LegalNoticePage        = lazy(() => import('../components/pages/LegalNoticePage').then(m => ({ default: m.LegalNoticePage })));
const RefundPolicyPage       = lazy(() => import('../components/pages/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));
const FAQPage                = lazy(() => import('../components/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const MyFavoritesPage        = lazy(() => import('../components/pages/MyFavoritesPage').then(m => ({ default: m.MyFavoritesPage })));
const QRScannerPage          = lazy(() => import('../components/pages/QRScannerPage').then(m => ({ default: m.QRScannerPage })));
const OrganizerFinancialDashboard = lazy(() => import('../components/pages/OrganizerFinancialDashboard'));
const AdminFinancialDashboard     = lazy(() => import('../components/pages/AdminFinancialDashboard'));
const FeetiNaFeetiPage            = lazy(() => import('../components/pages/FeetiNaFeetiPage').then(m => ({ default: m.FeetiNaFeetiPage })));
const FeetiAccessDashboard        = lazy(() => import('../components/pages/FeetiAccessDashboard').then(m => ({ default: m.FeetiAccessDashboard })));
const WebScannerPage              = lazy(() => import('../components/pages/WebScannerPage').then(m => ({ default: m.WebScannerPage })));
const FeetiNaFeetiAdminPage       = lazy(() => import('../components/pages/FeetiNaFeetiAdminPage').then(m => ({ default: m.FeetiNaFeetiAdminPage })));
const UserProfilePage             = lazy(() => import('../components/pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));

// ── Correspondance page-name → route ─────────────────────────────────────────
const PAGE_ROUTES: Record<string, string> = {
  home: '/', events: '/events', 'live-events': '/live',
  deals: '/deals', 'deals-list': '/deals/list',
  leisure: '/leisure', hotels: '/leisure/hotels',
  restaurants: '/leisure/restaurants', 'sports-wellness': '/leisure/sports',
  envolee: '/leisure/envolee', 'loisirs-specific': '/leisure/loisirs',
  'bar-night': '/leisure/bar-night',
  blog: '/blog', 'blog-admin': '/blog/admin',
  'user-dashboard': '/dashboard', 'organizer-dashboard': '/organizer',
  'admin-dashboard': '/admin', 'back-office': '/back-office',
  login: '/login', replay: '/replay', streaming: '/streaming',
  'ticket-verification': '/verify', 'submit-event': '/submit-event',
  legal: '/legal/terms',
  'my-tickets': '/dashboard',
  'my-favorites': '/favorites',
  'qr-scanner': '/scan',
  'financial-dashboard': '/organizer/finance',
  'admin-financial': '/admin/finance',
  'feeti-na-feeti': '/feeti-na-feeti',
  'user-profile': '/profile',
};

// ── Loader ────────────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600" />
  </div>
);

// ── Scroll-to-top on route change (skip panels) ──────────────────────────────
const PANEL_PREFIXES = ['/organizer', '/admin', '/back-office', '/controller'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isPanel = PANEL_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
    if (!isPanel) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ── Layout principal (Navbar + Footer) ────────────────────────────────────────
function Layout() {
  const { user: currentUser, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  const { countries, selectedCountry, setSelectedCountry } = useCountry();

  const handleNavigate = useCallback((page: string, params?: Record<string, unknown>) => {
    const route = PAGE_ROUTES[page] ?? '/';
    navigate(route, { state: params });
  }, [navigate]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<void> => {
    const user = await login(email, password);
    toast.success(`Bienvenue ${user.name} !`);
    const pendingFav = localStorage.getItem('feeti_pending_favorite');
    if (pendingFav) {
      try {
        const { eventId } = JSON.parse(pendingFav);
        await EventsBackendAPI.toggleFavorite(eventId);
        toast.success('Événement ajouté à vos favoris !');
      } catch {}
      localStorage.removeItem('feeti_pending_favorite');
      navigate('/dashboard', { replace: true, state: { initialTab: 'favorites' } });
      return;
    }
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/') { navigate(from, { replace: true }); return; }
    const isAdminLike = user.adminRole && !['user', 'organizer', 'controller'].includes(user.adminRole);
    if (user.role === 'controller') { navigate('/controller', { replace: true }); return; }
    navigate(user.role === 'organizer' ? '/organizer' : '/dashboard', { replace: true });
  }, [login, navigate, location.state]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
    toast.success('Vous êtes déconnecté');
  }, [logout, navigate]);

  const isLoginPage = location.pathname === '/login';
  const isPanel = PANEL_PREFIXES.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  return (
    <>
      <ScrollToTop />
      {!isLoginPage && (
        <Navbar
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={location.pathname.replace('/', '') || 'home'}
          countries={countries}
          selectedCountry={selectedCountry}
          onCountrySelect={setSelectedCountry}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        <Outlet context={{ currentUser, handleNavigate, handleLogin }} />
      </Suspense>

      {!isLoginPage && <Footer onNavigate={handleNavigate} onLegalPageNavigate={(page) => navigate(`/legal/${page}`)} />}
      {!isPanel && <ScrollUpButton />}
      <CookieBanner onPreferencesClick={() => setShowCookiePreferences(true)} />
      {showCookiePreferences && (
        <CookiePreferences open={showCookiePreferences} onOpenChange={(open) => setShowCookiePreferences(open)} />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}

// ── Wrappers pour les routes avec paramètres ──────────────────────────────────

function EventDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const loader = isFeetiPlayRouteId(id)
      ? FeetiPlayEventsAPI.getEventById(fromFeetiPlayRouteId(id)).then(adaptFeetiPlayEvent)
      : EventsBackendAPI.getEventById(id).then(adaptEvent);

    loader
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!event) return <Navigate to="/events" replace />;
  return (
    <EventDetailPage
      event={event}
      onBack={() => navigate('/events')}
      onPurchase={(eid: string) => {
        if (isFeetiPlayRouteId(eid)) {
          window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(eid)}`, '_blank', 'noopener,noreferrer');
          return;
        }
        navigate(`/events/${eid}/buy`);
      }}
      onStreamWatch={(eid: string) => navigate(`/streaming/${eid}`)}
      currentUser={currentUser}
    />
  );
}

function PaymentRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addTickets } = useApp();
  const { selectedCountry } = useCountry();
  const [event, setEvent] = useState<ReturnType<typeof adaptEvent> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    if (isFeetiPlayRouteId(id)) {
      window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(id)}`, '_blank', 'noopener,noreferrer');
      setLoading(false);
      return;
    }
    EventsBackendAPI.getEventById(id)
      .then(data => setEvent(adaptEvent(data)))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!event || !currentUser) return <Navigate to="/events" replace />;

  const handleComplete = (tickets: Ticket[]) => {
    addTickets(tickets);
    navigate('/dashboard');
  };
  return (
    <TicketPurchasePage
      event={event}
      onBack={() => navigate(`/events/${id}`)}
      onPurchaseComplete={handleComplete}
      currentUser={currentUser}
      headerCountryCode={selectedCountry?.code ?? null}
    />
  );
}

function StreamingRoute() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    // Le streaming se passe sur FeetiPlay — redirection immédiate
    const eventId = isFeetiPlayRouteId(id) ? fromFeetiPlayRouteId(id) : id;
    window.location.href = `${FEETIPLAY_URL}/event/${eventId}`;
  }, [id]);

  return <PageLoader />;
}

function BlogRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  return (
    <BlogPage
      onBack={() => navigate('/')}
      onPostSelect={(id: string) => navigate(`/blog/${id}`)}
      onNavigate={(page: string, params?: any) => navigate(PAGE_ROUTES[page] ?? '/', { state: params })}
      currentUser={currentUser}
    />
  );
}

function BlogDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  if (!id) return <Navigate to="/blog" replace />;
  return (
    <BlogDetailPage
      postId={id}
      onBack={() => navigate('/blog')}
      onNavigate={(page: string, params?: any) => navigate(PAGE_ROUTES[page] ?? '/', { state: params })}
      currentUser={currentUser}
    />
  );
}

function OrganizerEventRoute() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const initialTab = (location.state as any)?.initialTab as string | undefined;

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    EventsBackendAPI.getEventById(eventId)
      .then(data => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <PageLoader />;
  if (!event) return <Navigate to="/organizer" replace />;
  return (
    <OrganizerEventDashboard
      event={event as any}
      onBack={() => navigate('/organizer')}
      initialTab={initialTab}
      onAccessDashboard={() => navigate(`/organizer/event/${eventId}/access`)}
    />
  );
}

function FeetiAccessRoute() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');

  useEffect(() => {
    if (!eventId) return;
    EventsBackendAPI.getEventById(eventId)
      .then(e => setEventTitle(e.title))
      .catch(() => {});
  }, [eventId]);

  if (!eventId) return <Navigate to="/organizer" replace />;
  return (
    <FeetiAccessDashboard
      eventId={eventId}
      eventTitle={eventTitle}
      onBack={() => navigate(`/organizer/event/${eventId}`)}
    />
  );
}

function DealsListRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilter = (location.state as any)?.filter as string | undefined;
  return (
    <BonPlanListPage
      onBack={() => navigate('/deals')}
      initialFilter={initialFilter}
      onDealSelect={(id) => navigate(`/deals/${id}`)}
    />
  );
}

function DealsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const filter = (location.state as any)?.filter as string | undefined;

  return (
    <BonPlansPage
      onBack={() => navigate('/')}
      onNavigate={(page, params) => navigate(PAGE_ROUTES[page] ?? '/', { state: params })}
      filter={filter}
    />
  );
}

function DealDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/deals/list" replace />;
  return <BonPlanDetailPage dealId={id} onBack={() => navigate('/deals/list')} />;
}

function EstablishmentRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <EstablishmentDetailPage
      establishmentId={id}
      onBack={() => navigate('/leisure')}
    />
  );
}

function LegalRoute() {
  const { page } = useParams<{ page: string }>();
  const navigate = useNavigate();
  return (
    <LegalPages
      page={(page as any) ?? 'terms'}
      onBack={() => navigate('/')}
    />
  );
}

// ── Wrappers simples pour les pages avec props de navigation ──────────────────

function HomeRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedCountry } = useCountry();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      EventsBackendAPI.getAllEvents(selectedCountry?.code),
      FeetiPlayEventsAPI.getLive().catch(() => [] as FeetiPlayEvent[]),
    ])
      .then(([localEvents, liveFeetiPlayEvents]) => {
        setEvents(mergeEvents(localEvents.map(adaptEvent), liveFeetiPlayEvents.map(adaptFeetiPlayEvent)));
      })
      .catch(() => {});
  }, [selectedCountry?.code]);

  useEffect(() => {
    if (!currentUser) { setFavoriteIds(new Set()); return; }
    EventsBackendAPI.getMyFavorites()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.id))))
      .catch(() => {});
  }, [currentUser?.id]);

  const eventsWithFav = useMemo(
    () => events.map(e => ({ ...e, isFavorite: favoriteIds.has(e.id) })),
    [events, favoriteIds]
  );

  const handleWishlist = useCallback(async (eventId: string) => {
    if (isFeetiPlayRouteId(eventId)) return;
    if (!currentUser) {
      localStorage.setItem('feeti_pending_favorite', JSON.stringify({ eventId, type: 'event' }));
      navigate('/login');
      return;
    }
    try {
      const result = await EventsBackendAPI.toggleFavorite(eventId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (result.isFavorited) next.add(eventId); else next.delete(eventId);
        return next;
      });
    } catch {}
  }, [currentUser, navigate]);

  return (
    <HomePage
      events={eventsWithFav}
      onEventSelect={(id: string) => navigate(`/events/${id}`)}
      onNavigate={(page: string, params?: any) => navigate(PAGE_ROUTES[page] ?? '/', { state: params })}
      onStreamWatch={(id: string) => navigate(`/streaming/${id}`)}
      onPurchase={(id: string) => {
        if (isFeetiPlayRouteId(id)) {
          window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(id)}`, '_blank', 'noopener,noreferrer');
          return;
        }
        navigate(`/events/${id}/buy`);
      }}
      onWishlist={handleWishlist}
    />
  );
}

function EventsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { selectedCountry } = useCountry();
  const state = (location.state ?? {}) as Record<string, unknown>;
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      EventsBackendAPI.getAllEvents(selectedCountry?.code),
      FeetiPlayEventsAPI.getLive().catch(() => [] as FeetiPlayEvent[]),
    ])
      .then(([localEvents, liveFeetiPlayEvents]) => {
        setEvents(mergeEvents(localEvents.map(adaptEvent), liveFeetiPlayEvents.map(adaptFeetiPlayEvent)));
      })
      .catch(() => {});
  }, [selectedCountry?.code]);

  useEffect(() => {
    if (!currentUser) { setFavoriteIds(new Set()); return; }
    EventsBackendAPI.getMyFavorites()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.id))))
      .catch(() => {});
  }, [currentUser?.id]);

  const eventsWithFav = useMemo(
    () => events.map(e => ({ ...e, isFavorite: favoriteIds.has(e.id) })),
    [events, favoriteIds]
  );

  const handleWishlist = useCallback(async (eventId: string) => {
    if (isFeetiPlayRouteId(eventId)) return;
    if (!currentUser) {
      localStorage.setItem('feeti_pending_favorite', JSON.stringify({ eventId, type: 'event' }));
      navigate('/login');
      return;
    }
    try {
      const result = await EventsBackendAPI.toggleFavorite(eventId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (result.isFavorited) next.add(eventId); else next.delete(eventId);
        return next;
      });
    } catch {}
  }, [currentUser, navigate]);

  return (
    <EventsListPage
      events={eventsWithFav}
      onEventSelect={(id: string) => navigate(`/events/${id}`)}
      onPurchase={(id: string) => {
        if (isFeetiPlayRouteId(id)) {
          window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(id)}`, '_blank', 'noopener,noreferrer');
          return;
        }
        navigate(`/events/${id}/buy`);
      }}
      onStreamWatch={(id: string) => navigate(`/streaming/${id}`)}
      onWishlist={handleWishlist}
      initialCategoryFilter={state.categoryFilter as string | undefined}
      initialTypeFilter={state.typeFilter as 'all' | 'live' | 'in-person' | undefined}
      initialFeaturedFilter={state.featuredFilter === true}
      initialMonthFilter={state.monthFilter === true}
    />
  );
}

function LiveEventsRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedCountry } = useCountry();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      EventsBackendAPI.getAllEvents(selectedCountry?.code),
      FeetiPlayEventsAPI.getLive().catch(() => [] as FeetiPlayEvent[]),
    ])
      .then(([localEvents, liveFeetiPlayEvents]) => {
        setEvents(mergeEvents(
          localEvents.filter(e => e.isLive).map(adaptEvent),
          liveFeetiPlayEvents.map(adaptFeetiPlayEvent),
        ));
      })
      .catch(() => {});
  }, [selectedCountry?.code]);

  useEffect(() => {
    if (!currentUser) { setFavoriteIds(new Set()); return; }
    EventsBackendAPI.getMyFavorites()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.id))))
      .catch(() => {});
  }, [currentUser?.id]);

  const eventsWithFav = useMemo(
    () => events.map(e => ({ ...e, isFavorite: favoriteIds.has(e.id) })),
    [events, favoriteIds]
  );

  const handleWishlist = useCallback(async (eventId: string) => {
    if (isFeetiPlayRouteId(eventId)) return;
    if (!currentUser) {
      localStorage.setItem('feeti_pending_favorite', JSON.stringify({ eventId, type: 'event' }));
      navigate('/login');
      return;
    }
    try {
      const result = await EventsBackendAPI.toggleFavorite(eventId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (result.isFavorited) next.add(eventId); else next.delete(eventId);
        return next;
      });
    } catch {}
  }, [currentUser, navigate]);

  return (
    <LiveEventsPage
      events={eventsWithFav}
      onBack={() => navigate('/')}
      onEventSelect={(id: string) => navigate(`/events/${id}`)}
      onStreamWatch={(id: string) => navigate(`/streaming/${id}`)}
      onPurchase={(id: string) => {
        if (isFeetiPlayRouteId(id)) {
          window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(id)}`, '_blank', 'noopener,noreferrer');
          return;
        }
        navigate(`/events/${id}/buy`);
      }}
      onWishlist={handleWishlist}
      currentUser={currentUser}
    />
  );
}

function OrganizerRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState<BackendEvent[]>([]);

  useEffect(() => {
    EventsBackendAPI.getMyEvents()
      .then(setOrganizerEvents)
      .catch(() => {});
  }, []);

  // Read and display one-time admin notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    const key = `feeti_org_notifications_${currentUser.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const notifications: { eventId: string; eventTitle: string; action: string; timestamp: number }[] = JSON.parse(raw);
      notifications.forEach(n => {
        if (n.action === 'approved') {
          toast.success(`✅ Votre événement "${n.eventTitle}" a été approuvé et publié !`);
        } else {
          toast.error(`❌ Votre événement "${n.eventTitle}" a été rejeté par l'administration.`);
        }
      });
      localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }, [currentUser?.id]);

  const handleEventCreate = useCallback(async (eventData: { title: string; description: string; date: string; time: string; location: string; imageFile?: File; price?: number; ticketTypes?: { type: string; price?: number }[]; category?: string; maxAttendees?: number; duration?: string; isLive?: boolean }) => {
    try {
      let imageUrl = '';
      if (eventData.imageFile instanceof File) {
        imageUrl = await EventsBackendAPI.uploadImage(eventData.imageFile);
      }
      const created = await EventsBackendAPI.createEvent({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        image: imageUrl,
        price: eventData.price ?? 0,
        vipPrice: eventData.ticketTypes?.find((t: any) => t.type === 'VIP')?.price,
        ticketTypes: JSON.stringify(eventData.ticketTypes ?? []),
        currency: 'FCFA',
        category: eventData.category ?? '',
        maxAttendees: eventData.maxAttendees ?? 100,
        duration: eventData.duration,
        isLive: eventData.isLive,
        status: 'draft',
      });
      setOrganizerEvents(prev => [...prev, created]);
      toast.success('Événement créé avec succès !');
    } catch {
      toast.error('Erreur lors de la création de l\'événement');
    }
  }, []);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await EventsBackendAPI.deleteEvent(eventId);
      setOrganizerEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Événement supprimé !');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, []);

  const handleEventEdit = useCallback(async (eventId: string, eventData: { title?: string; description?: string; date?: string; time?: string; location?: string; imageFile?: File; price?: number; ticketTypes?: { type: string; price?: number }[]; category?: string; maxAttendees?: number; duration?: string; isLive?: boolean }) => {
    try {
      let imageUrl: string | undefined;
      if (eventData.imageFile instanceof File) {
        imageUrl = await EventsBackendAPI.uploadImage(eventData.imageFile);
      }
      const updated = await EventsBackendAPI.updateEvent(eventId, {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        ...(imageUrl ? { image: imageUrl } : {}),
        price: eventData.price ?? 0,
        vipPrice: eventData.ticketTypes?.find((t: any) => t.type === 'VIP')?.price,
        ticketTypes: JSON.stringify(eventData.ticketTypes ?? []),
        currency: 'FCFA',
        category: eventData.category ?? '',
        maxAttendees: eventData.maxAttendees ?? 100,
        duration: eventData.duration,
        isLive: eventData.isLive,
      });
      setOrganizerEvents(prev => prev.map(e => e.id === eventId ? updated : e));
      toast.success('Événement modifié avec succès !');
    } catch {
      toast.error('Erreur lors de la modification de l\'événement');
    }
  }, []);

  return (
    <OrganizerDashboard
      currentUser={currentUser}
      organizerEvents={organizerEvents as any[]}
      onEventCreate={handleEventCreate}
      onEventEdit={handleEventEdit}
      onEventDelete={handleEventDelete}
      onEventToggleSales={(id, salesBlocked) =>
        setOrganizerEvents(prev => prev.map(e => e.id === id ? { ...e, salesBlocked } : e))
      }
      onEventSelect={(id: string) => navigate(`/organizer/event/${id}`)}
      onManageControllers={(id: string) => navigate(`/organizer/event/${id}`, { state: { initialTab: 'controllers' } })}
      onNavigate={(page: string, params?: any) => navigate(PAGE_ROUTES[page] ?? '/', { state: params })}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const user = await login(email, password);
    toast.success(`Bienvenue ${user.name} !`);
    const pendingFav = localStorage.getItem('feeti_pending_favorite');
    if (pendingFav) {
      try {
        const { eventId } = JSON.parse(pendingFav);
        await EventsBackendAPI.toggleFavorite(eventId);
        toast.success('Événement ajouté à vos favoris !');
      } catch {}
      localStorage.removeItem('feeti_pending_favorite');
      navigate('/dashboard', { replace: true, state: { initialTab: 'favorites' } });
      return;
    }
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/') { navigate(from, { replace: true }); return; }
    if (user.role === 'controller') { navigate('/controller', { replace: true }); return; }
    navigate(user.role === 'organizer' ? '/organizer' : '/dashboard', { replace: true });
  };

  const handleRegister = async (data: RegisterData) => {
    const user = await registerUser(data);
    toast.success(`Bienvenue ${user.name} ! Votre compte a été créé.`);
    navigate(user.role === 'organizer' ? '/organizer' : '/', { replace: true });
  };

  return (
    <LoginPage
      onLogin={handleLogin}
      onRegister={handleRegister}
      onBack={() => navigate(-1)}
    />
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  return <AdminDashboard currentUser={currentUser} onBack={() => navigate('/')} />;
}

function MyFavoritesRoute() {
  return <MyFavoritesPage />;
}

function QRScannerRoute() {
  const navigate = useNavigate();
  return <QRScannerPage onBack={() => navigate('/organizer')} />;
}

function FeetiNaFeetiRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  return <FeetiNaFeetiPage onBack={() => navigate(-1)} currentUser={currentUser} />;
}

function FeetiNaFeetiAdminRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  return <FeetiNaFeetiAdminPage onBack={() => navigate(-1)} currentUser={currentUser} />;
}

function BackOfficeRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  return <BackOfficeDashboard currentUser={currentUser} onBack={() => navigate('/')} />;
}

function ControllerRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return <ControllerDashboard onLogout={handleLogout} />;
}

function ReplayRoute() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedCountry } = useCountry();
  const [events, setEvents] = useState<AppEvent[]>([]);

  useEffect(() => {
    Promise.all([
      EventsBackendAPI.getAllEvents(selectedCountry?.code),
      FeetiPlayEventsAPI.getReplays().catch(() => [] as FeetiPlayEvent[]),
    ])
      .then(([localEvents, replayEvents]) => {
        setEvents(mergeEvents(localEvents.map(adaptEvent), replayEvents.map(adaptFeetiPlayEvent)));
      })
      .catch(() => {});
  }, [selectedCountry?.code]);

  return (
    <ReplayPage
      events={events}
      onBack={() => navigate('/')}
      onEventSelect={(id: string) => navigate(`/events/${id}`)}
      onStreamWatch={(id: string) => navigate(`/streaming/${id}`)}
      onPurchase={(id: string) => {
        if (isFeetiPlayRouteId(id)) {
          window.open(`${FEETIPLAY_URL}/event/${fromFeetiPlayRouteId(id)}`, '_blank', 'noopener,noreferrer');
          return;
        }
        navigate(`/events/${id}/buy`);
      }}
      currentUser={currentUser}
    />
  );
}

// ── Arbre des routes ─────────────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Pages publiques */}
        <Route path="/"                   element={<HomeRoute />} />
        <Route path="/events"             element={<EventsRoute />} />
        <Route path="/events/:id"         element={<EventDetailRoute />} />
        <Route path="/live"               element={<LiveEventsRoute />} />
        <Route path="/streaming/:id"      element={<StreamingRoute />} />
        <Route path="/replay"             element={<ReplayRoute />} />
        <Route path="/blog"               element={<BlogRoute />} />
        <Route path="/blog/:id"           element={<BlogDetailRoute />} />
        <Route path="/deals"              element={<DealsRoute />} />
        <Route path="/deals/list"         element={<DealsListRoute />} />
        <Route path="/deals/:id"          element={<DealDetailRoute />} />
        <Route path="/leisure"            element={<LeisurePage onBack={() => {}} onNavigate={() => {}} />} />
        <Route path="/leisure/hotels"     element={<HotelsPage onBack={() => {}} />} />
        <Route path="/leisure/restaurants" element={<RestaurantsPage onBack={() => {}} />} />
        <Route path="/leisure/sports"     element={<SportsWellnessPage onBack={() => {}} />} />
        <Route path="/leisure/envolee"    element={<EnvoleePage onBack={() => {}} />} />
        <Route path="/leisure/loisirs"    element={<LoisirsPage onBack={() => {}} />} />
        <Route path="/leisure/bar-night"  element={<BarNightPage onBack={() => {}} />} />
        <Route path="/leisure/establishment/:id" element={<EstablishmentRoute />} />
        <Route path="/submit-event"       element={<EventSubmissionPage onBack={() => {}} currentUser={null} />} />
        <Route path="/legal/terms"        element={<TermsOfServicePage />} />
        <Route path="/legal/privacy"      element={<PrivacyPolicyPage />} />
        <Route path="/legal/cookies"      element={<CookiePolicyPage />} />
        <Route path="/legal/notice"       element={<LegalNoticePage />} />
        <Route path="/legal/refund"       element={<RefundPolicyPage />} />
        <Route path="/legal/faq"          element={<FAQPage />} />
        <Route path="/legal/:page"        element={<LegalRoute />} />
        <Route path="/login"              element={<LoginRoute />} />

        {/* Routes protégées — utilisateur connecté */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"        element={<UserDashboard />} />
          <Route path="/profile"          element={<UserProfilePage />} />
          <Route path="/events/:id/buy"   element={<PaymentRoute />} />
          <Route path="/favorites"        element={<MyFavoritesRoute />} />
          <Route path="/feeti-na-feeti"   element={<FeetiNaFeetiRoute />} />
        </Route>

        {/* Routes protégées — organisateur */}
        <Route element={<ProtectedRoute requiredRole="organizer" />}>
          <Route path="/organizer"        element={<OrganizerRoute />} />
          <Route path="/organizer/event/:eventId" element={<OrganizerEventRoute />} />
          <Route path="/organizer/event/:eventId/access" element={<FeetiAccessRoute />} />
          <Route path="/scan/access/:eventId" element={<WebScannerPage />} />
          <Route path="/organizer/finance" element={<OrganizerFinancialDashboard />} />
          <Route path="/verify"           element={<TicketVerificationPage onBack={() => {}} />} />
          <Route path="/scan"             element={<QRScannerRoute />} />
          <Route path="/blog/admin"       element={<BlogAdminPage onBack={() => {}} currentUser={null} />} />
        </Route>

        {/* Routes protégées — contrôleur (et au-dessus) */}
        <Route element={<ProtectedRoute requiredRole="controller" />}>
          <Route path="/controller"       element={<ControllerRoute />} />
          <Route path="/scan/access/:eventId" element={<WebScannerPage />} />
        </Route>

        {/* Routes protégées — admin */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin"            element={<AdminRoute />} />
          <Route path="/admin/finance"    element={<AdminFinancialDashboard />} />
          <Route path="/admin/feeti-na-feeti" element={<FeetiNaFeetiAdminRoute />} />
          <Route path="/back-office"      element={<BackOfficeRoute />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

