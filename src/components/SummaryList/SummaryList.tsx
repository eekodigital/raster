import { createContext, useContext } from "react";
import * as styles from "./SummaryList.css.js";

type SummaryListVariant = "default" | "plain";

const VariantCtx = createContext<SummaryListVariant>("default");

export function SummaryList({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: SummaryListVariant;
  className?: string;
}) {
  const listStyle = variant === "plain" ? styles.listPlain : styles.list;
  const cls = [listStyle, className].filter(Boolean).join(" ");
  return (
    <VariantCtx.Provider value={variant}>
      <dl className={cls}>{children}</dl>
    </VariantCtx.Provider>
  );
}

export function SummaryListRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const variant = useContext(VariantCtx);
  const rowStyle = variant === "plain" ? styles.rowPlain : styles.row;
  const cls = [rowStyle, className].filter(Boolean).join(" ");
  return <div className={cls}>{children}</div>;
}

export function SummaryListKey({ children }: { children: React.ReactNode }) {
  const variant = useContext(VariantCtx);
  return <dt className={variant === "plain" ? styles.keyPlain : styles.key}>{children}</dt>;
}

export function SummaryListValue({ children }: { children: React.ReactNode }) {
  return <dd className={styles.value}>{children}</dd>;
}

export function SummaryListActions({ children }: { children: React.ReactNode }) {
  return <dd className={styles.actions}>{children}</dd>;
}
