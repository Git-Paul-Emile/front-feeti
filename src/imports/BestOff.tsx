import svgPaths from "./svg-573glktlpu";
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
    <div className="absolute bg-[80.03%_27.08%] bg-no-repeat bg-size-[103.65%_151.43%] content-stretch flex flex-col h-[302px] items-start left-[95px] overflow-clip rounded-[16px] top-[191px] w-[548.185px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
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
    <div className="absolute contents inset-[63.63%_78.44%_29.56%_6.28%]">
      <p className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.63%_78.44%_29.56%_6.28%] leading-[normal] text-[48px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18464() {
  return (
    <div className="absolute contents inset-[63.63%_61.51%_29.56%_6.28%]">
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.75%_61.51%_29.56%_21.56%] leading-[1.5] text-[0px] text-[20px] text-black" style={{ fontVariationSettings: "'opsz' 14" }}>
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
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-[95px] top-[609px] w-[439px]" data-name="CTA - EVENTS">
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
    <div className="absolute content-stretch flex gap-[22px] items-center left-[396px] top-[215px] w-[223px]">
      <StreamingBadge />
    </div>
  );
}

function Group18465() {
  return (
    <div className="absolute contents left-[95px] top-[191px]">
      <Image />
      <Group18464 />
      <CtaEvents />
      <Frame18275 />
    </div>
  );
}

function AspectRatioKeeperRotatedAutoLayout1() {
  return <div className="h-full w-0" data-name="Aspect ratio keeper # Rotated Auto Layout" />;
}

function AspectRatioKeeperAdditionally45RotatedAutoLayout1() {
  return (
    <div className="content-stretch flex h-[548.185px] items-start relative w-full" data-name="Aspect ratio keeper # Additionally 45º rotated Auto Layout">
      <div className="flex h-full items-center justify-center relative shrink-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "548.171875", width: "calc(1px * ((var(--transform-inner-height) * 0.4142167270183563) + (var(--transform-inner-width) * 0.9101782441139221)))" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-[24.47deg]">
          <AspectRatioKeeperRotatedAutoLayout1 />
        </div>
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="absolute bg-[80.03%_27.08%] bg-no-repeat bg-size-[103.65%_151.43%] content-stretch flex flex-col h-[302px] items-start left-[667.18px] overflow-clip rounded-[16px] top-[191px] w-[548.185px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "548.171875", "--transform-inner-height": "548.171875", height: "calc(1px * ((var(--transform-inner-width) * 0.7071117162704468) + (var(--transform-inner-height) * 0.7071018218994141)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[315deg] w-full">
          <AspectRatioKeeperAdditionally45RotatedAutoLayout1 />
        </div>
      </div>
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
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="badge">
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

function Frame18276() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-0 top-0">
      <Calque1 />
    </div>
  );
}

function Ticket1() {
  return (
    <div className="absolute left-[139px] overflow-clip size-[22px] top-[9px]" data-name="ticket 1">
      <Frame18276 />
    </div>
  );
}

function SalleBadge() {
  return (
    <div className="absolute content-stretch flex items-center left-[1015.18px] top-[215px]" data-name="salle-badge">
      <Play1 />
      <Badge1 />
      <Ticket1 />
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents inset-[63.63%_40.6%_29.56%_44.13%]">
      <p className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.63%_40.6%_29.56%_44.13%] leading-[normal] text-[48px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18472() {
  return (
    <div className="absolute contents inset-[63.63%_23.66%_29.56%_44.13%]">
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.75%_23.66%_29.56%_59.4%] leading-[1.5] text-[0px] text-[20px] text-black" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
      <Group12 />
    </div>
  );
}

function Ticket24Outline1() {
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

function Frame28() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Acheter</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Ticket24Outline1 />
      <Frame28 />
    </div>
  );
}

function Love24Outline1() {
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

function Frame30() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Wishlist</p>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Love24Outline1 />
      <Frame30 />
    </div>
  );
}

function CtaEvents1() {
  return (
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-[667.18px] top-[609px] w-[439px]" data-name="CTA - EVENTS">
      <Frame29 />
      <Frame31 />
    </div>
  );
}

function Group18466() {
  return (
    <div className="absolute contents left-[667.18px] top-[191px]">
      <Image1 />
      <SalleBadge />
      <Group18472 />
      <CtaEvents1 />
    </div>
  );
}

function Group18471() {
  return (
    <div className="absolute contents left-[95px] top-[191px]">
      <Group18465 />
      <Group18466 />
    </div>
  );
}

function AspectRatioKeeperRotatedAutoLayout2() {
  return <div className="h-full w-0" data-name="Aspect ratio keeper # Rotated Auto Layout" />;
}

function AspectRatioKeeperAdditionally45RotatedAutoLayout2() {
  return (
    <div className="content-stretch flex h-[548.185px] items-start relative w-full" data-name="Aspect ratio keeper # Additionally 45º rotated Auto Layout">
      <div className="flex h-full items-center justify-center relative shrink-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "548.171875", width: "calc(1px * ((var(--transform-inner-height) * 0.4142167270183563) + (var(--transform-inner-width) * 0.9101782441139221)))" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-[24.47deg]">
          <AspectRatioKeeperRotatedAutoLayout2 />
        </div>
      </div>
    </div>
  );
}

function Image2() {
  return (
    <div className="absolute bg-[80.03%_27.08%] bg-no-repeat bg-size-[103.65%_151.43%] content-stretch flex flex-col h-[302px] items-start left-[1240px] overflow-clip rounded-[16px] top-[191px] w-[548.185px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "548.171875", "--transform-inner-height": "548.171875", height: "calc(1px * ((var(--transform-inner-width) * 0.7071117162704468) + (var(--transform-inner-height) * 0.7071018218994141)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[315deg] w-full">
          <AspectRatioKeeperAdditionally45RotatedAutoLayout2 />
        </div>
      </div>
    </div>
  );
}

function Play2() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] h-[43px] items-center justify-center px-0 py-[14px] relative shrink-0 w-[129px]" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">{`EN SALLE `}</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="badge">
      <div className="bg-[#de0035] shrink-0 size-[43px]" />
    </div>
  );
}

