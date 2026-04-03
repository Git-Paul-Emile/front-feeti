import svgPaths from "./svg-eoj7rxrgju";
import imgMPostCardOverlay1 from "figma:asset/ff252f1094e5c791473a90e1e329c64df201cfe0.png";
import imgRectangle55 from "figma:asset/062717b59242e68946200af0edeb40934d70e1f4.png";
import imgImage1 from "figma:asset/9ed60bed7d5d793e15349c6143e3ed7ca24b41c3.png";

function MPostCardOverlay1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[513px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[1512px]" data-name="m-post-card-overlay1">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[12px]">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[12px] size-full" src={imgMPostCardOverlay1} />
        <div className="absolute bg-[rgba(20,22,36,0.4)] inset-0 rounded-[12px]" />
      </div>
    </div>
  );
}

function TitrePage() {
  return (
    <div className="absolute box-border content-stretch flex gap-[10px] h-[513px] items-center justify-center left-1/2 px-[374px] py-[193px] top-[141px] translate-x-[-50%] w-[1512px]" data-name="TITRE PAGE">
      <MPostCardOverlay1 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute bottom-0 left-[73.81%] right-0 top-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 39">
        <g id="Group">
          <path d={svgPaths.pb4c4300} fill="var(--fill-0, #1A0957)" id="Vector" />
          <path d={svgPaths.p2a0dbb00} fill="var(--fill-0, #811AEC)" id="Vector_2" />
          <path d={svgPaths.p16d5e380} fill="var(--fill-0, #F1C519)" id="Vector_3" />
          <path d={svgPaths.p15cd3f80} fill="var(--fill-0, #E43962)" id="Vector_4" />
          <path d={svgPaths.pfe8d400} fill="var(--fill-0, #16BDA0)" id="Vector_5" />
          <path d={svgPaths.p3693380} fill="var(--fill-0, #811AEC)" id="Vector_6" />
          <path d={svgPaths.p1116dfc0} fill="var(--fill-0, #F1C519)" id="Vector_7" />
          <path d={svgPaths.p2022e980} fill="var(--fill-0, #E43962)" id="Vector_8" />
          <path d={svgPaths.p206aab00} fill="var(--fill-0, #16BDA0)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute bottom-[8.01%] left-0 right-[28.1%] top-[8.01%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 113 33">
        <g id="Group">
          <path d={svgPaths.p2d591880} fill="var(--fill-0, #1A0957)" id="Vector" />
          <path d={svgPaths.p3aaf32c0} fill="var(--fill-0, #1A0957)" id="Vector_2" />
          <path d={svgPaths.p87ab6f0} fill="var(--fill-0, #1A0957)" id="Vector_3" />
          <path d={svgPaths.p20a2e100} fill="var(--fill-0, #1A0957)" id="Vector_4" />
          <path d={svgPaths.p66cf900} fill="var(--fill-0, #1A0957)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[39px] relative shrink-0 w-[156px]" data-name="logo">
      <Group />
      <Group2 />
    </div>
  );
}

function Navlink() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-center ml-0 mt-[3px] relative" data-name="navlink">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">Acceuil</p>
    </div>
  );
}

function Navlink1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">Billeterie</p>
    </div>
  );
}

function IconPack() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon pack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon pack">
          <path d={svgPaths.p35d5c400} fill="var(--fill-0, #03033B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function NavlinkDropdown() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center ml-[99px] mt-[3px] relative" data-name="navlink_dropdown">
      <Navlink1 />
      <IconPack />
    </div>
  );
}

function Navlink2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">En live</p>
    </div>
  );
}

function IconPack1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon pack">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon pack">
          <path d={svgPaths.p35d5c400} fill="var(--fill-0, #03033B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function NavlinkDropdown1() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center ml-[245px] mt-[3px] relative" data-name="navlink_dropdown">
      <Navlink2 />
      <IconPack1 />
    </div>
  );
}

function Navlink3() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-center ml-[371px] mt-[3px] relative" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">Bon plan</p>
    </div>
  );
}

function Navlink4() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-center ml-[484px] mt-[3px] relative" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">{`Loisirs `}</p>
    </div>
  );
}

