import svgPaths from "./svg-pgf9xqt80w";
import imgImage6 from "figma:asset/3a047c0caf5122fb450be10d8e36fbed03f5e23d.png";
import imgImage4 from "figma:asset/9410e591510d407fcfa1f04d765e07a76a3c14d8.png";
import imgImage5 from "figma:asset/a4b946f238adec33a9c05d3a1c7f41fe4d8b1eb0.png";
import imgImage7 from "figma:asset/1a63f359de314a186c5388b47085743166b481a0.png";
import imgImage8 from "figma:asset/08c3adfaf682d943fd57263728b75106ff53584e.png";
import imgImage9 from "figma:asset/a78d12acd8013335a708b1d3299fa67dea821c2f.png";
import imgImage10 from "figma:asset/048763dcef3dac0c99bc05231149ecce12c9363a.png";
import imgImage11 from "figma:asset/ecdcdfb738ab87207140eebbdf979563289c777e.png";

function Logo() {
  return (
    <div className="relative size-full" data-name="logo">
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
    </div>
  );
}

function Intro() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start justify-start not-italic relative shrink-0 text-gray-50" data-name="intro">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.2] relative shrink-0 text-[28px] text-nowrap tracking-[-0.28px] whitespace-pre">Do you need help?</p>
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] opacity-60 relative shrink-0 text-[14px] w-[491px]">We will provide detailed information about our services, types of work, and top projects. We will calculate the cost and prepare a commercial proposal.</p>
    </div>
  );
}

function Btn() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-start relative shrink-0" data-name="btn">
      <div className="absolute size-[480px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Ellipse" style={{ left: "calc(50% + 0.5px)" }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 480 480">
          <circle cx="240" cy="240" fill="var(--fill-0, #383E4D)" id="Ellipse" r="240" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[20px] text-nowrap text-white whitespace-pre">Get consultation</p>
      <div className="h-[8px] relative shrink-0 w-[15px]" data-name="Vector">
        <div className="absolute inset-[-9.38%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 10">
            <path d="M1 5H16M16 5L12 1M16 5L12 9" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function NeedHelp() {
  return (
    <div className="bg-[#2d323e] relative rounded-[16px] shrink-0 w-full" data-name="needHelp">
      <div className="flex flex-row items-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pl-[48px] pr-[96px] py-[32px] relative w-full">
          <Intro />
          <Btn />
        </div>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[14px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">Ventilation</p>
      <p className="opacity-60 relative shrink-0 w-full">Design</p>
      <p className="opacity-60 relative shrink-0 w-full">Air conditioning</p>
      <p className="opacity-60 relative shrink-0 w-full">Installation</p>
    </div>
  );
}

function Section() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="section">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic opacity-40 relative shrink-0 text-[10px] text-white tracking-[0.4px] uppercase w-full">For business</p>
      <List />
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[14px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">Ventilation</p>
      <p className="opacity-60 relative shrink-0 w-full">Air conditioning</p>
      <p className="opacity-60 relative shrink-0 w-full">Installation</p>
    </div>
  );
}

function Section1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="section">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic opacity-40 relative shrink-0 text-[10px] text-white tracking-[0.4px] uppercase w-full">For House</p>
      <List1 />
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[14px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">Ventilation</p>
      <p className="opacity-60 relative shrink-0 w-full">Design</p>
      <p className="opacity-60 relative shrink-0 w-full">Air conditioning</p>
      <p className="opacity-60 relative shrink-0 w-full">Installation</p>
    </div>
  );
}

function Section2() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="section">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic opacity-40 relative shrink-0 text-[10px] text-white tracking-[0.4px] uppercase w-full">For flat</p>
      <List2 />
    </div>
  );
}

function List3() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-[4px] items-start justify-start leading-[1.4] not-italic relative shrink-0 text-[14px] text-white w-full" data-name="list">
      <p className="opacity-60 relative shrink-0 w-full">About us</p>
      <p className="opacity-60 relative shrink-0 w-full">Works</p>
      <p className="opacity-60 relative shrink-0 w-full">Contacts</p>
    </div>
  );
}

function Section3() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="section">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic opacity-40 relative shrink-0 text-[10px] text-white tracking-[0.4px] uppercase w-full">Info</p>
      <List3 />
    </div>
  );
}

