export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <div className="h-2.5 w-full rounded-full bg-primary-dim">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