function Navlink5() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-center ml-[576px] mt-[3px] relative" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#03033b] text-[20px] text-nowrap whitespace-pre">Replay</p>
    </div>
  );
}

function Navlink6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">Poster l’annonce</p>
    </div>
  );
}

function Megaphone2BullhornLoudMegaphoneShareSpeakerTransmit() {
  return (
    <div className="absolute inset-[10.33%_3.57%_10.29%_3.57%]" data-name="megaphone-2--bullhorn-loud-megaphone-share-speaker-transmit">
      <div className="absolute inset-[-3.94%_-3.37%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
          <g id="megaphone-2--bullhorn-loud-megaphone-share-speaker-transmit">
            <path d={svgPaths.p282623a0} id="Vector" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p1e610600} id="Vector_2" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p22c84440} id="Vector_3" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Megaphone2BullhornLoudMegaphoneShareSpeakerTransmit1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="megaphone-2--bullhorn-loud-megaphone-share-speaker-transmit">
      <Megaphone2BullhornLoudMegaphoneShareSpeakerTransmit />
    </div>
  );
}

function Frame116() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-start left-[11px] top-[7px]">
      <Navlink6 />
      <Megaphone2BullhornLoudMegaphoneShareSpeakerTransmit1 />
    </div>
  );
}

function Btn1() {
  return (
    <div className="[grid-area:1_/_1] bg-[#03033b] h-[31px] ml-0 mt-0 relative rounded-[24px] w-[151px]" data-name="Btn1">
      <Frame116 />
    </div>
  );
}

function UserSingleNeutralMaleCloseGeometricHumanPersonSingleUpUserMale() {
  return (
    <div className="absolute inset-[3.83%_5.86%_3.57%_5.86%]" data-name="user-single-neutral-male--close-geometric-human-person-single-up-user-male">
      <div className="absolute inset-[-3.86%_-4.05%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
          <g id="user-single-neutral-male--close-geometric-human-person-single-up-user-male">
            <path d={svgPaths.p7de23f0} id="Vector" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p10c13680} id="Vector_2" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.pfc56c00} id="Ellipse 592" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p3af04900} id="Intersect" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function UserSingleNeutralMaleCloseGeometricHumanPersonSingleUpUserMale1() {
  return (
    <div className="absolute inset-[25.81%_29.03%_29.03%_25.81%] overflow-clip" data-name="user-single-neutral-male--close-geometric-human-person-single-up-user-male">
      <UserSingleNeutralMaleCloseGeometricHumanPersonSingleUpUserMale />
    </div>
  );
}

function Btn3ProfilCercle() {
  return (
    <div className="[grid-area:1_/_1] ml-[161px] mt-0 relative size-[31px]" data-name="btn3-profil-cercle">
      <div className="absolute inset-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <circle cx="15.5" cy="15.5" fill="var(--fill-0, #03033B)" id="Ellipse 1" r="15.5" />
        </svg>
      </div>
      <UserSingleNeutralMaleCloseGeometricHumanPersonSingleUpUserMale1 />
    </div>
  );
}

function Group6() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[670px] mt-0 place-items-start relative">
      <Btn1 />
      <Btn3ProfilCercle />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Navlink />
      <NavlinkDropdown />
      <NavlinkDropdown1 />
      <Navlink3 />
      <Navlink4 />
      <Navlink5 />
      <Group6 />
    </div>
  );
}

function Navbar() {
  return (
    <div className="absolute bg-white box-border content-stretch flex h-[90px] items-center justify-between left-0 px-[75px] py-[24px] top-[49px] w-[1512px]" data-name="Navbar">
      <Logo />
      <Group5 />
    </div>
  );
}

function Navlink7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="navlink">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[8px] text-nowrap text-white whitespace-pre">Votre position</p>
    </div>
  );
}

function Frame117() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-start left-[16px] top-[6px]">
      <Navlink7 />
    </div>
  );
}

