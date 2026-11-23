import {
  Award,
  DollarSign,
  Leaf,
  Lightbulb,
  Medal,
  Network,
  Recycle,
  Road,
  Route,
  ShieldCheck,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  award: Award,
  dollar: DollarSign,
  leaf: Leaf,
  lightbulb: Lightbulb,
  medal: Medal,
  network: Network,
  recycle: Recycle,
  road: Road,
  route: Route,
  shield: ShieldCheck,
  users: Users,
  waves: Waves,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = icons[name] ?? Award;
  return <C className={className} aria-hidden />;
}

/* Brand icons are not in lucide, so these are simple inline SVGs. */
const socialPaths: Record<string, string> = {
  facebook:
    "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.5v-7h-2.4v-2.8h2.4V9.1c0-2.4 1.5-3.7 3.6-3.7 1 0 2 .1 2.3.1v2.6h-1.6c-1.2 0-1.4.6-1.4 1.4v1.7h2.8l-.4 2.8h-2.4v7H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z",
  twitter:
    "M22 5.9a8.3 8.3 0 0 1-2.4.7 4.1 4.1 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.8a4.1 4.1 0 0 0 1.3 5.5 4.1 4.1 0 0 1-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4.1 4.1 0 0 1-1.8.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.5 11.6 11.6 0 0 0 8.3 20.3c7.5 0 11.7-6.2 11.7-11.7v-.5A8.3 8.3 0 0 0 22 5.9Z",
  instagram:
    "M3 3h18v18H3V3Zm2 2v14h14V5H5Zm7 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4.3-3.3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z",
  linkedin:
    "M3 3h18v18H3V3Zm4.3 7.5H5.1V18h2.2v-7.5ZM6.2 6.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm11.7 6.8c0-2.2-1.2-3.1-2.8-3.1-1.3 0-1.9.7-2.2 1.2v-1h-2.2V18h2.2v-4c0-1.1.4-1.8 1.4-1.8.9 0 1.4.6 1.4 1.8v4h2.2v-4.6Z",
};

export function SocialIcon({ name, className }: { name: keyof typeof socialPaths | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={socialPaths[name]} fillRule="evenodd" />
    </svg>
  );
}
