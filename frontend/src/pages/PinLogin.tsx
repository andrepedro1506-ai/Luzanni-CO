import { useEffect, useState } from "react";
import { Delete, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface StaffMember {
  id: number;
  name: string;
  email: string;
}

const PIN_LENGTH = 4;

export function PinLogin({ onBack }: { onBack: () => void }) {
  const { signIn } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("staff")
      .select("id, name, email")
      .order("name")
      .then(({ data }) => {
        setStaff(data ?? []);
        setLoadingStaff(false);
      });
  }, []);

  useEffect(() => {
    if (!selected || pin.length !== PIN_LENGTH) return;
    let cancelled = false;
    setSubmitting(true);
    setError(null);
    signIn(selected.email, pin).then(({ error }) => {
      if (cancelled) return;
      setSubmitting(false);
      if (error) {
        setError("pin incorreto");
        setPin("");
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, selected]);

  function pressDigit(digit: string) {
    if (submitting || pin.length >= PIN_LENGTH) return;
    setError(null);
    setPin((p) => p + digit);
  }

  function pressBackspace() {
    if (submitting) return;
    setPin((p) => p.slice(0, -1));
  }

  if (!selected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4 text-text-primary">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-text-secondary hover:text-text-primary"
              aria-label="voltar"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="text-3xl font-extrabold tracking-tight">
              luzanni<span className="text-primary">fin</span>
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-bold leading-tight lowercase">quem é você?</h1>
          <p className="mt-2 text-sm lowercase text-text-secondary">
            escolha seu nome para entrar com o pin
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {loadingStaff && (
              <p className="col-span-2 text-center text-sm lowercase text-text-secondary">
                carregando...
              </p>
            )}
            {!loadingStaff && staff.length === 0 && (
              <p className="col-span-2 text-center text-sm lowercase text-text-secondary">
                nenhum colaborador cadastrado
              </p>
            )}
            {staff.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelected(person)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg p-4 hover:border-primary"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-dim text-lg font-bold text-primary">
                  {person.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm lowercase text-text-primary">{person.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 text-text-primary">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 sm:p-10">
        <button
          onClick={() => {
            setSelected(null);
            setPin("");
            setError(null);
          }}
          className="flex items-center gap-2 text-sm lowercase text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          trocar usuário
        </button>

        <div className="mt-6 flex flex-col items-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-dim text-xl font-bold text-primary">
            {selected.name.charAt(0).toUpperCase()}
          </span>
          <p className="mt-3 text-lg font-semibold lowercase">{selected.name}</p>
          <p className="text-sm lowercase text-text-secondary">digite seu pin</p>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`size-4 rounded-full border border-border-strong ${
                i < pin.length ? "bg-primary border-primary" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm lowercase text-danger">{error}</p>
        )}

        <div className="mt-8 grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={submitting}
              onClick={() => pressDigit(digit)}
              className="rounded-xl border border-border bg-bg py-4 text-lg font-semibold hover:bg-surface-hover disabled:opacity-60"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            disabled={submitting}
            onClick={() => pressDigit("0")}
            className="rounded-xl border border-border bg-bg py-4 text-lg font-semibold hover:bg-surface-hover disabled:opacity-60"
          >
            0
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={pressBackspace}
            className="flex items-center justify-center rounded-xl border border-border bg-bg py-4 hover:bg-surface-hover disabled:opacity-60"
            aria-label="apagar"
          >
            <Delete className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