function LocationPin3NavigationMapMapsPinGpsLocation() {
  return (
    <div className="absolute inset-[30.72%_13.9%_27.34%_77.49%]" data-name="location-pin-3--navigation-map-maps-pin-gps-location">
      <div className="absolute inset-[-5.68%_-5.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
          <g id="location-pin-3--navigation-map-maps-pin-gps-location">
            <path d={svgPaths.p141107f0} id="Vector" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p2bd6c700} id="Vector_2" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p5697550} id="Vector_3" stroke="var(--stroke-0, #00BDD7)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group1597884486() {
  return (
    <div className="absolute contents left-[16px] top-[6px]">
      <Frame117 />
      <LocationPin3NavigationMapMapsPinGpsLocation />
    </div>
  );
}

function Btn2Map() {
  return (
    <div className="h-[21px] relative rounded-[24px] shrink-0 w-[101px]" data-name="Btn2-map">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[24px]" />
      <Group1597884486 />
    </div>
  );
}

function Btn3ProfilCercle1() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
      <circle cx="15.5" cy="15.5" fill="var(--fill-0, white)" id="Ellipse 1" r="15.5" />
    </svg>
  );
}

function Icon() {
  return (
    <div className="relative size-full" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
        <g id="Icon">
          <path d={svgPaths.p17a89000} fill="var(--fill-0, #16BEA1)" id="Vector" />
          <path d={svgPaths.pc882740} fill="var(--fill-0, #16BEA1)" id="Vector_2" />
          <path d={svgPaths.p30a24100} fill="var(--fill-0, #16BEA1)" id="Vector_3" />
          <path d={svgPaths.p12835900} fill="var(--fill-0, #16BEA1)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Playstore() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[31px]" data-name="playstore">
      <Btn3ProfilCercle1 />
      <div className="absolute flex inset-[25.81%_22.58%_21.9%_29.03%] items-center justify-center">
        <div className="flex-none h-[16.211px] scale-y-[-100%] w-[15px]">
          <Icon />
        </div>
      </div>
    </div>
  );
}

function Btn3ProfilCercle2() {
  return (
    <div className="absolute left-0 size-[31px] top-0" data-name="btn3-profil-cercle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
        <circle cx="15.5" cy="15.5" fill="var(--fill-0, white)" id="Ellipse 1" r="15.5" />
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[18.174px] relative shrink-0 w-[15.165px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 19">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.pbb91e00} fill="#16BEA1" />
            <path d={svgPaths.p3b420680} fill="#16BEA1" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Appstor() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex items-center justify-between ml-[55px] mt-0 px-[8px] py-[6px] relative size-[31px]" data-name="appstor">
      <Btn3ProfilCercle2 />
      <Icon1 />
    </div>
  );
}

function Group18274() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Playstore />
      <Appstor />
    </div>
  );
}

function Frame118() {
  return (
    <div className="absolute bg-[#1a0957] box-border content-stretch flex h-[50px] items-center justify-between left-0 px-[75px] py-[9px] top-0 w-[1512px]">
      <Btn2Map />
      <Group18274 />
    </div>
  );
}

function Group143726136() {
  return (
    <div className="absolute contents left-0 top-0">
      <Navbar />
      <Frame118 />
    </div>
  );
}

function Intro() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-start left-[99px] not-italic text-gray-50 top-[32px]" data-name="intro">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.2] relative shrink-0 text-[28px] text-nowrap tracking-[-0.28px] whitespace-pre">Pour plus de possibilité ?</p>
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] opacity-90 relative shrink-0 text-[22px] w-[491px]">Telechargez votre application des maintenant via le store de votre choix .</p>
    </div>
  );
}

