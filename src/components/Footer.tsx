import svgPaths from "../imports/svg-opchhfjrnf";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
  onLegalPageNavigate: (page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund') => void;
  onCookiePreferencesClick?: () => void;
  currentPage?: string;
}

// CTA Section Components
function Intro() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start justify-start left-[99px] not-italic text-gray-50 top-[32px]" data-name="intro">
      <p className="font-medium leading-[1.2] relative shrink-0 text-[24px] xl:text-[26px] 2xl:text-[28px] text-nowrap tracking-[-0.28px] whitespace-pre">Pour plus de possibilité ?</p>
      <p className="font-normal leading-[1.4] opacity-90 relative shrink-0 text-[18px] xl:text-[20px] 2xl:text-[22px] w-[491px]">Téléchargez votre application dès maintenant via le store de votre choix.</p>
    </div>
  );
}

function AppStoreButton() {
  return (
    <a
      href="https://apps.apple.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:scale-105 transition-transform duration-200"
    >
      <svg className="block w-[148px] h-[43px] xl:w-[160px] xl:h-[47px] 2xl:w-[175px] 2xl:h-[51px]" fill="none" preserveAspectRatio="none" viewBox="0 0 219 63">
        <g id="Group">
          <path d={svgPaths.p2bc36570} fill="white" id="Border" />
          <g id="Icon">
            <path d={svgPaths.p4d9a600} fill="white" />
            <path d={svgPaths.p2ac9c700} fill="white" />
          </g>
          <g id="Download on the">
            <path d={svgPaths.p1e941500} fill="white" id="D" />
            <path d={svgPaths.p2b732800} fill="white" id="o" />
            <path d={svgPaths.p279c7900} fill="white" id="w" />
            <path d={svgPaths.p6f64f00} fill="white" id="n" />
            <path d={svgPaths.pb944b2} fill="white" id="l" />
            <path d={svgPaths.p30718700} fill="white" id="o_2" />
            <path d={svgPaths.pf729100} fill="white" id="a" />
            <path d={svgPaths.p1b32b680} fill="white" id="d" />
            <path d={svgPaths.p394c8e80} fill="white" id="o_3" />
            <path d={svgPaths.p2afb41f0} fill="white" id="n_2" />
            <path d={svgPaths.p11dffc00} fill="white" id="t" />
            <path d={svgPaths.p3bf23080} fill="white" id="h" />
            <path d={svgPaths.p23575480} fill="white" id="e" />
          </g>
          <g id="App Store">
            <path d={svgPaths.p33fdb680} fill="white" id="A" />
            <path d={svgPaths.p33c89b00} fill="white" id="p" />
            <path d={svgPaths.p353a1100} fill="white" id="p_2" />
            <path d={svgPaths.p3f265480} fill="white" id="S" />
            <path d={svgPaths.p32083d40} fill="white" id="t_2" />
            <path d={svgPaths.p677c700} fill="white" id="o_4" />
            <path d={svgPaths.pb93a980} fill="white" id="r" />
            <path d={svgPaths.p22860dc0} fill="white" id="e_2" />
          </g>
        </g>
      </svg>
    </a>
  );
}

function GooglePlayButton() {
  return (
    <a
      href="https://play.google.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:scale-105 transition-transform duration-200"
    >
      <svg className="block w-[148px] h-[43px] xl:w-[160px] xl:h-[47px] 2xl:w-[175px] 2xl:h-[51px]" fill="none" preserveAspectRatio="none" viewBox="0 0 175 51">
        <g id="Group" transform="scale(1,-1) translate(0,-51)">
          <path d={svgPaths.ped38a80} fill="white" id="Border" />
          <g id="Icon">
            <path d={svgPaths.p3e24600} fill="white" id="Vector" />
            <path d={svgPaths.p206b8300} fill="white" id="Vector_2" />
            <path d={svgPaths.p324dfe00} fill="white" id="Vector_3" />
            <path d={svgPaths.p132df700} fill="white" id="Vector_4" />
          </g>
          <g id="GET IT ON">
            <path d={svgPaths.p3338a080} fill="white" id="G" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p19c5d100} fill="white" id="E" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p2c4d4700} fill="white" id="T" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p19d9f400} fill="white" id="I" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p13448a00} fill="white" id="T_2" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p3d1107a0} fill="white" id="O" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p3f701d40} fill="white" id="N" stroke="white" strokeMiterlimit="10" strokeWidth="0.16" />
          </g>
          <g id="Google Play">
            <path d={svgPaths.p38881100} fill="white" id="Google Play_2" />
          </g>
        </g>
      </svg>
    </a>
  );
}

