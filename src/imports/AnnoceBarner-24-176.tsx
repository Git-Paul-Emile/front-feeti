function Voir() {
  return (
    <div className="relative size-full" data-name="voir+">
      <div className="absolute bg-[#e43962] bottom-0 left-0 right-[3.17%] rounded-[40px] top-0" />
      <p className="absolute bottom-0 font-['Inter:Bold',_sans-serif] font-bold leading-[1.005] left-[3.17%] not-italic right-0 text-[24px] text-center text-white top-[13.95%]">Voir +</p>
    </div>
  );
}

function Group18276() {
  return (
    <div className="absolute contents font-['Nexa:Heavy',_sans-serif] left-[38px] not-italic text-white top-[90px] tracking-[-1px]">
      <p className="absolute h-[130px] leading-[0] left-[38px] text-[0px] text-[75px] top-[125px] w-[518px] whitespace-pre-wrap">
        <span className="font-['Inter:Black',_sans-serif] font-black leading-[130px] not-italic">BON-PLANS</span>
        <span className="leading-[60px]">{`.  `}</span>
      </p>
      <p className="absolute h-[60px] leading-[60px] left-[38px] text-[40px] top-[90px] w-[456px]">Consulter tous les</p>
    </div>
  );
}

export default function AnnoceBarner() {
  return (
    <div className="relative size-full" data-name="annoce barner">
      <div className="absolute bg-[#000441] h-[346px] left-0 rounded-[30px] top-0 w-[667px]" />
      <Group18276 />
      <div className="absolute h-[43px] left-[464px] top-[270px] w-[158px]" data-name="voir+">
        <Voir />
      </div>
    </div>
  );
}