function Group3() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 219 63">
      <g id="Group">
        <g id="BG"></g>
        <path d={svgPaths.p2bc36570} fill="var(--fill-0, white)" id="Border" />
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p4d9a600} fill="white" />
            <path d={svgPaths.p2ac9c700} fill="white" />
          </g>
        </g>
        <g id="Download on the">
          <path d={svgPaths.p1e941500} fill="var(--fill-0, white)" id="D" />
          <path d={svgPaths.p2b732800} fill="var(--fill-0, white)" id="o" />
          <path d={svgPaths.p279c7900} fill="var(--fill-0, white)" id="w" />
          <path d={svgPaths.p6f64f00} fill="var(--fill-0, white)" id="n" />
          <path d={svgPaths.pb944b2} fill="var(--fill-0, white)" id="l" />
          <path d={svgPaths.p30718700} fill="var(--fill-0, white)" id="o_2" />
          <path d={svgPaths.pf729100} fill="var(--fill-0, white)" id="a" />
          <path d={svgPaths.p1b32b680} fill="var(--fill-0, white)" id="d" />
          <path d={svgPaths.p394c8e80} fill="var(--fill-0, white)" id="o_3" />
          <path d={svgPaths.p2afb41f0} fill="var(--fill-0, white)" id="n_2" />
          <path d={svgPaths.p11dffc00} fill="var(--fill-0, white)" id="t" />
          <path d={svgPaths.p3bf23080} fill="var(--fill-0, white)" id="h" />
          <path d={svgPaths.p23575480} fill="var(--fill-0, white)" id="e" />
        </g>
        <g id="App Store">
          <path d={svgPaths.p33fdb680} fill="var(--fill-0, white)" id="A" />
          <path d={svgPaths.p33c89b00} fill="var(--fill-0, white)" id="p" />
          <path d={svgPaths.p353a1100} fill="var(--fill-0, white)" id="p_2" />
          <path d={svgPaths.p3f265480} fill="var(--fill-0, white)" id="S" />
          <path d={svgPaths.p32083d40} fill="var(--fill-0, white)" id="t_2" />
          <path d={svgPaths.p677c700} fill="var(--fill-0, white)" id="o_4" />
          <path d={svgPaths.pb93a980} fill="var(--fill-0, white)" id="r" />
          <path d={svgPaths.p22860dc0} fill="var(--fill-0, white)" id="e_2" />
        </g>
      </g>
    </svg>
  );
}

function AppStore1() {
  return (
    <div className="absolute h-[63px] left-[811px] top-[52px] w-[218.077px]" data-name="App Store">
      <Group3 />
    </div>
  );
}

function Google() {
  return (
    <div className="h-[50.4px] relative w-[174.462px]" data-name="google">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 175 51">
        <g id="google ">
          <g id="BG"></g>
          <path d={svgPaths.ped38a80} fill="var(--fill-0, white)" id="Border" />
          <g id="Icon">
            <path d={svgPaths.p3e24600} fill="var(--fill-0, white)" id="Vector" />
            <path d={svgPaths.p206b8300} fill="var(--fill-0, white)" id="Vector_2" />
            <path d={svgPaths.p324dfe00} fill="var(--fill-0, white)" id="Vector_3" />
            <path d={svgPaths.p132df700} fill="var(--fill-0, white)" id="Vector_4" />
          </g>
          <g id="GET IT ON">
            <path d={svgPaths.p3338a080} fill="var(--fill-0, white)" id="G" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p19c5d100} fill="var(--fill-0, white)" id="E" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p2c4d4700} fill="var(--fill-0, white)" id="T" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p19d9f400} fill="var(--fill-0, white)" id="I" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p13448a00} fill="var(--fill-0, white)" id="T_2" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p3d1107a0} fill="var(--fill-0, white)" id="O" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
            <path d={svgPaths.p3f701d40} fill="var(--fill-0, white)" id="N" stroke="var(--stroke-0, white)" strokeMiterlimit="10" strokeWidth="0.16" />
          </g>
          <g id="Google Play">
            <path d={svgPaths.p38881100} fill="var(--fill-0, white)" id="Google Play_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[811px] top-[52px]">
      <AppStore1 />
      <div className="absolute flex h-[62.988px] items-center justify-center left-[1052.9px] top-[52px] w-[218.066px]">
        <div className="flex-none scale-x-[125%] scale-y-[-125%]">
          <Google />
        </div>
      </div>
    </div>
  );
}

