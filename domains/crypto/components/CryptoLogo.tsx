"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

interface CryptoLogoProps {
  src: string;
  name: string;
  symbol: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function CryptoLogo({
  src,
  name,
  symbol,
  size = 40,
  className,
  priority,
}: CryptoLogoProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackText = useMemo(() => symbol.slice(0, 2).toUpperCase(), [symbol]);

  if (imgError || !src) {
    return (
      <span
        aria-label={`${name} fallback logo`}
        className={`flex items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-bold text-[var(--text-primary)] ${className ?? ""}`.trim()}
        style={{ width: size, height: size }}
      >
        {fallbackText}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={className}
      onError={() => setImgError(true)}
      priority={priority}
    />
  );
}