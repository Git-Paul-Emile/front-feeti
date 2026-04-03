import svgPaths from "./svg-leff6hoark";

function Group() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55 55">
      <g id="Group">
        <path d={svgPaths.p29b6380} fill="var(--fill-0, white)" id="Vector" />
        <path d={svgPaths.p138dd1c0} fill="var(--fill-0, white)" id="Vector_2" />
      </g>
    </svg>
  );
}

function ArrowDroite() {
  return (
    <div className="relative rounded-[16px] size-[55px]" data-name="arrow droite">
      <Group />
    </div>
  );
}

function Video() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="video">
        <path d={svgPaths.p1adf5980} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2db0380} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p3e760100} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_4" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearVideo() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/video">
      <Video />
    </div>
  );
}

function Video1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="video">
      <VuesaxLinearVideo />
    </div>
  );
}

function Frame427319089() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Video1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Cinema</p>
      </div>
    </div>
  );
}

function SelectorTab() {
  return (
    <div className="bg-[#cdff71] box-border content-stretch flex flex-col gap-[12px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <Frame427319089 />
    </div>
  );
}

function Sound() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="sound">
        <path d="M3 8.25V15.75" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M7.5 5.75V18.25" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 3.25V20.75" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M16.5 5.75V18.25" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M21 8.25V15.75" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearSound() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/sound">
      <Sound />
    </div>
  );
}

function Sound1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="sound">
      <VuesaxLinearSound />
    </div>
  );
}

function Frame427319090() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Sound1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Concert</p>
      </div>
    </div>
  );
}

function SelectorTab1() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319090 />
    </div>
  );
}

function Brush() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="brush">
        <path d={svgPaths.p137f9d00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p36526000} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1e724200} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_4" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearBrush() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/brush">
      <Brush />
    </div>
  );
}

function Brush2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="brush-2">
      <VuesaxLinearBrush />
    </div>
  );
}

function Frame427319091() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Brush2 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Art</p>
      </div>
    </div>
  );
}

function SelectorTab2() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319091 />
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-start relative shrink-0" data-name="row">
      <SelectorTab />
      <SelectorTab1 />
      <SelectorTab2 />
    </div>
  );
}

function Musicnote() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="musicnote">
        <path d={svgPaths.p8d41200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M11.97 18V4" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p17cba0f0} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_4" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearMusicnote() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/musicnote">
      <Musicnote />
    </div>
  );
}

function Musicnote1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="musicnote">
      <VuesaxLinearMusicnote />
    </div>
  );
}

function Frame427319092() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Musicnote1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Music</p>
      </div>
    </div>
  );
}

function SelectorTab3() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319092 />
    </div>
  );
}

function Reserve() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="reserve">
        <path d={svgPaths.pe124f80} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p32c1af80} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p18895e00} id="Vector_3" opacity="0" stroke="var(--stroke-0, #000441)" strokeWidth="1.3" />
        <path d={svgPaths.p7b2c300} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M15 11H9" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function VuesaxLinearReserve() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/reserve">
      <Reserve />
    </div>
  );
}

function Reserve1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="reserve">
      <VuesaxLinearReserve />
    </div>
  );
}

function Frame427319093() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Reserve1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Brunches</p>
      </div>
    </div>
  );
}

function SelectorTab4() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319093 />
    </div>
  );
}

function Weight() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="weight">
        <path d={svgPaths.p414cb80} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p20568d00} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M9.82 12H14.18" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M22.5 14.5V9.5" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M1.5 14.5V9.5" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearWeight() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/weight">
      <Weight />
    </div>
  );
}

function Weight1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="weight">
      <VuesaxLinearWeight />
    </div>
  );
}

function Frame427319094() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Weight1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Sport</p>
      </div>
    </div>
  );
}

function SelectorTab5() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319094 />
    </div>
  );
}

function Microscope() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="microscope">
        <g id="Group">
          <path d={svgPaths.p3e73d500} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.p2648080} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.pbd9f800} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </g>
        <path d="M12.05 12.2L7.56 22" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 12.2L16.44 22" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearMicroscope() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/microscope">
      <Microscope />
    </div>
  );
}

function Microscope1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="microscope">
      <VuesaxLinearMicroscope />
    </div>
  );
}

function Frame427319095() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Microscope1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Scientific</p>
      </div>
    </div>
  );
}

function SelectorTab6() {
  return (
    <div className="bg-[#cdff71] box-border content-stretch flex flex-col gap-[12px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#cdff71] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319095 />
    </div>
  );
}

function Briefcase() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="briefcase">
        <path d={svgPaths.p5c67700} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.pd4ca500} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p32c69a00} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p1a788600} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p33c16f00} id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearBriefcase() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/briefcase">
      <Briefcase />
    </div>
  );
}

function Briefcase1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="briefcase">
      <VuesaxLinearBriefcase />
    </div>
  );
}

