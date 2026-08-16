import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/Card";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "danger" | "warning";
}

const toneText: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-text-primary",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
};

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm lowercase text-text-secondary">{label}</p>
        <p className={clsx("mt-2 text-2xl font-bold", toneText[tone])}>{value}</p>
      </div>
      <div className="flex size-11 items-center justify-center rounded-xl bg-surface-hover text-text-secondary">
        <Icon className="size-5" />
      </div>
    </Card>
  );
}