function Nav() {
  return (
    <div className="content-stretch flex gap-[48px] items-start justify-start relative shrink-0 w-[848px]" data-name="nav">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  );
}

function List4() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Medium',_sans-serif] font-medium gap-[4px] items-end justify-start leading-[1.4] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre" data-name="list">
      <p className="opacity-60 relative shrink-0">+1 981 981-23-19</p>
      <p className="opacity-60 relative shrink-0 text-right">hello@logoipsum.com</p>
    </div>
  );
}

function ContactUs() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-end justify-start relative shrink-0" data-name="contactUs">
      <div className="bg-white h-px opacity-25 shrink-0 w-[45px]" data-name="border" />
      <List4 />
    </div>
  );
}

function Col() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-end justify-start relative shrink-0" data-name="col">
      <div className="relative shrink-0 size-[50px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
          <g id="Vector" opacity="0.6">
            <path d={svgPaths.p396df000} fill="white" />
            <path d={svgPaths.p2d553a00} fill="white" />
            <path d={svgPaths.p133d59b0} fill="white" />
          </g>
        </svg>
      </div>
      <ContactUs />
    </div>
  );
}

function Frame115() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Nav />
      <Col />
    </div>
  );
}

function Top() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start justify-start relative shrink-0 w-full" data-name="top">
      <NeedHelp />
      <Frame115 />
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[#03033b] box-border content-stretch flex flex-col gap-[96px] items-start justify-start left-0 overflow-clip px-[72px] py-[64px] top-[4156px] w-[1512px]" data-name="footer">
      <Top />
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
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-start ml-[99px] mt-[3px] relative" data-name="navlink_dropdown">
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
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-start ml-[245px] mt-[3px] relative" data-name="navlink_dropdown">
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
    <div className="absolute content-stretch flex gap-[4px] items-start justify-start left-[11px] top-[7px]">
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
      <div className="h-[39px] relative shrink-0 w-[156px]" data-name="logo">
        <Logo />
      </div>
      <Group5 />
    </div>
  );
}

function Group18273() {
  return (
    <div className="absolute contents top-[1870px]" style={{ left: "calc(43.75% + 48.5px)" }}>
      <p className="absolute font-['Roboto:SemiBold',_sans-serif] font-semibold leading-[1.5] text-[16px] text-black text-nowrap top-[1870px] whitespace-pre" style={{ left: "calc(43.75% + 48.5px)", fontVariationSettings: "'wdth' 100" }}>{`see more `}</p>
      <div className="absolute flex inset-[40.05%_46.56%_59.67%_52.05%] items-center justify-center">
        <div className="flex-none h-[21px] rotate-[270deg] w-[13px]">
          <div className="relative size-full" data-name="Vector">
            <div className="absolute bottom-[3.22%] left-[1.39%] right-[1.39%] top-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 21">
                <path d={svgPaths.p3d82b180} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
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
    <div className="absolute content-stretch flex gap-[4px] items-start justify-start left-[16px] top-[6px]">
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

function Background() {
  return (
    <div className="absolute contents left-[-215px] top-[-215px]" data-name="Background">
      <div className="absolute bg-center bg-contain bg-no-repeat h-[1313px] left-[-215px] top-[-215px] w-[2435px]" data-name="image 6" style={{ backgroundImage: `url('${imgImage6}')` }} />
    </div>
  );
}

function Date() {
  return (
    <div className="font-['Inter:Bold',_sans-serif] font-bold grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[normal] not-italic place-items-start relative shrink-0 text-[32px]" data-name="date">
      <div className="[grid-area:1_/_1] h-[38px] ml-[230px] mt-[0.272px] relative text-white w-[87px]">
        <p className="mb-0">2025</p>
        <p>&nbsp;</p>
      </div>
      <p className="[grid-area:1_/_1] h-[38px] ml-0 mt-0 relative text-[#53e88b] w-[245px]">SAM 26 MAI |</p>
    </div>
  );
}

function SoustitreSlide() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="soustitre slide">
      <p className="[grid-area:1_/_1] font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] ml-[213.5px] mt-0 not-italic relative text-[12px] text-center text-white translate-x-[-50%] w-[153px]">{`Places disponibles `}</p>
      <div className="[grid-area:1_/_1] h-0 ml-0 mt-[6px] relative w-[137px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 137 1">
            <line id="Line 1" stroke="var(--stroke-0, white)" x2="137" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="[grid-area:1_/_1] h-0 ml-[282px] mt-[6px] relative w-[137px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 137 1">
            <line id="Line 1" stroke="var(--stroke-0, white)" x2="137" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Play() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[10px] items-center justify-center left-0 px-0 py-[14px] right-[19.28%] top-0" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">EN LIVE STREAMING</p>
    </div>
  );
}

