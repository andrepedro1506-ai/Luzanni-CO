import { PanelLeft, Search } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
  subtitle: string;
}

export function Topbar({ onMenuClick, title, subtitle }: TopbarProps) {
  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <button
          onClick={onMenuClick}
          className="flex size-11 items-center justify-center rounded-xl border border-border text-text-secondary hover:bg-surface-hover lg:hidden"
          aria-label="abrir menu"
        >
          <PanelLeft className="size-5" />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold lowercase">{title}</h1>
          <p className="text-sm text-text-secondary lowercase">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-text-secondary sm:min-w-72">
          <Search className="size-4" />
          <span className="text-sm">buscar...</span>
        </div>
      </div>
      <div className="px-4 pb-4 lg:hidden">
        <h1 className="text-xl font-bold lowercase">{title}</h1>
        <p className="text-sm text-text-secondary lowercase">{subtitle}</p>
      </div>
    </header>
  );
}
