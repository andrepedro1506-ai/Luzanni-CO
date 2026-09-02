import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Wallet,
  FileBarChart,
  Building2,
  ClipboardList,
  Receipt,
  ReceiptText,
  Tags,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "fluxo de caixa", icon: Wallet, end: true },
  { to: "/financeiro", label: "financeiro", icon: Receipt },
  { to: "/grupos-despesas", label: "grupos de despesas", icon: Tags },
  { to: "/pedidos", label: "pedidos", icon: ClipboardList },
  { to: "/cheques", label: "cheques", icon: ReceiptText },
  { to: "/fornecedores", label: "fornecedores", icon: Building2 },
  { to: "/relatorios", label: "relatórios · dre", icon: FileBarChart },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "L";

  return (
    <>
      {open && (
        <button
          aria-label="fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <div className="flex items-center gap-1 text-2xl font-extrabold tracking-tight">
              <LayoutDashboard className="size-6 text-primary" />
              <span>
                luzanni<span className="text-primary">fin</span>
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-text-secondary">calçados femininos</p>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="fechar menu">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            menu
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium lowercase transition-colors",
                  isActive
                    ? "bg-primary-dim text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-border px-4 py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-on-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{email || "Luzanni"}</p>
            <p className="text-xs text-text-secondary">diretoria</p>
          </div>
          <button onClick={signOut} aria-label="sair" title="sair">
            <LogOut className="size-4 text-text-secondary hover:text-text-primary" />
          </button>
        </div>
      </aside>
    </>
  );
}
