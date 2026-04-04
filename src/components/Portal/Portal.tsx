import { createPortal } from "react-dom";
import type React from "react";

type PortalProps = {
  children: React.ReactNode;
  container?: Element;
};

/**
 * Renders children into a portal (defaults to document.body).
 * SSR-safe: renders nothing on the server.
 */
export function Portal({ children, container }: PortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, container ?? document.body);
}