function Calque2() {
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

function Frame18277() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-0 top-0">
      <Calque2 />
    </div>
  );
}

function Ticket2() {
  return (
    <div className="absolute left-[139px] overflow-clip size-[22px] top-[9px]" data-name="ticket 1">
      <Frame18277 />
    </div>
  );
}

function SalleBadge1() {
  return (
    <div className="absolute content-stretch flex items-center left-[1359px] top-[215px]" data-name="salle-badge">
      <Play2 />
      <Badge2 />
      <Ticket2 />
    </div>
  );
}

function Play3() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[10px] items-center justify-center left-0 px-0 py-[14px] right-[19.28%] top-0" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">EN LIVE STREAMING</p>
    </div>
  );
}

function AnimationAnimationMotionGraphicAnimatingMoving1() {
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

function Badge3() {
  return (
    <div className="absolute bg-[#de0035] bottom-0 box-border content-stretch flex gap-[10px] items-center left-[80.72%] p-[11px] right-0 top-0" data-name="badge">
      <AnimationAnimationMotionGraphicAnimatingMoving1 />
    </div>
  );
}

function StreamingBadge1() {
  return (
    <div className="absolute h-[43px] left-[1541px] top-[215px] w-[223px]" data-name="Streaming-badge">
      <Play3 />
      <Badge3 />
    </div>
  );
}

function Group18469() {
  return (
    <div className="absolute contents left-[1359px] top-[215px]">
      <SalleBadge1 />
      <StreamingBadge1 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents inset-[63.63%_2.71%_29.56%_82.01%]">
      <p className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.63%_2.71%_29.56%_82.01%] leading-[normal] text-[48px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18473() {
  return (
    <div className="absolute contents inset-[63.63%_-14.22%_29.56%_82.01%]">
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.75%_-14.22%_29.56%_97.29%] leading-[1.5] text-[0px] text-[20px] text-black" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
      <Group13 />
    </div>
  );
}

function Ticket24Outline2() {
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

function Frame32() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Acheter</p>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Ticket24Outline2 />
      <Frame32 />
    </div>
  );
}

function Love24Outline2() {
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

function Frame34() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Wishlist</p>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Love24Outline2 />
      <Frame34 />
    </div>
  );
}

function CtaEvents2() {
  return (
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-[1240px] top-[609px] w-[439px]" data-name="CTA - EVENTS">
      <Frame33 />
      <Frame35 />
    </div>
  );
}

function Frame18278() {
  return <div className="absolute h-[43px] left-[1541px] top-[215px] w-[223px]" />;
}

function Group18467() {
  return (
    <div className="absolute contents left-[1240px] top-[191px]">
      <Image2 />
      <Group18469 />
      <Group18473 />
      <CtaEvents2 />
      <Frame18278 />
    </div>
  );
}

function AspectRatioKeeperRotatedAutoLayout3() {
  return <div className="h-full w-0" data-name="Aspect ratio keeper # Rotated Auto Layout" />;
}