function StoreButtons() {
  return (
    <div className="absolute left-[811px] top-[52px]">
      <div className="absolute h-[53px] xl:h-[58px] 2xl:h-[63px] w-[185px] xl:w-[200px] 2xl:w-[219px]">
        <AppStoreButton />
      </div>
      <div className="absolute left-0 top-[73px] xl:top-[78px] 2xl:top-[83px] h-[43px] xl:h-[47px] 2xl:h-[51px] w-[148px] xl:w-[160px] 2xl:w-[175px]">
        <GooglePlayButton />
      </div>
    </div>
  );
}

function NeedHelp() {
  return (
    <div className="absolute bg-[#16bda0] h-[168px] left-0 overflow-clip rounded-[16px] top-0 w-[1368px]" data-name="needHelp">
      <Intro />
      <StoreButtons />
    </div>
  );
}

// Navigation Section Components
function BusinessSection({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const items = [
    'Partenariats', 
    'Annonceurs', 
    'Promoteurs', 
    'Logiciel de billeterie', 
    'Brand & Presse'
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[189px]" data-name="section">
      <p className="font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">FOR BUSINESS</p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-full" data-name="list">
        {items.map((item, index) => (
          <button 
            key={index}
            onClick={() => onNavigate('organizer-dashboard')}
            className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left w-full"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function BilleterieSection({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const items = [
    { label: 'Best of du mois', action: () => onNavigate('best-off') },
    { label: 'Tous les événements', action: () => onNavigate('events') },
    { label: 'Favoris', action: () => onNavigate('events', { filter: 'favorites' }) },
    { label: 'À la une', action: () => onNavigate('events', { filter: 'featured' }) }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[186px]" data-name="section">
      <p className="font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">BILLETERIE</p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-full" data-name="list">
        {items.map((item, index) => (
          <button 
            key={index}
            onClick={item.action}
            className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left w-full"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LiveSection({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const items = [
    { label: 'En live de ce mois', action: () => onNavigate('streaming', { filter: 'monthly' }) },
    { label: 'Tous les événements', action: () => onNavigate('streaming') },
    { label: 'Favoris', action: () => onNavigate('streaming', { filter: 'favorites' }) },
    { label: 'À la une', action: () => onNavigate('streaming', { filter: 'featured' }) }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[187px]" data-name="section">
      <p className="font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">EN LIVE</p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-full" data-name="list">
        {items.map((item, index) => (
          <button 
            key={index}
            onClick={item.action}
            className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left w-full"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BonPlanSection({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const items = [
    { label: 'Bon plans par semaine', action: () => onNavigate('deals', { filter: 'weekly' }) },
    { label: 'Tous nos bons plans', action: () => onNavigate('deals') },
    { label: '🎁 Feeti Na Feeti', action: () => onNavigate('feeti-na-feeti') }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[189px]" data-name="section">
      <p className="font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[#16bda0] text-[15px] tracking-[0.6px] uppercase w-full">BON PLAN</p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-full" data-name="list">
        {items.map((item, index) => (
          <button 
            key={index}
            onClick={item.action}
            className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left w-full"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickLinksSection({ onLegalPageNavigate }: { onLegalPageNavigate: (page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund') => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[193px]" data-name="section">
      <p className="font-bold leading-[1.4] min-w-full not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase">
        LIENS RAPIDES
      </p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-[277px]" data-name="list">
        <button 
          onClick={() => onLegalPageNavigate('faq')}
          className="min-w-full opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left"
        >
          FAQs
        </button>
        <button 
          onClick={() => onLegalPageNavigate('contact')}
          className="min-w-full opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left"
        >
          Nous contacter
        </button>
        <button 
          onClick={() => onLegalPageNavigate('terms')}
          className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 w-[266px] text-left"
        >
          Mentions légales
        </button>
        <button 
          onClick={() => onLegalPageNavigate('privacy')}
          className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 w-[316px] text-left"
        >
          Politiques de confidentialité
        </button>
        <button 
          onClick={() => onLegalPageNavigate('refund')}
          className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 w-[316px] text-left"
        >
          Politiques de remboursement
        </button>
      </div>
    </div>
  );
}

function LoisirSection({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const items = [
    { label: 'Restaurants', action: () => onNavigate('leisure', { category: 'restaurants' }) },
    { label: 'Hôtels', action: () => onNavigate('leisure', { category: 'hotels' }) },
    { label: 'Bars/Night', action: () => onNavigate('leisure', { category: 'bars' }) },
    { label: 'Loisir', action: () => onNavigate('leisure') }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0 w-[189px]" data-name="section">
      <p className="font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">LOISIR</p>
      <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[16px] xl:text-[18px] 2xl:text-[20px] text-white w-full" data-name="list">
        {items.map((item, index) => (
          <button 
            key={index}
            onClick={item.action}
            className="opacity-60 hover:opacity-100 hover:text-[#16bda0] transition-all duration-200 relative shrink-0 text-left w-full"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Nav({ onNavigate, onLegalPageNavigate }: { onNavigate: (page: string, params?: any) => void; onLegalPageNavigate: (page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund') => void }) {
  return (
    <div className="absolute content-stretch flex gap-[60px] items-start justify-start left-[9px] top-[218px] w-[1365px]" data-name="nav">
      <BusinessSection onNavigate={onNavigate} />
      <BilleterieSection onNavigate={onNavigate} />
      <LiveSection onNavigate={onNavigate} />
      <BonPlanSection onNavigate={onNavigate} />
      <LoisirSection onNavigate={onNavigate} />
      <QuickLinksSection onLegalPageNavigate={onLegalPageNavigate} />
    </div>
  );
}

// Contact Section
function ContactInfo() {
  return (
    <div className="content-stretch flex flex-col font-medium gap-[4px] items-end justify-start leading-[1.4] not-italic relative shrink-0 text-[#00bdd7] text-[20px] xl:text-[22px] 2xl:text-[24px] text-nowrap whitespace-pre" data-name="list">
      <a 
        href="tel:+242981-23-19" 
        className="relative shrink-0 hover:text-[#16bda0] transition-colors duration-200"
      >
        +242 981-23-19
      </a>
      <a 
        href="mailto:hello@logoipsum.com" 
        className="relative shrink-0 text-right hover:text-[#16bda0] transition-colors duration-200"
      >
        hello@logoipsum.com
      </a>
    </div>
  );
}

function Contacts() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-start left-[1164px] top-[104px] w-[260px]" data-name="CONTACTS">
      <div className="content-stretch flex flex-col gap-[64px] items-end justify-start relative shrink-0 w-full" data-name="col">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-[24px] items-end justify-start ml-0 mt-0 relative" data-name="contactUs">
            <div className="bg-[#00bdd7] h-[3px] shrink-0 w-[77px]" data-name="border" />
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
}

// Logo Section
function Logo({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  return (
    <button
      onClick={() => onNavigate('home')}
      className="absolute h-[69px] left-[81px] top-[82px] w-[276px] hover:opacity-80 transition-opacity duration-200" 
      data-name="logo"
    >
      {/* Logo Icon */}
      <div className="absolute bottom-0 left-[73.81%] right-0 top-0" data-name="Group">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 73 69">
          <g id="Group">
            <path d={svgPaths.p121ed80} fill="white" id="Vector" />
            <path d={svgPaths.p3cd33800} fill="#811AEC" id="Vector_2" />
            <path d={svgPaths.p3cb18100} fill="#F1C519" id="Vector_3" />
            <path d={svgPaths.p5e42700} fill="#E43962" id="Vector_4" />
            <path d={svgPaths.p2c04e100} fill="#16BDA0" id="Vector_5" />
            <path d={svgPaths.p16f13700} fill="#811AEC" id="Vector_6" />
            <path d={svgPaths.p3276d900} fill="#F1C519" id="Vector_7" />
            <path d={svgPaths.p381ee072} fill="#E43962" id="Vector_8" />
            <path d={svgPaths.p1d65a100} fill="#16BDA0" id="Vector_9" />
          </g>
        </svg>
      </div>
      
      {/* Logo Text */}
      <div className="absolute bottom-[8.01%] left-0 right-[28.1%] top-[8.01%]" data-name="Group">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 199 58">
          <g id="Group">
            <path d={svgPaths.p3e0edf00} fill="white" id="Vector" />
            <path d={svgPaths.pa7c9600} fill="white" id="Vector_2" />
            <path d={svgPaths.p3e8bf480} fill="white" id="Vector_3" />
            <path d={svgPaths.p3154e300} fill="white" id="Vector_4" />
            <path d={svgPaths.p1bf16c00} fill="white" id="Vector_5" />
          </g>
        </svg>
      </div>
    </button>
  );
}

// Modern Social Media Icons
function ModernSocialIcon({ 
  icon: Icon, 
  href, 
  label, 
  hoverColor = "hover:bg-[#16bda0]" 
}: { 
  icon: React.ComponentType<any>; 
  href: string; 
  label: string; 
  hoverColor?: string; 
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`
        w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
        flex items-center justify-center text-white/80 
        hover:text-white hover:scale-110 hover:border-[#16bda0]/50 ${hoverColor}
        transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl hover:shadow-[#16bda0]/25
      `}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function SocialMediaModern() {
  return (
    <div className="absolute bottom-8 right-8 flex gap-3 z-10">
      <ModernSocialIcon 
        icon={Facebook} 
        href="https://facebook.com/feeti" 
        label="Suivre Feeti sur Facebook"
        hoverColor="hover:bg-[#1877f2]"
      />
      <ModernSocialIcon 
        icon={Instagram} 
        href="https://instagram.com/feeti" 
        label="Suivre Feeti sur Instagram"
        hoverColor="hover:bg-gradient-to-r hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]"
      />
      <ModernSocialIcon 
        icon={Twitter} 
        href="https://twitter.com/feeti" 
        label="Suivre Feeti sur Twitter"
        hoverColor="hover:bg-[#1da1f2]"
      />
      <ModernSocialIcon 
        icon={Youtube} 
        href="https://youtube.com/feeti" 
        label="Chaîne YouTube Feeti"
        hoverColor="hover:bg-[#ff0000]"
      />
      <ModernSocialIcon 
        icon={Linkedin} 
        href="https://linkedin.com/company/feeti" 
        label="Suivre Feeti sur LinkedIn"
        hoverColor="hover:bg-[#0077b5]"
      />
    </div>
  );
}

// Original Social Media Section (for Figma layout compatibility)
function SocialIcon({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative shrink-0 size-[50px] hover:scale-110 transition-transform duration-200"
      data-name="item"
    >
      {children}
    </a>
  );
}

function SocialMedia() {
  return (
    <div className="absolute content-stretch flex gap-[50px] items-start justify-start left-[1194px] top-[219px] w-[230px]" data-name="group">
      <div className="content-stretch flex flex-col gap-[10px] items-start justify-start relative shrink-0" data-name="section">
        <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="list">
          <SocialIcon href="https://facebook.com">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
              <g id="item">
                <rect height="49" rx="24.5" stroke="white" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
                <path clipRule="evenodd" d={svgPaths.p3601f6f0} fill="#16BDA0" fillRule="evenodd" id="Vector" />
              </g>
            </svg>
          </SocialIcon>
          
          <SocialIcon href="https://twitter.com">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
              <g id="item">
                <rect height="49" rx="24.5" stroke="white" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
                <g id="Vector">
                  <path d={svgPaths.pa1d0ce0} fill="#16BDA0" />
                  <path clipRule="evenodd" d={svgPaths.p3bbda160} fill="#16BDA0" fillRule="evenodd" />
                </g>
              </g>
            </svg>
          </SocialIcon>
          
          <SocialIcon href="https://instagram.com">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
              <g id="item">
                <rect height="49" rx="24.5" stroke="white" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
                <g id="Vector">
                  <path d={svgPaths.p25d46f80} fill="#16BDA0" />
                  <path d={svgPaths.p3de23e00} fill="#16BDA0" />
                  <path d={svgPaths.p9891a00} fill="#16BDA0" />
                </g>
              </g>
            </svg>
          </SocialIcon>
          
          <SocialIcon href="https://youtube.com">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
              <g id="item">
                <rect height="49" rx="24.5" stroke="white" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
                <path d={svgPaths.p36a15c00} fill="#16BDA0" id="youtube" />
              </g>
            </svg>
          </SocialIcon>
        </div>
      </div>
    </div>
  );
}

// Main Section
function Top({ onNavigate, onLegalPageNavigate }: { onNavigate: (page: string, params?: any) => void; onLegalPageNavigate: (page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund') => void }) {
  return (
    <div className="absolute h-[424px] left-[72px] top-[305px] w-[1374px]" data-name="top">
      <NeedHelp />
      <Nav onNavigate={onNavigate} onLegalPageNavigate={onLegalPageNavigate} />
    </div>
  );
}

// Responsive Container
function ResponsiveContainer({ children, onNavigate, onLegalPageNavigate }: { 
  children: React.ReactNode; 
  onNavigate: (page: string, params?: any) => void;
  onLegalPageNavigate: (page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund') => void;
}) {
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Desktop: 1440px+ */}
      <div className="hidden 2xl:block w-full min-h-[780px]">
        <div className="relative w-[1440px] min-h-[780px] h-[780px] mx-auto">
          {children}
        </div>
      </div>

      {/* Tablet/Mobile: Responsive fallback */}
      <div className="2xl:hidden text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo, Icon et Social Media sur la même ligne */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo Text + Icon */}
            <button
              onClick={() => onNavigate('home')}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <svg className="w-[180px] h-[50px]" fill="none" viewBox="0 0 276 69">
                <g id="Group">
                  <path d={svgPaths.p121ed80} fill="white" id="Vector" />
                  <path d={svgPaths.p3cd33800} fill="#811AEC" id="Vector_2" />
                  <path d={svgPaths.p3cb18100} fill="#F1C519" id="Vector_3" />
                  <path d={svgPaths.p5e42700} fill="#E43962" id="Vector_4" />
                  <path d={svgPaths.p2c04e100} fill="#16BDA0" id="Vector_5" />
                  <path d={svgPaths.p16f13700} fill="#811AEC" id="Vector_6" />
                  <path d={svgPaths.p3276d900} fill="#F1C519" id="Vector_7" />
                  <path d={svgPaths.p381ee072} fill="#E43962" id="Vector_8" />
                  <path d={svgPaths.p1d65a100} fill="#16BDA0" id="Vector_9" />
                </g>
                <g id="Group_2">
                  <path d={svgPaths.p3e0edf00} fill="white" id="Vector_10" />
                  <path d={svgPaths.pa7c9600} fill="white" id="Vector_11" />
                  <path d={svgPaths.p3e8bf480} fill="white" id="Vector_12" />
                  <path d={svgPaths.p3154e300} fill="white" id="Vector_13" />
                  <path d={svgPaths.p1bf16c00} fill="white" id="Vector_14" />
                </g>
              </svg>
            </button>

            {/* Modern Social Media Icons */}
            <div className="flex gap-3">
              <ModernSocialIcon 
                icon={Facebook} 
                href="https://facebook.com/feeti" 
                label="Suivre Feeti sur Facebook"
                hoverColor="hover:bg-[#1877f2]"
              />
              <ModernSocialIcon 
                icon={Instagram} 
                href="https://instagram.com/feeti" 
                label="Suivre Feeti sur Instagram"
                hoverColor="hover:bg-gradient-to-r hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]"
              />
              <ModernSocialIcon 
                icon={Twitter} 
                href="https://twitter.com/feeti" 
                label="Suivre Feeti sur Twitter"
                hoverColor="hover:bg-[#1da1f2]"
              />
              <ModernSocialIcon 
                icon={Youtube} 
                href="https://youtube.com/feeti" 
                label="Chaîne YouTube Feeti"
                hoverColor="hover:bg-[#ff0000]"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[#16bda0] rounded-2xl p-6 sm:p-8 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-white text-xl sm:text-2xl font-medium mb-4">
                  Pour plus de possibilité ?
                </h2>
                <p className="text-white/90 text-base sm:text-lg">
                  Téléchargez votre application dès maintenant via le store de votre choix.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <AppStoreButton />
                <GooglePlayButton />
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-white/40 mb-6">FOR BUSINESS</h3>
              <nav className="space-y-3">
                <button onClick={() => onNavigate('organizer-dashboard')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Partenariats</button>
                <button onClick={() => onNavigate('organizer-dashboard')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Annonceurs</button>
                <button onClick={() => onNavigate('organizer-dashboard')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Promoteurs</button>
                <button onClick={() => onNavigate('organizer-dashboard')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Logiciel de billeterie</button>
                <button onClick={() => onNavigate('organizer-dashboard')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Brand & Presse</button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-white/40 mb-6">BILLETERIE</h3>
              <nav className="space-y-3">
                <button onClick={() => onNavigate('best-off')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Best of du mois</button>
                <button onClick={() => onNavigate('events')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Tous les événements</button>
                <button onClick={() => onNavigate('events', { filter: 'favorites' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Favoris</button>
                <button onClick={() => onNavigate('events', { filter: 'featured' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">À la une</button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-white/40 mb-6">EN LIVE</h3>
              <nav className="space-y-3">
                <button onClick={() => onNavigate('streaming', { filter: 'monthly' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">En live de ce mois</button>
                <button onClick={() => onNavigate('streaming')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Tous les événements</button>
                <button onClick={() => onNavigate('streaming', { filter: 'favorites' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Favoris</button>
                <button onClick={() => onNavigate('streaming', { filter: 'featured' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">À la une</button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-[#16bda0] mb-6">BON PLAN</h3>
              <nav className="space-y-3">
                <button onClick={() => onNavigate('deals', { filter: 'weekly' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Bon plans par semaine</button>
                <button onClick={() => onNavigate('deals')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Tous nos bons plans</button>
                <button onClick={() => onNavigate('feeti-na-feeti')} className="block text-[#16bda0] hover:text-[#16bda0] hover:scale-105 transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">🎁 Feeti Na Feeti</button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-white/40 mb-6">LOISIR</h3>
              <nav className="space-y-3">
                <button onClick={() => onNavigate('leisure', { category: 'restaurants' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Restaurants</button>
                <button onClick={() => onNavigate('leisure', { category: 'hotels' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Hôtels</button>
                <button onClick={() => onNavigate('leisure', { category: 'bars' })} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Bars/Night</button>
                <button onClick={() => onNavigate('leisure')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Loisir</button>
              </nav>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-white/40 mb-6">LIENS RAPIDES</h3>
              <nav className="space-y-3">
                <button onClick={() => onLegalPageNavigate('faq')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">FAQs</button>
                <button onClick={() => onLegalPageNavigate('contact')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Nous contacter</button>
                <button onClick={() => onLegalPageNavigate('terms')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Mentions légales</button>
                <button onClick={() => onLegalPageNavigate('privacy')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Politiques de confidentialité</button>
                <button onClick={() => onLegalPageNavigate('refund')} className="block text-white/60 hover:text-[#16bda0] transition-colors text-left text-[16px] xl:text-[18px] 2xl:text-[20px]">Politiques de remboursement</button>
              </nav>
            </div>
          </div>

          {/* Contact and Social */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="w-20 h-1 bg-[#00bdd7] mb-4 mx-auto sm:mx-0"></div>
              <div className="space-y-2">
                <a href="tel:+242981-23-19" className="block text-[#00bdd7] text-lg font-medium hover:text-[#16bda0] transition-colors">
                  +242 981-23-19
                </a>
                <a href="mailto:hello@logoipsum.com" className="block text-[#00bdd7] text-lg font-medium hover:text-[#16bda0] transition-colors">
                  hello@logoipsum.com
                </a>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <ModernSocialIcon 
                icon={Facebook} 
                href="https://facebook.com/feeti" 
                label="Suivre Feeti sur Facebook"
                hoverColor="hover:bg-[#1877f2]"
              />
              <ModernSocialIcon 
                icon={Instagram} 
                href="https://instagram.com/feeti" 
                label="Suivre Feeti sur Instagram"
                hoverColor="hover:bg-gradient-to-r hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]"
              />
              <ModernSocialIcon 
                icon={Twitter} 
                href="https://twitter.com/feeti" 
                label="Suivre Feeti sur Twitter"
                hoverColor="hover:bg-[#1da1f2]"
              />
              <ModernSocialIcon 
                icon={Youtube} 
                href="https://youtube.com/feeti" 
                label="Chaîne YouTube Feeti"
                hoverColor="hover:bg-[#ff0000]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer({ onNavigate, onLegalPageNavigate }: FooterProps) {
  return (
    <div className="bg-[#03033b]">
      <ResponsiveContainer onNavigate={onNavigate} onLegalPageNavigate={onLegalPageNavigate}>
        <Top onNavigate={onNavigate} onLegalPageNavigate={onLegalPageNavigate} />
        <Contacts />
        <Logo onNavigate={onNavigate} />
        <SocialMedia />
        <SocialMediaModern />
      </ResponsiveContainer>
    </div>
  );
}