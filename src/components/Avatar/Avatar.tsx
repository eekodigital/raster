import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import * as styles from "./Avatar.css.js";

type ImageStatus = "loading" | "loaded" | "error";
type AvatarCtx = { status: ImageStatus; setStatus: (s: ImageStatus) => void };
const AvatarCtx = createContext<AvatarCtx>({ status: "loading", setStatus: () => {} });

type AvatarSize = "sm" | "md" | "lg";

interface AvatarRootProps {
  size?: AvatarSize;
  square?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Root({ size = "md", square = false, className, children }: AvatarRootProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");
  const ctx = useMemo(() => ({ status, setStatus }), [status]);

  return (
    <AvatarCtx.Provider value={ctx}>
      <span className={cn(styles.root, styles.sizes[size], square && styles.rootSquare, className)}>
        {children}
      </span>
    </AvatarCtx.Provider>
  );
}

interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function Image({ src, alt, className }: AvatarImageProps) {
  const { status, setStatus } = useContext(AvatarCtx);

  // Preload the image off-screen so onload fires reliably
  useEffect(() => {
    setStatus("loading");
    const img = new globalThis.Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;
  }, [src, setStatus]);

  if (status !== "loaded") return null;

  return <img src={src} alt={alt} className={cn(styles.image, className)} />;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

export function Fallback({ children, delayMs = 600, className }: AvatarFallbackProps) {
  const { status } = useContext(AvatarCtx);
  const [show, setShow] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (status === "loaded") return null;
  if (!show) return null;
  return <span className={cn(styles.fallback, className)}>{children}</span>;
}
