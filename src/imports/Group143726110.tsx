import svgPaths from "./svg-hfsthgh8or";
import imgRectangle47 from "figma:asset/3a047c0caf5122fb450be10d8e36fbed03f5e23d.png";

function Group143726108() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[335px] left-0 rounded-[20px] top-0 w-[410px]" style={{ backgroundImage: `url('${imgRectangle47}')` }} />
      <div className="absolute bg-gradient-to-t bottom-0 from-[#000000] from-[29.365%] h-[259px] left-1/2 mix-blend-multiply opacity-[0.84] rounded-[20px] to-[82.52%] to-[rgba(0,0,0,0)] translate-x-[-50%] via-[58.6%] via-[rgba(0,0,0,0.506)] w-[410px]" data-name="filter down" />
    </div>
  );
}

function Ticket24Outline() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="ticket / 24 / Outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="ticket / 24 / Outline">
          <path d={svgPaths.pf4b3a80} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Acheter</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Ticket24Outline />
      <Frame26 />
    </div>
  );
}

function Love24Outline() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="love / 24 / Outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="love / 24 / Outline">
          <path d={svgPaths.p2d9ecc00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame27() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Wishlist</p>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Love24Outline />
      <Frame27 />
    </div>
  );
}

function CtaEvents() {
  return (
    <div className="absolute content-stretch flex gap-[14px] h-[40px] items-center left-[18px] top-[268px] w-[392px]" data-name="CTA - EVENTS">
      <Frame24 />
      <Frame25 />
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents inset-[59.7%_55.85%_29.25%_5.12%]">
      <p className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[59.7%_55.85%_29.25%_5.12%] leading-[normal] text-[34px] text-white whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18464() {
  return (
    <div className="absolute contents inset-[59.7%_55.85%_29.25%_5.12%]">
      <Group11 />
    </div>
  );
}

function Group143726107() {
  return (
    <div className="absolute contents inset-[59.7%_4.88%_28.36%_5.12%]">
      <Group18464 />
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[59.7%_4.88%_28.36%_47.56%] leading-[1.5] text-[0px] text-[16px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
    </div>
  );
}

function Group143726109() {
  return (
    <div className="absolute contents left-[18px] top-[200px]">
      <CtaEvents />
      <Group143726107 />
    </div>
  );
}

export default function Group143726110() {
  return (
    <div className="relative size-full">
      <Group143726108 />
      <Group143726109 />
    </div>
  );
}