import svgPaths from "./svg-n41klnjihp";
import imgRectangle39 from "figma:asset/1d6413ee0edfac7a8481407e20a99e7bdcc6bec5.png";

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
        <p className="leading-[18px] whitespace-pre">Reservez</p>
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

function CtaEvents() {
  return (
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-[38px] top-[371px] w-[243px]" data-name="CTA - EVENTS">
      <Frame24 />
      <Love24Outline />
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute bottom-0 contents font-['DM_Sans:Bold',_sans-serif] font-bold leading-[normal] left-0 right-[89.44%] top-0">
      <p className="absolute bottom-[68.63%] left-[0.35%] right-[90.14%] text-[#de0035] text-[11.372px] text-center top-0" style={{ fontVariationSettings: "'opsz' 14" }}>
        APR
      </p>
      <p className="absolute bottom-0 left-0 right-[89.44%] text-[28.429px] text-white top-[23.53%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        14
      </p>
    </div>
  );
}

function InfosEvent() {
  return (
    <div className="absolute h-[48px] left-[17px] top-[274px] w-[285px]" data-name="Infos event">
      <div className="absolute bottom-[6.7%] font-['DM_Sans:Bold',_sans-serif] font-bold leading-[1.5] left-[15.62%] right-0 text-[16px] text-white top-[0.2%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
      <Group11 />
    </div>
  );
}

function Lieu() {
  return (
    <div className="absolute h-[23px] left-[17px] top-[332px] w-[285px]" data-name="lieu">
      <p className="absolute bottom-0 font-['DM_Sans:Regular',_sans-serif] font-normal leading-[normal] left-[13.85%] right-0 text-[#dfe1e4] text-[16px] top-[8.7%]" style={{ fontVariationSettings: "'opsz' 14" }}>
        University of Moratuwa
      </p>
      <div className="absolute aspect-[16/22] left-0 right-[95.95%] translate-y-[-50%]" data-name="Vector" style={{ top: "calc(50% - 2px)" }}>
        <div className="absolute inset-[-6.29%_-8.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 18">
            <g id="Vector">
              <path d={svgPaths.p9c5f600} stroke="var(--stroke-0, #DE0035)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d={svgPaths.pd5a9300} stroke="var(--stroke-0, #DE0035)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Group18460() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[432px] left-0 rounded-[22px] top-0 w-[302px]" style={{ backgroundImage: `url('${imgRectangle39}')` }} />
      <div className="absolute bg-gradient-to-t bottom-0 from-[#000000] from-[29.365%] h-[307px] left-1/2 mix-blend-multiply opacity-[0.84] rounded-[22px] to-[82.52%] to-[rgba(0,0,0,0)] translate-x-[-50%] via-[58.6%] via-[rgba(0,0,0,0.506)] w-[302px]" data-name="filter down" />
      <CtaEvents />
      <InfosEvent />
      <Lieu />
    </div>
  );
}