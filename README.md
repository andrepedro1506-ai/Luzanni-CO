# Luzanni Finance

Aplicativo de gestão financeira para a Luzanni (calçados femininos). Design inspirado no dashboard Frontix da marca: tema escuro, acento verde-água, cards arredondados.

## Estrutura

- `frontend/` — React + Vite + TypeScript + Tailwind CSS
- `backend/` — Express + Postgres (Supabase)
- `supabase/migrations/` — schema do banco (categorias, transações, RLS)

## Rodando localmente

Backend (API na porta 3001). Copie `backend/.env.example` para `backend/.env` e preencha `DATABASE_URL` com a connection string do projeto Supabase (Project Settings → Database):

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend (porta 5173, com proxy de `/api` para o backend):

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

- **Fluxo de caixa**: entradas, saídas, saldo do período, contas a pagar/receber, distribuição por categoria e lista de transações.
- **Relatórios · DRE**: demonstrativo de resultado do exercício (receita bruta → lucro líquido) com gráfico e margem líquida.