function NeedHelp() {
  return (
    <div className="absolute bg-[#16bda0] h-[168px] left-0 overflow-clip rounded-[16px] top-0 w-[1368px]" data-name="needHelp">
      <Intro />
      <Group1 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-[20px] text-white w-full" data-name="list">
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>
        Partenariats
      </p>
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>{`Annonceurs `}</p>
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>{`Promoteurs `}</p>
      <p className="opacity-60 relative shrink-0 w-[207px]">Logiciel de billeterie</p>
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>{`Brand & Presse `}</p>
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[189px]" data-name="section">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">For business</p>
      <List />
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-[20px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">Ventilation</p>
      <p className="opacity-60 relative shrink-0 w-full">Air conditioning</p>
      <p className="opacity-60 relative shrink-0 w-full">Installation</p>
    </div>
  );
}

function Section1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[186px]" data-name="section">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">BILLETERIE</p>
      <List1 />
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-[20px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">{`Live de ce mois `}</p>
      <p className="opacity-60 relative shrink-0 w-full">Design</p>
      <p className="opacity-60 relative shrink-0 w-full">Air conditioning</p>
      <p className="opacity-60 relative shrink-0 w-full">Replays</p>
    </div>
  );
}

function Section2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[187px]" data-name="section">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase w-full">EN LIVE</p>
      <List2 />
    </div>
  );
}

function List3() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-[20px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">{`Loisirs `}</p>
      <p className="opacity-60 relative shrink-0 w-full">{`Restaurants & Bar`}</p>
      <p className="opacity-60 relative shrink-0 w-full">Shopping</p>
      <p className="opacity-60 relative shrink-0 w-full">Escapades</p>
    </div>
  );
}

function Section3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[189px]" data-name="section">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[1.4] not-italic opacity-40 relative shrink-0 text-[#16bda0] text-[15px] tracking-[0.6px] uppercase w-full">{`BON PLAN `}</p>
      <List3 />
    </div>
  );
}

function List4() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-[20px] text-white w-[277px]" data-name="list">
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>
        FAQs
      </p>
      <p className="min-w-full opacity-60 relative shrink-0" style={{ width: "min-content" }}>
        Nous contacter
      </p>
      <p className="opacity-60 relative shrink-0 w-[266px]">Mentions légales</p>
      <p className="opacity-60 relative shrink-0 w-[316px]">Politiques de confidentialité</p>
      <p className="opacity-60 relative shrink-0 w-[316px]">Politiques de remboursement</p>
    </div>
  );
}

function Section4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[193px]" data-name="section">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[1.4] min-w-full not-italic opacity-40 relative shrink-0 text-[15px] text-white tracking-[0.6px] uppercase" style={{ width: "min-content" }}>
        LIENS RAPIDES
      </p>
      <List4 />
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute content-stretch flex gap-[83px] items-start left-[9px] top-[218px] w-[1365px]" data-name="nav">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}

function Top() {
  return (
    <div className="absolute h-[424px] left-[72px] top-[233px] w-[1374px]" data-name="top">
      <NeedHelp />
      <Nav />
    </div>
  );
}

function List5() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Medium',_sans-serif] font-medium gap-[4px] items-end leading-[1.4] not-italic relative shrink-0 text-[#00bdd7] text-[24px] text-nowrap whitespace-pre" data-name="list">
      <p className="relative shrink-0">+242 981-23-19</p>
      <p className="relative shrink-0 text-right">hello@logoipsum.com</p>
    </div>
  );
}

function ContactUs() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-[24px] items-end ml-0 mt-0 relative" data-name="contactUs">
      <div className="bg-[#00bdd7] h-[3px] shrink-0 w-[77px]" data-name="border" />
      <List5 />
    </div>
  );
}

function Group18281() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <ContactUs />
    </div>
  );
}

function Col() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-end relative shrink-0 w-full" data-name="col">
      <Group18281 />
    </div>
  );
}