function AnimationAnimationMotionGraphicAnimatingMoving() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="animation--animation-motion-graphic-animating-moving">
      <div className="absolute inset-[-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
          <g id="animation--animation-motion-graphic-animating-moving">
            <path d={svgPaths.p2dede8c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 14.3333L4.33333 11" id="Vector 4414" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.1667 21L13.5001 17.6667" id="Vector 4416" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 21L5.16667 16.8333" id="Vector 4415" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#de0035] bottom-0 box-border content-stretch flex gap-[10px] items-center justify-start left-[80.72%] p-[11px] right-0 top-0" data-name="badge">
      <AnimationAnimationMotionGraphicAnimatingMoving />
    </div>
  );
}

function StreamingBadge() {
  return (
    <div className="h-[43px] relative shrink-0 w-[223px]" data-name="Streaming-badge">
      <Play />
      <Badge />
    </div>
  );
}

function Play1() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] h-[43px] items-center justify-center px-0 py-[14px] relative shrink-0 w-[129px]" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">{`EN SALLE `}</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-start relative shrink-0" data-name="badge">
      <div className="bg-[#de0035] shrink-0 size-[43px]" />
    </div>
  );
}

function Calque1() {
  return (
    <div className="h-[22.001px] relative shrink-0 w-[21.999px]" data-name="Calque 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Calque 1">
          <path d={svgPaths.p7230f80} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pfadc980} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p2fdd3480} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p237f200} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.pd96dc00} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p344f6800} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p1688100} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p2f72e880} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p6be8900} fill="var(--fill-0, white)" id="Vector_9" />
          <path d={svgPaths.p186f500} fill="var(--fill-0, white)" id="Vector_10" />
          <path d={svgPaths.p33775200} fill="var(--fill-0, white)" id="Vector_11" />
          <path d={svgPaths.p37732900} fill="var(--fill-0, white)" id="Vector_12" />
        </g>
      </svg>
    </div>
  );
}

function Frame18275() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center justify-start left-0 top-0">
      <Calque1 />
    </div>
  );
}

function Ticket1() {
  return (
    <div className="absolute left-[139px] overflow-clip size-[22px] top-[9px]" data-name="ticket 1">
      <Frame18275 />
    </div>
  );
}

function SalleBadge() {
  return (
    <div className="content-stretch flex items-center justify-start relative shrink-0" data-name="salle-badge">
      <Play1 />
      <Badge1 />
      <Ticket1 />
    </div>
  );
}

function IconHeart() {
  return (
    <div className="[grid-area:1_/_1] h-[24px] ml-0 mt-0 relative w-[27.692px]" data-name="🦆 icon 'heart'">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 24">
        <g id="ð¦ icon 'heart'">
          <path d={svgPaths.p3e901600} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function AddToFavourites() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Add to Favourites">
      <IconHeart />
    </div>
  );
}

function Frame18276() {
  return (
    <div className="content-stretch flex gap-[22px] items-center justify-start relative shrink-0 w-full">
      <StreamingBadge />
      <SalleBadge />
      <AddToFavourites />
    </div>
  );
}

function Disponibilite() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-start justify-start relative shrink-0 w-[467.692px]" data-name="DISPONIBILITE">
      <SoustitreSlide />
      <Frame18276 />
    </div>
  );
}

function TexteSlider() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-start left-[53px] top-[53px] w-[520px]" data-name="texte slider">
      <p className="font-['Aclonica:Regular',_sans-serif] h-[21.549px] leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.75)] w-full">ACCOR ARENA PARIS</p>
      <div className="font-['Inter:Bold',_sans-serif] font-bold h-[130.272px] leading-[1.005] not-italic relative shrink-0 text-[64px] text-white w-full">
        <p className="mb-0 whitespace-pre-wrap">{`AYA  `}</p>
        <p>{`NAKAMURA `}</p>
      </div>
      <Date />
      <Disponibilite />
    </div>
  );
}

function Slideshow() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage4}')` }} />
    </div>
  );
}

