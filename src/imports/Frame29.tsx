import svgPaths from "./svg-upkeppeit8";

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

export default function Frame29() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center relative size-full">
      <Search />
    </div>
  );
}