function Contacts() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[13px] items-end left-[1164px] top-[32px] w-[260px]" data-name="CONTACTS">
      <Col />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute bottom-0 left-[73.81%] right-0 top-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 73 69">
        <g id="Group">
          <path d={svgPaths.p121ed80} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p3cd33800} fill="var(--fill-0, #811AEC)" id="Vector_2" />
          <path d={svgPaths.p3cb18100} fill="var(--fill-0, #F1C519)" id="Vector_3" />
          <path d={svgPaths.p5e42700} fill="var(--fill-0, #E43962)" id="Vector_4" />
          <path d={svgPaths.p2c04e100} fill="var(--fill-0, #16BDA0)" id="Vector_5" />
          <path d={svgPaths.p16f13700} fill="var(--fill-0, #811AEC)" id="Vector_6" />
          <path d={svgPaths.p3276d900} fill="var(--fill-0, #F1C519)" id="Vector_7" />
          <path d={svgPaths.p381ee072} fill="var(--fill-0, #E43962)" id="Vector_8" />
          <path d={svgPaths.p1d65a100} fill="var(--fill-0, #16BDA0)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute bottom-[8.01%] left-0 right-[28.1%] top-[8.01%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 199 58">
        <g id="Group">
          <path d={svgPaths.p3e0edf00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pa7c9600} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p3e8bf480} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p3154e300} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p1bf16c00} fill="var(--fill-0, white)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function Logo1() {
  return (
    <div className="absolute h-[69px] left-[81px] top-[82px] w-[276px]" data-name="logo">
      <Group7 />
      <Group8 />
    </div>
  );
}

function Item() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="item">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="item">
          <rect height="49" rx="24.5" stroke="var(--stroke-0, white)" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
          <path clipRule="evenodd" d={svgPaths.p3601f6f0} fill="var(--fill-0, #16BDA0)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Item1() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="item">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="item">
          <rect height="49" rx="24.5" stroke="var(--stroke-0, white)" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
          <g id="Vector">
            <path d={svgPaths.pa1d0ce0} fill="#16BDA0" />
            <path clipRule="evenodd" d={svgPaths.p3bbda160} fill="#16BDA0" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="item">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="item">
          <rect height="49" rx="24.5" stroke="var(--stroke-0, white)" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
          <g id="Vector">
            <path d={svgPaths.p25d46f80} fill="#16BDA0" />
            <path d={svgPaths.p3de23e00} fill="#16BDA0" />
            <path d={svgPaths.p9891a00} fill="#16BDA0" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Item3() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="item">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="item">
          <rect height="49" rx="24.5" stroke="var(--stroke-0, white)" strokeOpacity="0.25" width="49" x="0.5" y="0.5" />
          <path d={svgPaths.p36a15c00} fill="var(--fill-0, #16BDA0)" id="youtube" />
        </g>
      </svg>
    </div>
  );
}

function List6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="list">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Section5() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0" data-name="section">
      <List6 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute content-stretch flex gap-[50px] items-start left-[1194px] top-[147px]" data-name="group">
      <Section5 />
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[#03033b] h-[719px] left-[-6px] overflow-clip top-[2947px] w-[1518px]" data-name="footer">
      <Top />
      <Contacts />
      <Logo1 />
      <Group9 />
    </div>
  );
}

function Group143726098() {
  return (
    <div className="absolute contents top-[36px] translate-x-[-50%]" style={{ left: "calc(50% - 7.5px)" }}>
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[48px] leading-[1.005] not-italic text-[#000441] text-[64px] text-center top-[36px] translate-x-[-50%] w-[646px]" style={{ left: "calc(50% - 7.5px)" }}>
        Samba Lodge
      </p>
    </div>
  );
}

function Group143726105() {
  return (
    <div className="absolute contents top-[36px] translate-x-[-50%]" style={{ left: "calc(50% - 7.5px)" }}>
      <Group143726098 />
    </div>
  );
}

function Group143726124() {
  return (
    <div className="absolute contents top-[36px] translate-x-[-50%]" style={{ left: "calc(50% - 7.5px)" }}>
      <Group143726105 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute left-0 size-[16px] top-[2px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Frame">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Span() {
  return (
    <div className="absolute h-[20px] left-[20px] top-0 w-[99.82px]" data-name="Span">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[16px] justify-center leading-[0] left-0 not-italic text-[15px] text-white top-[10px] translate-y-[-50%] w-[135px]">
        <p className="leading-[20px]">Kingdom Tower</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[20px] left-[159px] top-[580px] w-[366px]" data-name="Container">
      <Frame />
      <Span />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-[12px] size-[23px] top-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Frame">
          <path d="M11.5 19.1667H11.5096" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p5820b00} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p372b5800} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p23486a80} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-gray-100 left-[980px] rounded-[9999px] size-[48px] top-[559px]" data-name="Container">
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-[12.29px] size-[23px] top-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Frame">
          <path d={svgPaths.p338d5280} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p151ad3c0} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3a775a00} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-gray-100 left-[1041.71px] rounded-[9999px] size-[48px] top-[559px]" data-name="Container">
      <Frame2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute left-[11.57px] size-[23px] top-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g clipPath="url(#clip0_140_1591)" id="Frame">
          <path d={svgPaths.p3ab32300} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p2a8f698} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3bd8b6b0} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p33ab5f80} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M9.2 13.8L13.8 9.2" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_140_1591">
            <rect fill="white" height="23" width="23" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-gray-100 left-[1103.43px] rounded-[9999px] size-[48px] top-[559px]" data-name="Container">
      <Frame3 />
    </div>
  );
}

