"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { src: string; width: number; height: number };

/** Cross-fading images that change every 5 seconds, with dots to pick one. */
export function Slideshow({ images, cover = false }: { images: Slide[]; cover?: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className={`relative ${cover ? "h-full" : "aspect-[4/3]"}`}>
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt=""
          fill
          priority={i === 0}
          sizes={cover ? "100vw" : "(min-width: 1024px) 560px, 100vw"}
          className={`object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className="flex size-8 items-center justify-center"
            >
              <span className={`block size-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