function Frame427319096() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Briefcase1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Business</p>
      </div>
    </div>
  );
}

function SelectorTab7() {
  return (
    <div className="bg-[#cdff71] box-border content-stretch flex flex-col gap-[12px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#cdff71] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319096 />
    </div>
  );
}

function Cpu() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="cpu">
        <path d={svgPaths.p4025b00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2a720700} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8.01 4V2" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 4V2" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M16 4V2" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 8H22" id="Vector_6" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 12H22" id="Vector_7" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 16H22" id="Vector_8" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M16 20V22" id="Vector_9" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M12.01 20V22" id="Vector_10" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.01 20V22" id="Vector_11" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 8H4" id="Vector_12" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 12H4" id="Vector_13" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M2 16H4" id="Vector_14" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Vector_15" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearCpu() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/cpu">
      <Cpu />
    </div>
  );
}

function Cpu1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="cpu">
      <VuesaxLinearCpu />
    </div>
  );
}

function Frame427319097() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Cpu1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Technology</p>
      </div>
    </div>
  );
}

function SelectorTab8() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319097 />
    </div>
  );
}

function Building4() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="building-4">
        <path d="M1 22H23" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d="M19.78 22.01V17.55" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p2ce9bef0} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p113a2f80} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d="M5.79999 8.25H10.75" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M5.79999 12H10.75" id="Vector_6" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M8.25 22V18.25" id="Vector_7" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <g id="Vector_8" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearBuilding4() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/building-4">
      <Building4 />
    </div>
  );
}

function Building5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="building-4">
      <VuesaxLinearBuilding4 />
    </div>
  );
}

function Frame427319098() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Building5 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Realstate</p>
      </div>
    </div>
  );
}

function SelectorTab9() {
  return (
    <div className="bg-[#cdff71] box-border content-stretch flex flex-col gap-[12px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#cdff71] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319098 />
    </div>
  );
}

function Speedometer() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="speedometer">
        <path d={svgPaths.p23b2d880} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p3fb0c920} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p26d1a580} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.3" />
        <path d={svgPaths.p18895e00} id="Vector_4" opacity="0" stroke="var(--stroke-0, #000441)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function VuesaxLinearSpeedometer() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/speedometer">
      <Speedometer />
    </div>
  );
}

function Speedometer1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="speedometer">
      <VuesaxLinearSpeedometer />
    </div>
  );
}

function Frame427319099() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Speedometer1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Automotive</p>
      </div>
    </div>
  );
}

function SelectorTab10() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319099 />
    </div>
  );
}

function Hospital() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="hospital">
        <path d="M2 22H22" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d={svgPaths.p126f7180} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d={svgPaths.p28397300} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <g id="Group">
          <path d="M12 6V11" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d="M9.5 8.5H14.5" id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        </g>
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearHospital() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/hospital">
      <Hospital />
    </div>
  );
}

function Hospital1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="hospital">
      <VuesaxLinearHospital />
    </div>
  );
}

function Frame427319100() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Hospital1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Medicine</p>
      </div>
    </div>
  );
}

function SelectorTab11() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319100 />
    </div>
  );
}

function Crown() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="crown">
        <path d={svgPaths.p32bdf280} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M6.5 22H17.5" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M9.5 14H14.5" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_4" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearCrown() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/crown">
      <Crown />
    </div>
  );
}

function Crown2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="crown-2">
      <VuesaxLinearCrown />
    </div>
  );
}

function Frame427319101() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Crown2 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Fashion</p>
      </div>
    </div>
  );
}

function SelectorTab12() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319101 />
    </div>
  );
}

function Tree() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="tree">
        <g id="Group">
          <path d={svgPaths.p3052a800} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          <path d={svgPaths.p7564c00} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        </g>
        <path d="M12 22V18" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p18895e00} id="Vector_4" opacity="0" stroke="var(--stroke-0, #000441)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function VuesaxLinearTree() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/tree">
      <Tree />
    </div>
  );
}

function Tree1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="tree">
      <VuesaxLinearTree />
    </div>
  );
}

function Frame427319102() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Tree1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Outdoor</p>
      </div>
    </div>
  );
}

function SelectorTab13() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319102 />
    </div>
  );
}

function Book() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="book">
        <path d={svgPaths.p75c9200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M12 5.49V20.49" id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M7.75 8.49H5.5" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d="M8.5 11.49H5.5" id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_5" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearBook() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/book">
      <Book />
    </div>
  );
}

function Book1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="book">
      <VuesaxLinearBook />
    </div>
  );
}

function Frame427319103() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Book1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Education</p>
      </div>
    </div>
  );
}

