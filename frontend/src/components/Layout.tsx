import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "fluxo de caixa", subtitle: "entradas, saídas e saldo" },
  "/pedidos": { title: "pedidos", subtitle: "pedidos aos fornecedores, em r$ e em pares" },
  "/fornecedores": { title: "fornecedores", subtitle: "cadastro de fornecedores" },
  "/relatorios": { title: "relatórios · dre", subtitle: "demonstrativo de resultado" },
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: "luzanni fin", subtitle: "" };

  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 space-y-6 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
