import svgPaths from "./svg-mgbz0lxi1o";
import imgImage from "figma:asset/40344a755fd03b1221f95909367ae2dfe7fdd3a2.png";

function AspectRatioKeeperRotatedAutoLayout() {
  return <div className="h-full w-0" data-name="Aspect ratio keeper # Rotated Auto Layout" />;
}

function AspectRatioKeeperAdditionally45RotatedAutoLayout() {
  return (
    <div className="content-stretch flex h-[548.185px] items-start relative w-full" data-name="Aspect ratio keeper # Additionally 45º rotated Auto Layout">
      <div className="flex h-full items-center justify-center relative shrink-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "548.171875", width: "calc(1px * ((var(--transform-inner-height) * 0.4142167270183563) + (var(--transform-inner-width) * 0.9101782441139221)))" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-[24.47deg]">
          <AspectRatioKeeperRotatedAutoLayout />
        </div>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="absolute bg-[80.03%_27.08%] bg-no-repeat bg-size-[103.65%_151.43%] content-stretch flex flex-col h-[302px] items-start left-0 overflow-clip rounded-[16px] top-0 w-[548.185px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "548.171875", "--transform-inner-height": "548.171875", height: "calc(1px * ((var(--transform-inner-width) * 0.7071117162704468) + (var(--transform-inner-height) * 0.7071018218994141)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[315deg] w-full">
          <AspectRatioKeeperAdditionally45RotatedAutoLayout />
        </div>
      </div>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute bottom-[15.28%] contents left-0 right-[57.86%] top-[72.49%]">
      <p className="absolute bottom-[15.28%] font-['DM_Sans:Bold',_sans-serif] font-bold leading-[normal] left-0 right-[57.86%] text-[48px] text-black top-[72.49%] whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18464() {
  return (
    <div className="absolute bottom-[15.28%] contents left-0 right-[11.16%] top-[72.49%]">
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[72.71%_11.16%_15.28%_42.14%] leading-[1.5] text-[0px] text-[20px] text-black" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
      <Group11 />
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
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-0 top-[418px] w-[439px]" data-name="CTA - EVENTS">
      <Frame24 />
      <Frame25 />
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
    <div className="absolute bg-[#de0035] bottom-0 box-border content-stretch flex gap-[10px] items-center left-[80.72%] p-[11px] right-0 top-0" data-name="badge">
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

function Frame18275() {
  return (
    <div className="absolute content-stretch flex gap-[22px] items-center left-[301px] top-[24px] w-[223px]">
      <StreamingBadge />
    </div>
  );
}

export default function Group18465() {
  return (
    <div className="relative size-full">
      <Image />
      <Group18464 />
      <CtaEvents />
      <Frame18275 />
    </div>
  );
}