function SelectorTab14() {
  return (
    <div className="bg-[#cdff71] box-border content-stretch flex flex-col gap-[12px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#cdff71] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319103 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[44.68%_30.14%_6.25%_30.21%]" data-name="Group">
      <div className="absolute inset-[-5.52%_-6.83%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
          <g id="Group">
            <path d={svgPaths.p37412200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
            <path d={svgPaths.p21bd900} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
            <path d="M5.76054 1.39746V3.92749" id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[44.68%_30.14%_6.25%_30.21%]" data-name="Group">
      <Group4 />
    </div>
  );
}

function PenTool() {
  return (
    <div className="absolute contents inset-0" data-name="pen-tool">
      <Group5 />
      <div className="absolute inset-[6.57%_41.74%_76.91%_41.74%]" data-name="Vector">
        <div className="absolute inset-[-16.39%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <path d={svgPaths.p1b1f7100} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[40.88%_9.38%_44.54%_76.04%]" data-name="Vector">
        <div className="absolute inset-[-21.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <path d={svgPaths.p9196d40} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[40.88%_76.04%_44.54%_9.38%]" data-name="Vector">
        <div className="absolute inset-[-21.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <path d={svgPaths.p22eb5b00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20%_22.75%_57.92%_55.17%]" data-name="Vector">
        <div className="absolute inset-[-14.15%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d="M6.3 6.29999L1 1" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20%_55.17%_57.92%_22.75%]" data-name="Vector">
        <div className="absolute inset-[-14.15%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d="M1 6.29999L6.3 1" id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" opacity="0"></g>
        </svg>
      </div>
    </div>
  );
}

function VuesaxLinearPenTool() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/pen-tool">
      <PenTool />
    </div>
  );
}

function PenTool1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="pen-tool">
      <VuesaxLinearPenTool />
    </div>
  );
}

function Frame427319104() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <PenTool1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Design</p>
      </div>
    </div>
  );
}

function SelectorTab15() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319104 />
    </div>
  );
}

function Global() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="global">
        <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p168b3380} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p2bfa5680} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1920f500} id="Vector_4" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p219c3a80} id="Vector_5" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Vector_6" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearGlobal() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/global">
      <Global />
    </div>
  );
}

function Global1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="global">
      <VuesaxLinearGlobal />
    </div>
  );
}

function Frame427319105() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Global1 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Nightlife</p>
      </div>
    </div>
  );
}

function SelectorTab16() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319105 />
    </div>
  );
}

function Brush1() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="brush">
        <path d={svgPaths.p137f9d00} id="Vector" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p36526000} id="Vector_2" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <path d={svgPaths.p1e724200} id="Vector_3" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        <g id="Vector_4" opacity="0"></g>
      </g>
    </svg>
  );
}

function VuesaxLinearBrush1() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/brush">
      <Brush1 />
    </div>
  );
}

function Brush3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="brush-2">
      <VuesaxLinearBrush1 />
    </div>
  );
}

function Frame427319106() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <Brush3 />
      <div className="flex flex-col font-['Urbanist:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#000441] text-[14px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Zoo</p>
      </div>
    </div>
  );
}

function SelectorTab17() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-start px-[20px] py-[12px] relative rounded-[100px] shrink-0" data-name="Selector Tab">
      <div aria-hidden="true" className="absolute border-[#dfe1e4] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Frame427319106 />
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-start relative shrink-0" data-name="row">
      <SelectorTab15 />
      <SelectorTab16 />
      <SelectorTab17 />
    </div>
  );
}

function Label() {
  return (
    <div className="absolute content-stretch flex gap-[13px] items-center justify-start left-[98px] top-[237px]" data-name="label">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg]">
          <ArrowDroite />
        </div>
      </div>
      <Row />
      <SelectorTab3 />
      <SelectorTab4 />
      <SelectorTab5 />
      <SelectorTab6 />
      <SelectorTab7 />
      <SelectorTab8 />
      <SelectorTab9 />
      <SelectorTab10 />
      <SelectorTab11 />
      <SelectorTab12 />
      <SelectorTab13 />
      <SelectorTab14 />
      <Row1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px px-0 py-[11px] relative shrink-0">
      <p className="font-['Montserrat:Regular',_sans-serif] font-normal leading-[16px] relative shrink-0 text-[#717171] text-[12px] text-nowrap tracking-[-0.36px] whitespace-pre">Events, Attraction, Playground, ....</p>
    </div>
  );
}

function Equalizer24Outline() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="equalizer / 24 / Outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="equalizer / 24 / Outline">
          <path d={svgPaths.p2e449180} fill="var(--fill-0, #B0B0B0)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Search() {
  return (
    <div className="bg-white h-[48px] relative rounded-[32px] shrink-0 w-full" data-name="Search">
      <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[48px] items-center justify-start px-[16px] py-0 relative w-full">
          <Frame5 />
          <Equalizer24Outline />
        </div>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-center justify-center top-[136px] translate-x-[-50%] w-[997px]" style={{ left: "calc(50% + 0.5px)" }}>
      <Search />
    </div>
  );
}

export default function Frame18279() {
  return (
    <div className="bg-[#000441] relative size-full">
      <Label />
      <Frame29 />
    </div>
  );
}