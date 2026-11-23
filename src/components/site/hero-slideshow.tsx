"use client";

import { useEffect, useState } from "react";

/** Background slideshow for the homepage hero (5 images, slides every 5s). */
export function HeroSlideshow({ slides }: { slides: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {slides.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url("${src}")`, opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
