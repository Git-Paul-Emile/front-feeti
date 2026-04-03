import imgImage from "figma:asset/f3274229ec54609ce8242bd3168cea0902f3a40f.png";
import imgMPostCardOverlay1 from "figma:asset/bb8c9042cb85fe18dc8a8c42df2368bfe203b132.png";

function ABadge() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge />
      <p className="font-['Work_Sans:SemiBold',_sans-serif] font-semibold leading-[40px] relative shrink-0 text-[36px] text-white w-[720px]">Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks</p>
    </div>
  );
}

function AAuthor() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
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

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <Heading />
      <ShortInfo />
    </div>
  );
}

function MPostCardOverlay1() {
  return (
    <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[450px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[1216px]" data-name="m-post-card-overlay1" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }}>
      <Content />
    </div>
  );
}

function MPostCardOverlay() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge2() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge2 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo2() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor2 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading2 />
      <ShortInfo2 />
    </div>
  );
}

function Frame18279() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-0 px-[40px] py-[50px] top-[483px] w-[597px]">
      <MPostCardOverlay />
      <Content2 />
    </div>
  );
}

function MPostCardOverlay2() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge4() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge4 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo4() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor4 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading4 />
      <ShortInfo4 />
    </div>
  );
}

function Frame18280() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-[637px] px-[40px] py-[50px] top-[483px] w-[597px]">
      <MPostCardOverlay2 />
      <Content4 />
    </div>
  );
}

function Group143726119() {
  return (
    <div className="absolute contents left-0 top-[483px]">
      <Frame18279 />
      <Frame18280 />
    </div>
  );
}

function MPostCardOverlay3() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge6() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge6 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo6() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor6 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading6 />
      <ShortInfo6 />
    </div>
  );
}

function Frame18281() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-0 px-[40px] py-[50px] top-[1048px] w-[597px]">
      <MPostCardOverlay3 />
      <Content6 />
    </div>
  );
}

function MPostCardOverlay4() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge8() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge8 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor8() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo8() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor8 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content8() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading8 />
      <ShortInfo8 />
    </div>
  );
}

function Frame18282() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-[637px] px-[40px] py-[50px] top-[1048px] w-[597px]">
      <MPostCardOverlay4 />
      <Content8 />
    </div>
  );
}

function Group143726120() {
  return (
    <div className="absolute contents left-0 top-[1048px]">
      <Frame18281 />
      <Frame18282 />
    </div>
  );
}

function MPostCardOverlay5() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge10() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge10 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo10() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor10 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content10() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading10 />
      <ShortInfo10 />
    </div>
  );
}

function Frame18283() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-0 px-[40px] py-[50px] top-[2001px] w-[597px]">
      <MPostCardOverlay5 />
      <Content10 />
    </div>
  );
}

function MPostCardOverlay6() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge12() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge12 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor12() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo12() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor12 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content12() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading12 />
      <ShortInfo12 />
    </div>
  );
}

function Frame18284() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-[637px] px-[40px] py-[50px] top-[2001px] w-[597px]">
      <MPostCardOverlay6 />
      <Content12 />
    </div>
  );
}

function Group143726121() {
  return (
    <div className="absolute contents left-0 top-[2001px]">
      <Frame18283 />
      <Frame18284 />
    </div>
  );
}

function MPostCardOverlay7() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge14() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading14() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge14 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor14() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo14() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor14 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content14() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading14 />
      <ShortInfo14 />
    </div>
  );
}

function Frame18285() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-0 px-[40px] py-[50px] top-[2566px] w-[597px]">
      <MPostCardOverlay7 />
      <Content14 />
    </div>
  );
}

function MPostCardOverlay8() {
  return <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[525px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-0 w-[597px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }} />;
}

function ABadge16() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading16() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge16 />
      <p className="font-['Roboto:Regular',_sans-serif] font-normal leading-[36px] min-w-full relative shrink-0 text-[28px] text-white" style={{ width: "min-content", fontVariationSettings: "'wdth' 100" }}>
        Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
    </div>
  );
}

function AAuthor16() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo16() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor16 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content16() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-end relative shrink-0 w-[517px]" data-name="Content">
      <Heading16 />
      <ShortInfo16 />
    </div>
  );
}

function Frame18286() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[525px] items-start justify-end left-[637px] px-[40px] py-[50px] top-[2566px] w-[597px]">
      <MPostCardOverlay8 />
      <Content16 />
    </div>
  );
}

function Group143726122() {
  return (
    <div className="absolute contents left-0 top-[2566px]">
      <Frame18285 />
      <Frame18286 />
    </div>
  );
}

function ABadge17() {
  return (
    <div className="bg-[#de0035] box-border content-stretch flex gap-[4px] items-center justify-center px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="a-badge">
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">{`VOYAGE `}</p>
    </div>
  );
}

function Heading17() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Heading">
      <ABadge17 />
      <p className="font-['Work_Sans:SemiBold',_sans-serif] font-semibold leading-[40px] relative shrink-0 text-[36px] text-white w-[720px]">Un moment d’évasion et de vives émotions au parc Odzala-Kokoua - African Parks</p>
    </div>
  );
}

function AAuthor17() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="a-author">
      <div className="bg-center bg-cover bg-no-repeat rounded-[28px] shrink-0 size-[36px]" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <p className="font-['Work_Sans:Medium',_sans-serif] font-medium leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">Tracey Wilson</p>
    </div>
  );
}

function ShortInfo17() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Short Info">
      <AAuthor17 />
      <p className="font-['Work_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">August 20, 2022</p>
    </div>
  );
}

function Content17() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Content">
      <Heading17 />
      <ShortInfo17 />
    </div>
  );
}

function MPostCardOverlay9() {
  return (
    <div className="absolute bg-[position:0%_0%,_50%_50%] bg-[rgba(20,22,36,0.4)] bg-size-[auto,cover] box-border content-stretch flex flex-col gap-[10px] h-[348px] items-center justify-end left-0 overflow-clip p-[40px] rounded-[12px] top-[1613px] w-[1234px]" data-name="m-post-card-overlay" style={{ backgroundImage: `url('${imgMPostCardOverlay1}')` }}>
      <Content17 />
    </div>
  );
}

export default function Group143726123() {
  return (
    <div className="relative size-full">
      <MPostCardOverlay1 />
      <Group143726119 />
      <Group143726120 />
      <Group143726121 />
      <Group143726122 />
      <MPostCardOverlay9 />
    </div>
  );
}