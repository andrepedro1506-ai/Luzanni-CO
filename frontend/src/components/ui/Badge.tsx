import type { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeTone = "warning" | "success" | "danger" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  warning: "bg-warning-dim text-warning",
  success: "bg-primary-dim text-success",
  danger: "bg-danger-dim text-danger",
  neutral: "bg-surface-hover text-text-secondary",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold lowercase",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
