import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StoreProvider } from "./context/StoreContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { FluxoDeCaixa } from "./pages/FluxoDeCaixa";
import { Financeiro } from "./pages/Financeiro";
import { GruposDespesas } from "./pages/GruposDespesas";
import { Pedidos } from "./pages/Pedidos";
import { Fornecedores } from "./pages/Fornecedores";
import { Relatorios } from "./pages/Relatorios";

function Gate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-text-secondary">
        carregando...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<FluxoDeCaixa />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/grupos-despesas" element={<GruposDespesas />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
