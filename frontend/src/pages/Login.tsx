import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "bom dia";
  if (hour < 18) return "boa tarde";
  return "boa noite";
}

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError("e-mail ou senha inválidos");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 sm:p-10">
        <div className="flex items-start justify-between">
          <div className="text-3xl font-extrabold tracking-tight">
            luzanni<span className="text-primary">fin</span>
          </div>
          <p className="pt-2 text-xs uppercase tracking-widest text-text-secondary">
            {greeting()}
          </p>
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight lowercase">
          veja seu caixa com clareza
        </h1>
        <p className="mt-2 text-sm lowercase text-text-secondary">
          entenda seus resultados e saiba onde melhorar hoje.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm lowercase text-text-secondary">e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@luzanni.com.br"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm lowercase text-text-secondary">senha</label>
              <a href="#" className="text-sm lowercase text-primary hover:underline">
                esqueci minha senha
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="digite sua senha"
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 pr-11 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label={showPassword ? "ocultar senha" : "mostrar senha"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm lowercase text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold lowercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "entrando..." : "entrar no painel"}
            <ArrowRight className="size-4" />
          </button>

          <p className="text-center text-xs lowercase text-text-secondary">
            pressione <kbd className="rounded border border-border px-1.5 py-0.5">↵ enter</kbd> para entrar
          </p>
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs lowercase text-text-muted">
            © {new Date().getFullYear()} luzanni fin · gestão financeira da luzanni
          </p>
        </div>
      </div>
    </div>
  );
}
