import imgImage from "figma:asset/47368c11bd99f1ab52c8dc8d94191b9544b45e85.png";

function ABadge() {
  return (
    <div className="absolute bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center left-[22px] px-[10px] py-[4px] rounded-[6px] top-[16px]" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`NIGHTLIFE `}</p>
    </div>
  );
}

function Image() {
  return (
    <div className="bg-center bg-cover bg-no-repeat h-[240px] overflow-clip relative shrink-0 w-full" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }}>
      <ABadge />
    </div>
  );
}

function ArrowUpRight() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-up-right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-up-right">
          <path d="M7 17L17 7M17 7H7M17 7V17" id="Icon" stroke="var(--stroke-0, #000441)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrap() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-0 relative shrink-0" data-name="Icon wrap">
      <ArrowUpRight />
    </div>
  );
}

function HeadingAndIcon() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Heading and icon">
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow h-[42px] leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#000441] text-[24px]">
        <p className="mb-[24px]">Bon plan du week-end</p>
        <p>&nbsp;</p>
      </div>
      <IconWrap />
    </div>
  );
}

function HeadingAndText() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Heading and text">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#6941c6] text-[14px] w-full">Sunday , 1 Jan 2023</p>
      <HeadingAndIcon />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#c0c5d0] text-[16px] w-full">JavaScript frameworks make development easy with extensive features and functionalities.</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <HeadingAndText />
    </div>
  );
}

export default function BlogPostCard() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative size-full" data-name="Blog post card">
      <Image />
      <Content />
    </div>
  );
}