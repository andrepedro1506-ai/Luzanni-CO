import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "ghost" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary font-semibold hover:opacity-90 px-4 py-2.5 rounded-xl",
  ghost:
    "border border-border text-text-primary hover:bg-surface-hover px-4 py-2.5 rounded-xl",
  icon: "border border-border text-text-primary hover:bg-surface-hover size-11 rounded-full flex items-center justify-center",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx("inline-flex items-center justify-center gap-2 transition-colors", variantClasses[variant], className)}
      {...props}
    />
  );
}