function Group143726144() {
  return (
    <div className="absolute contents left-[980px] top-[559px]">
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}

function Group143726145() {
  return (
    <div className="absolute contents left-[159px] top-[559px]">
      <Container />
      <Group143726144 />
    </div>
  );
}

function Group143726148() {
  return (
    <div className="absolute contents left-[122px] top-[140px]">
      <div className="absolute flex h-[515.141px] items-center justify-center left-[122px] top-[140px] w-[1077.71px]">
        <div className="flex-none rotate-[0.167deg]">
          <div className="h-[512px] relative rounded-[24px] w-[1076.22px]">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgRectangle55} />
          </div>
        </div>
      </div>
      <Group143726145 />
    </div>
  );
}

function Group10() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55 63">
      <g id="Group">
        <path d={svgPaths.paeaa700} fill="var(--fill-0, #100F0F)" id="Vector" />
        <path d={svgPaths.p1013b900} fill="var(--fill-0, #100F0F)" id="Vector_2" />
      </g>
    </svg>
  );
}

function ArrowDroite() {
  return (
    <div className="absolute inset-[92.35%_52.07%_1.25%_43.79%]" data-name="arrow droite">
      <Group10 />
    </div>
  );
}

function ArrowGauche() {
  return (
    <div className="relative size-full" data-name="arrow gauche">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 63">
        <g id="arrow gauche">
          <path d={svgPaths.p2a2d9900} fill="var(--fill-0, #100F0F)" id="Vector" />
          <path d={svgPaths.pdbff80} fill="var(--fill-0, #100F0F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group143726096() {
  return (
    <div className="absolute contents inset-[92.35%_40.26%_1.25%_38.22%]">
      <ArrowDroite />
      <div className="absolute flex inset-[92.35%_57.49%_1.25%_38.22%] items-center justify-center">
        <div className="flex-none h-[62.724px] rotate-[180deg] w-[57px]">
          <ArrowGauche />
        </div>
      </div>
      <div className="absolute inset-[94.21%_47.93%_3%_50.19%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 28">
          <ellipse cx="12.5" cy="13.6853" fill="var(--fill-0, #565656)" id="Ellipse 441" rx="12.5" ry="13.6853" />
        </svg>
      </div>
      <div className="absolute inset-[94.21%_40.26%_3%_57.86%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 28">
          <ellipse cx="12.5" cy="13.6853" fill="var(--fill-0, #100F0F)" id="Ellipse 444" rx="12.5" ry="13.6853" />
        </svg>
      </div>
      <div className="absolute inset-[94.21%_44.24%_3%_53.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 28">
          <ellipse cx="12.5" cy="13.6853" fill="var(--fill-0, #100F0F)" id="Ellipse 442" rx="12.5" ry="13.6853" />
        </svg>
      </div>
    </div>
  );
}

function Frame143726139() {
  return (
    <div className="absolute bg-white h-[980px] overflow-clip rounded-[33px] top-[398px] w-[1329px]" style={{ left: "calc(6.25% + 1.5px)" }}>
      <Group143726124 />
      <Group143726148 />
      <div className="absolute flex h-[208.14px] items-center justify-center left-[122px] top-[676px] w-[254.856px]">
        <div className="flex-none rotate-[0.152deg] skew-x-[359.967deg]">
          <div className="h-[207.471px] relative rounded-[24px] w-[254.197px]">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgRectangle55} />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[208.14px] items-center justify-center left-[396.38px] top-[676px] w-[254.856px]">
        <div className="flex-none rotate-[0.152deg] skew-x-[359.967deg]">
          <div className="h-[207.471px] relative rounded-[24px] w-[254.197px]">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgRectangle55} />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[208.14px] items-center justify-center left-[670.76px] top-[676px] w-[254.856px]">
        <div className="flex-none rotate-[0.152deg] skew-x-[359.967deg]">
          <div className="h-[207.471px] relative rounded-[24px] w-[254.197px]">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgRectangle55} />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[208.14px] items-center justify-center left-[945.13px] top-[676px] w-[254.856px]">
        <div className="flex-none rotate-[0.152deg] skew-x-[359.967deg]">
          <div className="h-[207.471px] relative rounded-[24px] w-[254.197px]">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgRectangle55} />
          </div>
        </div>
      </div>
      <Group143726096 />
    </div>
  );
}

