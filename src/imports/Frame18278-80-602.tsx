import svgPaths from "./svg-61wsnipctn";
import imgImage from "figma:asset/47368c11bd99f1ab52c8dc8d94191b9544b45e85.png";
import imgImage1 from "figma:asset/35ef299a00891d1caa57ba3e8d0893fc99d1f243.png";
import imgImage2 from "figma:asset/462644d8771854825d8aefd8653d007832def0fa.png";
import imgImage3 from "figma:asset/f3274229ec54609ce8242bd3168cea0902f3a40f.png";
import imgMPostCardOverlay from "figma:asset/bb8c9042cb85fe18dc8a8c42df2368bfe203b132.png";

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

function BlogPostCard() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-[151px] top-[675px] w-[377px]" data-name="Blog post card">
      <Image />
      <Content />
    </div>
  );
}

function ABadge1() {
  return (
    <div className="absolute bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center left-[22px] px-[10px] py-[4px] rounded-[6px] top-[16px]" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">RESTAURANT</p>
    </div>
  );
}

function Image1() {
  return (
    <div className="bg-center bg-cover bg-no-repeat h-[240px] overflow-clip relative shrink-0 w-full" data-name="Image" style={{ backgroundImage: `url('${imgImage1}')` }}>
      <ABadge1 />
    </div>
  );
}

function ArrowUpRight1() {
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

function IconWrap1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-0 relative shrink-0" data-name="Icon wrap">
      <ArrowUpRight1 />
    </div>
  );
}

function HeadingAndIcon1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Heading and icon">
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow h-[64px] leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#000441] text-[24px]">
        <p className="mb-[24px]">Le brunch au bord de la loufoulakari</p>
        <p>&nbsp;</p>
      </div>
      <IconWrap1 />
    </div>
  );
}

function HeadingAndText1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Heading and text">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#6941c6] text-[14px] w-full">Sunday , 1 Jan 2023</p>
      <HeadingAndIcon1 />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#c0c5d0] text-[16px] w-full">JavaScript frameworks make development easy with extensive features and functionalities.</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <HeadingAndText1 />
    </div>
  );
}

function BlogPostCard1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-[570px] top-[675px] w-[377px]" data-name="Blog post card">
      <Image1 />
      <Content1 />
    </div>
  );
}

function ABadge2() {
  return (
    <div className="absolute bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center left-[22px] px-[10px] py-[4px] rounded-[6px] top-[16px]" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">SHOPPING</p>
    </div>
  );
}

function Image2() {
  return (
    <div className="bg-center bg-cover bg-no-repeat h-[240px] overflow-clip relative shrink-0 w-full" data-name="Image" style={{ backgroundImage: `url('${imgImage2}')` }}>
      <ABadge2 />
    </div>
  );
}

function ArrowUpRight2() {
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

function IconWrap2() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-0 relative shrink-0" data-name="Icon wrap">
      <ArrowUpRight2 />
    </div>
  );
}

function HeadingAndIcon2() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Heading and icon">
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow h-[42px] leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#000441] text-[24px]">
        <p className="mb-[24px]">Bon plan shooping</p>
        <p>&nbsp;</p>
      </div>
      <IconWrap2 />
    </div>
  );
}

function HeadingAndText2() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Heading and text">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#6941c6] text-[14px] w-full">Sunday , 1 Jan 2023</p>
      <HeadingAndIcon2 />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#c0c5d0] text-[16px] w-full">JavaScript frameworks make development easy with extensive features and functionalities.</p>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <HeadingAndText2 />
    </div>
  );
}

function BlogPostCard2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-[989px] top-[675px] w-[377px]" data-name="Blog post card">
      <Image2 />
      <Content2 />
    </div>
  );
}

function ABadge3() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge3 />
      <p className="font-['Work_Sans:SemiBold',_sans-serif] font-semibold leading-[40px] relative shrink-0 text-[36px] text-white w-[720px]">Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks</p>
    </div>
  );
}

function AAuthor() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage3}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <Heading />
      <ShortInfo />
    </div>
  );
}

function MPostCardOverlay() {
  return (
    <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[450px] items-center justify-end left-[151px] overflow-clip p-[40px] rounded-[12px] top-[186px] w-[1216px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay}')` }}>
      <Content3 />
    </div>
  );
}

function Group143726116() {
  return (
    <div className="absolute contents left-[151px] top-[186px]">
      <BlogPostCard />
      <BlogPostCard1 />
      <BlogPostCard2 />
      <MPostCardOverlay />
    </div>
  );
}

function Group143726118() {
  return (
    <div className="absolute contents left-[151px] top-[186px]">
      <Group143726116 />
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
    <div className="absolute h-[59px] left-[1169px] top-[58px] w-[252px]" data-name="btn+_2">
      <Btnprimaire22 />
      <div className="absolute inset-[34.04%_72.51%_31.77%_18.96%]" data-name="Vector_121">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
          <path d={svgPaths.p1a3da900} fill="var(--fill-0, #000441)" id="Vector_121" />
        </svg>
      </div>
    </div>
  );
}

function Group143726098() {
  return (
    <div className="absolute contents top-[64px] translate-x-[-50%]" style={{ left: "calc(50% - 423px)" }}>
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold h-[48px] leading-[1.005] not-italic text-[#000441] text-[48px] top-[64px] w-[486px]" style={{ left: "calc(50% - 666px)" }}>
        Bon plan et évasion
      </p>
    </div>
  );
}

function Group143726105() {
  return (
    <div className="absolute contents left-[90px] top-[58px]">
      <Btn2 />
      <Group143726098 />
    </div>
  );
}

function Group143726117() {
  return (
    <div className="absolute contents left-[90px] top-[58px]">
      <Group143726105 />
    </div>
  );
}

export default function Frame18278() {
  return (
    <div className="relative size-full">
      <Group143726118 />
      <Group143726117 />
    </div>
  );
}