function AspectRatioKeeperAdditionally45RotatedAutoLayout3() {
  return (
    <div className="content-stretch flex h-[548.185px] items-start relative w-full" data-name="Aspect ratio keeper # Additionally 45º rotated Auto Layout">
      <div className="flex h-full items-center justify-center relative shrink-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "548.171875", width: "calc(1px * ((var(--transform-inner-height) * 0.4142167270183563) + (var(--transform-inner-width) * 0.9101782441139221)))" } as React.CSSProperties}>
        <div className="flex-none h-full rotate-[24.47deg]">
          <AspectRatioKeeperRotatedAutoLayout3 />
        </div>
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="absolute bg-[80.03%_27.08%] bg-no-repeat bg-size-[103.65%_151.43%] content-stretch flex flex-col h-[302px] items-start left-[1812.18px] overflow-clip rounded-[16px] top-[191px] w-[548.185px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
      <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "548.171875", "--transform-inner-height": "548.171875", height: "calc(1px * ((var(--transform-inner-width) * 0.7071117162704468) + (var(--transform-inner-height) * 0.7071018218994141)))" } as React.CSSProperties}>
        <div className="flex-none rotate-[315deg] w-full">
          <AspectRatioKeeperAdditionally45RotatedAutoLayout3 />
        </div>
      </div>
    </div>
  );
}

function Play4() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[10px] h-[43px] items-center justify-center px-0 py-[14px] relative shrink-0 w-[129px]" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">{`EN SALLE `}</p>
    </div>
  );
}

function Badge4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="badge">
      <div className="bg-[#de0035] shrink-0 size-[43px]" />
    </div>
  );
}

function Calque3() {
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

function Frame18279() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-0 top-0">
      <Calque3 />
    </div>
  );
}

function Ticket3() {
  return (
    <div className="absolute left-[139px] overflow-clip size-[22px] top-[9px]" data-name="ticket 1">
      <Frame18279 />
    </div>
  );
}

function SalleBadge2() {
  return (
    <div className="absolute content-stretch flex items-center left-[1931.18px] top-[215px]" data-name="salle-badge">
      <Play4 />
      <Badge4 />
      <Ticket3 />
    </div>
  );
}

function Play5() {
  return (
    <div className="absolute bg-white bottom-0 box-border content-stretch flex gap-[10px] items-center justify-center left-0 px-0 py-[14px] right-[19.28%] top-0" data-name="Play">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.005] not-italic relative shrink-0 text-[15px] text-black text-center w-[153px]">EN LIVE STREAMING</p>
    </div>
  );
}

function AnimationAnimationMotionGraphicAnimatingMoving2() {
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

function Badge5() {
  return (
    <div className="absolute bg-[#de0035] bottom-0 box-border content-stretch flex gap-[10px] items-center left-[80.72%] p-[11px] right-0 top-0" data-name="badge">
      <AnimationAnimationMotionGraphicAnimatingMoving2 />
    </div>
  );
}

function StreamingBadge2() {
  return (
    <div className="absolute h-[43px] left-[2113.18px] top-[215px] w-[223px]" data-name="Streaming-badge">
      <Play5 />
      <Badge5 />
    </div>
  );
}

function Group18474() {
  return (
    <div className="absolute contents left-[1931.18px] top-[215px]">
      <SalleBadge2 />
      <StreamingBadge2 />
    </div>
  );
}

function Frame18280() {
  return <div className="absolute h-[43px] left-[2113.18px] top-[215px] w-[223px]" />;
}

function Group14() {
  return (
    <div className="absolute contents inset-[63.63%_-35.13%_29.56%_119.85%]">
      <p className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.63%_-35.13%_29.56%_119.85%] leading-[normal] text-[48px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>{`14 MARS  |`}</p>
    </div>
  );
}

function Group18475() {
  return (
    <div className="absolute contents inset-[63.63%_-52.06%_29.56%_119.85%]">
      <div className="absolute font-['DM_Sans:Bold',_sans-serif] font-bold inset-[63.75%_-52.06%_29.56%_135.13%] leading-[1.5] text-[0px] text-[20px] text-black" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="mb-0">Yaye Padura</p>
        <p className="font-['DM_Sans:Regular',_sans-serif] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
          By Chemical Department
        </p>
      </div>
      <Group14 />
    </div>
  );
}

function Ticket24Outline3() {
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

function Frame36() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Acheter</p>
      </div>
    </div>
  );
}

function Frame37() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Ticket24Outline3 />
      <Frame36 />
    </div>
  );
}

function Love24Outline3() {
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

function Frame38() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[3px] relative shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap text-white tracking-[-0.28px]">
        <p className="leading-[18px] whitespace-pre">Wishlist</p>
      </div>
    </div>
  );
}

function Frame39() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] h-[41px] items-center justify-center px-[10px] py-0 relative shrink-0 w-[178px]">
      <Love24Outline3 />
      <Frame38 />
    </div>
  );
}