function Group4() {
  return (
    <div className="relative size-full">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 59">
        <g id="Group 4">
          <path d={svgPaths.p36774d00} fill="var(--fill-0, #BF360C)" id="Vector" />
          <path d={svgPaths.p15037900} fill="var(--fill-0, #BF360C)" id="Vector_2" />
          <path d={svgPaths.p3f237f80} fill="var(--fill-0, #BF360C)" id="Vector_3" />
          <path d={svgPaths.p121a4300} fill="var(--fill-0, #BF360C)" id="Vector_4" />
          <path d={svgPaths.p1a47aaf0} fill="var(--fill-0, #BF360C)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents left-[139px] top-[872.62px]">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[normal] left-[139px] not-italic text-[15px] text-nowrap text-white top-[872.62px] whitespace-pre">Agregar nuevo lugar</p>
    </div>
  );
}

function Mp() {
  return (
    <div className="bg-white h-[1329px] overflow-clip relative rounded-[20px] w-[576px]" data-name="mp">
      <div className="absolute h-[1329px] left-0 top-0 w-[576px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute flex inset-[48.64%_55.17%_48.53%_34.61%] items-center justify-center">
        <div className="flex-none h-[58.843px] rotate-[90deg] w-[37.682px]">
          <Group4 />
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[normal] left-[50.4px] not-italic text-[#0a0909] text-[15px] top-[780.5px] w-[248px]">Casa</p>
      <Group11 />
    </div>
  );
}

export default function LoisirsPageDescription() {
  return (
    <div className="bg-white relative size-full" data-name="Loisirs-page-description">
      <TitrePage />
      <div className="absolute bg-[#d9d9d9] h-[31px] rounded-[24px] top-[-281px] w-[120px]" style={{ left: "calc(50% + 12px)" }} />
      <Group143726136 />
      <Footer />
      <Frame143726139 />
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[677px] justify-center leading-[24px] not-italic text-[24px] text-gray-600 text-justify top-[1798.5px] translate-y-[-50%] w-[1078px]" style={{ left: "calc(12.5% + 29px)" }}>
        <p className="mb-0">Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. Dans id cursus mi pretium tellus duis convallis. Tempus leo eu énéen sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia entier nunc posuere. Ut hendrerit sempre vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. Dans id cursus mi pretium tellus duis convallis. Tempus leo eu énéen sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia entier nunc posuere. Ut hendrerit sempre vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. Dans id cursus mi pretium tellus duis convallis. Tempus leo eu énéen sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia entier nunc posuere. Ut hendrerit sempre vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. Dans id cursus mi pretium tellus duis convallis. Tempus leo eu énéen sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia entier nunc posuere. Ut hendrerit sempre vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. Dans id cursus mi pretium tellus duis convallis. Tempus leo eu énéen sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia entier nunc posuere. Ut hendrerit sempre vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
      </div>
      <div className="absolute flex h-[575.984px] items-center justify-center top-[2254px] w-[1329px]" style={{ left: "calc(6.25% - 3.5px)" }}>
        <div className="flex-none rotate-[270deg]">
          <Mp />
        </div>
      </div>
    </div>
  );
}