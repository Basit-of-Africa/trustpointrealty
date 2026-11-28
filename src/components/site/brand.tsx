import { images } from "@/content/site";
import {
  Building2,
  Cpu,
  Droplets,
  Dumbbell,
  Lamp,
  MapPin,
  Palmtree,
  Road,
  ShieldCheck,
  Store,
  Trees,
  Trophy,
  Waves,
} from "lucide-react";

/**
 * The TrustPoint logo. The original image file was lost with the WordPress
 * hosting; until `images.logo` is set, this renders a text wordmark in the
 * same style (bold name over letter-spaced "REALTY").
 */
export function Logo({ light = false }: { light?: boolean }) {
  if (images.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={images.logo} alt="TrustPoint Realty" width={152} height={48} className="h-12 w-auto" />;
  }
  return (
    <span className="flex flex-col leading-none" aria-label="TrustPoint Realty">
      <span className={`font-heading text-[19px] font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}>
        TRUST<span className="text-accent-500">POINT</span>
      </span>
      <span className={`mt-1 text-[11px] tracking-[0.55em] ${light ? "text-white" : "text-brand-900"}`}>REALTY</span>
    </span>
  );
}

const features = [
  { label: "Prime Location", icon: MapPin },
  { label: "Premium Security", icon: ShieldCheck },
  { label: "Road Network", icon: Road },
  { label: "Street Lights", icon: Lamp },
  { label: "Drainage System", icon: Waves },
  { label: "Recreational Area", icon: Building2 },
  { label: "Tech Hub", icon: Cpu },
  { label: "Central Water Supply", icon: Droplets },
  { label: "Gym Facility", icon: Dumbbell },
  { label: "Commercial Area", icon: Store },
  { label: "Coconut Trees", icon: Palmtree },
  { label: "Sport Complex", icon: Trophy },
  { label: "Green Area", icon: Trees },
];

/** The row of estate-feature icons (the old site used a single image for this). */
export function FeatureStrip({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`grid ${compact ? "grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-7" : "grid-cols-3 gap-6 sm:grid-cols-5 lg:grid-cols-13"}`}>
      {features.map(({ label, icon: I }) => (
        <li key={label} className="flex flex-col items-center text-center text-brand-900">
          <I className={compact ? "h-6 w-6" : "h-12 w-12"} strokeWidth={1.75} aria-hidden />
          <span className={`mt-2 font-heading leading-tight font-semibold ${compact ? "text-[9px]" : "text-[15px]"}`}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

/** City skyline silhouette for the bottom of the homepage call-to-action. */
export function Skyline({ className = "" }: { className?: string }) {
  // Buildings as [x, width, height]; drawn in a 1200x220 box, anchored to the bottom.
  const blocks: [number, number, number][] = [
    [0, 70, 70], [60, 50, 120], [105, 80, 90], [180, 40, 150], [215, 90, 110], [300, 55, 170], [350, 70, 95],
    [415, 45, 135], [455, 110, 80], [560, 60, 160], [615, 85, 120], [695, 40, 195], [730, 95, 100], [820, 60, 145],
    [875, 80, 85], [950, 50, 125], [995, 100, 95], [1090, 55, 155], [1140, 60, 75],
  ];
  return (
    <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <g fill="currentColor">
        {blocks.map(([x, w, h]) => (
          <rect key={x} x={x} y={220 - h} width={w} height={h} />
        ))}
        {/* trees */}
        {[40, 330, 600, 905, 1170].map((x) => (
          <circle key={x} cx={x} cy={185} r={26} />
        ))}
      </g>
      <g fill="#040b20" opacity="0.55">
        {blocks.flatMap(([x, w, h]) =>
          Array.from({ length: Math.floor((h - 20) / 22) }, (_, row) =>
            Array.from({ length: Math.max(1, Math.floor((w - 10) / 18)) }, (_, col) => (
              <rect key={`${x}-${row}-${col}`} x={x + 8 + col * 18} y={220 - h + 12 + row * 22} width={8} height={10} />
            )),
          ).flat(),
        )}
      </g>
    </svg>
  );
}

export function IllustrativeTag() {
  return (
    <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">Illustrative photo</span>
  );
}