function Slideshow1() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage5}')` }} />
    </div>
  );
}

function Slideshow2() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage7}')` }} />
    </div>
  );
}

function Slideshow3() {
  return (
    <div className="h-[417px] relative shrink-0 w-[278px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage8}')` }} />
    </div>
  );
}

function Slideshow4() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage9}')` }} />
    </div>
  );
}

function Slideshow5() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage10}')` }} />
    </div>
  );
}

function Slideshow6() {
  return (
    <div className="h-[349px] relative shrink-0 w-[232px]" data-name="Slideshow">
      <div className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-[25px]" data-name="image 4" style={{ backgroundImage: `url('${imgImage11}')` }} />
    </div>
  );
}

function Slide() {
  return (
    <div className="absolute content-stretch flex gap-[30px] items-center justify-start left-[-205px] top-[426px]" data-name="slide">
      <Slideshow />
      <Slideshow1 />
      <Slideshow2 />
      <Slideshow3 />
      <Slideshow4 />
      <Slideshow5 />
      <Slideshow6 />
    </div>
  );
}

function SliderToggleCarre() {
  return (
    <div className="absolute h-[8px] left-[407px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggleCarre1() {
  return (
    <div className="absolute h-[8px] left-[498px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggleCarre2() {
  return (
    <div className="absolute h-[8px] left-[589px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggleCarre3() {
  return (
    <div className="absolute h-[8px] left-[680px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div className="absolute bg-[#d9d9d9] inset-0" />
    </div>
  );
}

function SliderToggleCarre4() {
  return (
    <div className="absolute h-[8px] left-[771px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggleCarre5() {
  return (
    <div className="absolute h-[8px] left-[862px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggleCarre6() {
  return (
    <div className="absolute h-[8px] left-[953px] top-[876px] w-[81px]" data-name="slider-toggle-carre">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none" />
    </div>
  );
}

function SliderToggle() {
  return (
    <div className="absolute contents left-[407px] top-[876px]" data-name="slider toggle">
      <SliderToggleCarre />
      <SliderToggleCarre1 />
      <SliderToggleCarre2 />
      <SliderToggleCarre3 />
      <SliderToggleCarre4 />
      <SliderToggleCarre5 />
      <SliderToggleCarre6 />
    </div>
  );
}

function Slidershow() {
  return (
    <div className="absolute bg-[#f8f8f8] h-[928px] left-1/2 overflow-clip top-[139px] translate-x-[-50%] w-[1536px]" data-name="SLIDERSHOW">
      <Background />
      <div className="absolute bg-gradient-to-t bottom-0 from-[#000000] from-[29.365%] h-[546px] mix-blend-multiply opacity-[0.84] to-[82.52%] to-[rgba(0,0,0,0)] translate-x-[-50%] via-[58.6%] via-[rgba(0,0,0,0.506)] w-[1443px]" data-name="filter down" style={{ left: "calc(50% - 1.5px)" }} />
      <TexteSlider />
      <Slide />
      <SliderToggle />
    </div>
  );
}

export default function Acceuil() {
  return (
    <div className="bg-white relative size-full" data-name="ACCEUIL">
      <div className="absolute bg-[#d9d9d9] h-[31px] rounded-[24px] top-[-281px] w-[120px]" style={{ left: "calc(50% + 12px)" }} />
      <Footer />
      <Navbar />
      <div className="absolute bg-[#d9d9d9] h-[369px] rounded-[22px] top-[1459px] w-[267px]" style={{ left: "calc(6.25% + 4.5px)" }} />
      <div className="absolute bg-[#d9d9d9] h-[369px] rounded-[22px] top-[1459px] w-[267px]" style={{ left: "calc(25% + 8px)" }} />
      <div className="absolute bg-[#d9d9d9] h-[369px] rounded-[22px] top-[1459px] w-[267px]" style={{ left: "calc(43.75% + 11.5px)" }} />
      <div className="absolute bg-[#d9d9d9] h-[369px] rounded-[22px] top-[1459px] w-[267px]" style={{ left: "calc(62.5% + 16px)" }} />
      <div className="absolute bg-[#d9d9d9] h-[369px] rounded-[22px] top-[1459px] w-[267px]" style={{ left: "calc(81.25% + 19.5px)" }} />
      <Group18273 />
      <Frame118 />
      <Slidershow />
    </div>
  );
}