function CtaEvents3() {
  return (
    <div className="absolute content-stretch flex gap-[34px] h-[40px] items-center left-[1812.18px] top-[609px] w-[439px]" data-name="CTA - EVENTS">
      <Frame37 />
      <Frame39 />
    </div>
  );
}

function Group18468() {
  return (
    <div className="absolute contents left-[1812.18px] top-[191px]">
      <Image3 />
      <Group18474 />
      <Frame18280 />
      <Group18475 />
      <CtaEvents3 />
    </div>
  );
}

function Group18470() {
  return (
    <div className="absolute contents left-[1240px] top-[191px]">
      <Group18467 />
      <Group18468 />
    </div>
  );
}

function Group() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55 55">
      <g id="Group">
        <path d={svgPaths.p15f0fc00} fill="var(--fill-0, #100F0F)" id="Vector" />
        <path d={svgPaths.p138dd1c0} fill="var(--fill-0, #100F0F)" id="Vector_2" />
      </g>
    </svg>
  );
}

function ArrowDroite() {
  return (
    <div className="absolute inset-[8.76%_16.2%_84.55%_80.16%]" data-name="arrow droite">
      <Group />
    </div>
  );
}

function ArrowGauche() {
  return (
    <div className="relative size-full" data-name="arrow gauche">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 55">
        <g id="arrow gauche">
          <path d={svgPaths.p13dd480} fill="var(--fill-0, #100F0F)" id="Vector" />
          <path d={svgPaths.p3a1a9400} fill="var(--fill-0, #100F0F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group143726096() {
  return (
    <div className="absolute contents inset-[8.76%_5.82%_84.55%_75.27%]">
      <ArrowDroite />
      <div className="absolute flex inset-[8.76%_20.97%_84.55%_75.27%] items-center justify-center">
        <div className="flex-none h-[55px] rotate-[180deg] w-[57px]">
          <ArrowGauche />
        </div>
      </div>
      <div className="absolute inset-[10.71%_12.57%_86.38%_85.78%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 24">
          <ellipse cx="12.5" cy="12" fill="var(--fill-0, #565656)" id="Ellipse 441" rx="12.5" ry="12" />
        </svg>
      </div>
      <div className="absolute inset-[10.71%_5.82%_86.38%_92.53%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 24">
          <ellipse cx="12.5" cy="12" fill="var(--fill-0, #100F0F)" id="Ellipse 444" rx="12.5" ry="12" />
        </svg>
      </div>
      <div className="absolute inset-[10.71%_9.32%_86.38%_89.02%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 24">
          <ellipse cx="12.5" cy="12" fill="var(--fill-0, #100F0F)" id="Ellipse 442" rx="12.5" ry="12" />
        </svg>
      </div>
    </div>
  );
}

function Group143726098() {
  return (
    <div className="absolute contents left-[95px] top-[72px]">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[48px] leading-[1.005] not-italic text-[#000441] text-[48px] top-[76px] w-[486px]" style={{ left: "calc(50% - 661px)" }}>{`Best of féeti du mois `}</p>
      <Group143726096 />
    </div>
  );
}

function Group152() {
  return (
    <div className="absolute contents inset-[23.4%_14.5%_15.58%_33.12%]" data-name="Group15_2">
      <p className="absolute font-['Poppins:Medium',_sans-serif] inset-[23.4%_14.5%_15.58%_33.12%] leading-[normal] not-italic text-[#000441] text-[24px] text-center text-nowrap whitespace-pre">En savoir +</p>
    </div>
  );
}

function Group182() {
  return (
    <div className="absolute contents inset-0" data-name="Group18_2">
      <div className="absolute inset-0 rounded-[69px]" data-name="Rectangle9_3">
        <div aria-hidden="true" className="absolute border border-[#000441] border-solid inset-0 pointer-events-none rounded-[69px]" />
      </div>
      <Group152 />
    </div>
  );
}

function Btnprimaire22() {
  return (
    <div className="absolute inset-0" data-name="btnprimaire2_2">
      <Group182 />
    </div>
  );
}

function Btn2() {
  return (
    <div className="absolute h-[59px] left-[621px] top-[713px] w-[252px]" data-name="btn+_2">
      <Btnprimaire22 />
      <div className="absolute inset-[34.04%_72.51%_31.77%_18.96%]" data-name="Vector_121">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
          <path d={svgPaths.p1a3da900} fill="var(--fill-0, #000441)" id="Vector_121" />
        </svg>
      </div>
    </div>
  );
}

function Group143726099() {
  return (
    <div className="absolute contents left-[95px] top-[72px]">
      <Group18471 />
      <Group18470 />
      <Group143726098 />
      <Btn2 />
    </div>
  );
}

export default function BestOff() {
  return (
    <div className="relative size-full" data-name="BEST OFF">
      <Group143726099 />
    </div>
  );
}