import svgPaths from "./svg-12mm8ldurx";

function Group() {
  return (
    <div className="absolute bottom-0 left-[73.81%] right-0 top-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 73 69">
        <g id="Group">
          <path d={svgPaths.p121ed80} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p3cd33800} fill="var(--fill-0, #811AEC)" id="Vector_2" />
          <path d={svgPaths.p3cb18100} fill="var(--fill-0, #F1C519)" id="Vector_3" />
          <path d={svgPaths.p5e42700} fill="var(--fill-0, #E43962)" id="Vector_4" />
          <path d={svgPaths.p2c04e100} fill="var(--fill-0, #16BDA0)" id="Vector_5" />
          <path d={svgPaths.p16f13700} fill="var(--fill-0, #811AEC)" id="Vector_6" />
          <path d={svgPaths.p3276d900} fill="var(--fill-0, #F1C519)" id="Vector_7" />
          <path d={svgPaths.p381ee072} fill="var(--fill-0, #E43962)" id="Vector_8" />
          <path d={svgPaths.p1d65a100} fill="var(--fill-0, #16BDA0)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute bottom-[8.01%] left-0 right-[28.1%] top-[8.01%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 199 58">
        <g id="Group">
          <path d={svgPaths.p3e0edf00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pa7c9600} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p3e8bf480} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p3154e300} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p1bf16c00} fill="var(--fill-0, white)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

export default function Logo() {
  return (
    <div className="relative size-full" data-name="logo">
      <Group />
      <Group1 />
    </div>
  );
}