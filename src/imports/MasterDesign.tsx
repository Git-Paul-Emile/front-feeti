import svgPaths from "./svg-m6zenjhgmr";
import imgImage6 from "figma:asset/3a047c0caf5122fb450be10d8e36fbed03f5e23d.png";
import imgImage4 from "figma:asset/9410e591510d407fcfa1f04d765e07a76a3c14d8.png";
import imgImage5 from "figma:asset/a4b946f238adec33a9c05d3a1c7f41fe4d8b1eb0.png";
import imgImage7 from "figma:asset/1a63f359de314a186c5388b47085743166b481a0.png";
import imgImage8 from "figma:asset/08c3adfaf682d943fd57263728b75106ff53584e.png";
import imgImage9 from "figma:asset/a78d12acd8013335a708b1d3299fa67dea821c2f.png";
import imgImage10 from "figma:asset/048763dcef3dac0c99bc05231149ecce12c9363a.png";
import imgImage11 from "figma:asset/ecdcdfb738ab87207140eebbdf979563289c777e.png";

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
      <div className="[grid-area:1_/_1] h-[38px] ml-[230px] mt-[0.451px] relative text-white w-[87px]">
        <p className="mb-0">2025</p>
        <p>&nbsp;</p>
      </div>
      <p className="[grid-area:1_/_1] h-[38px] ml-0 mt-0 relative text-[#53e88b] w-[210px]">SAM 10 SEP |</p>
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
      <p className="font-['Aclonica:Regular',_sans-serif] h-[21.549px] leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.75)] w-full">INSTITUT FRANÇAIS DU CONGO</p>
      <p className="font-['Inter:Bold',_sans-serif] font-bold h-[130.272px] leading-[1.005] not-italic relative shrink-0 text-[64px] text-white w-full">RAYA AND THE LAST DRAGON</p>
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

export default function MasterDesign() {
  return (
    <div className="bg-[#f8f8f8] relative size-full" data-name="Master Design">
      <Background />
      <div className="absolute bg-gradient-to-t bottom-0 from-[#000000] from-[29.365%] h-[546px] mix-blend-multiply opacity-[0.84] to-[82.52%] to-[rgba(0,0,0,0)] translate-x-[-50%] via-[58.6%] via-[rgba(0,0,0,0.506)] w-[1443px]" data-name="filter down" style={{ left: "calc(50% - 1.5px)" }} />
      <TexteSlider />
      <Slide />
      <SliderToggle />
    </div>
  );
}