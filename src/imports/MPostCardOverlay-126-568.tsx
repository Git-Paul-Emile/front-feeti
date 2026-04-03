import imgImage from "figma:asset/f3274229ec54609ce8242bd3168cea0902f3a40f.png";
import imgMPostCardOverlay from "figma:asset/bb8c9042cb85fe18dc8a8c42df2368bfe203b132.png";

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
      <p className="font-['Work_Sans:SemiBold',_sans-serif] font-semibold leading-tight relative shrink-0 text-white max-w-full sm:max-w-[720px] text-2xl sm:text-3xl lg:text-4xl">
        Un moment d'évasion et de vives émotions au parc Odzala-Kokoua - African Parks
      </p>
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

interface MPostCardOverlayProps {
  onNavigate?: (page: string) => void;
}

export default function MPostCardOverlay({ onNavigate }: MPostCardOverlayProps) {
  return (
    <div 
      className="bg-center bg-cover relative rounded-[12px] size-full cursor-pointer hover:opacity-95 transition-opacity duration-300 overflow-hidden" 
      data-name="m-post-card-overlay" 
      style={{ backgroundImage: `url('${imgMPostCardOverlay}')` }}
      onClick={() => onNavigate?.('blog')}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="flex flex-col items-center justify-end relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-end overflow-clip p-6 sm:p-8 lg:p-[40px] relative size-full">
          <Content />
        </div>
      </div>
    </div>
  );
}