# Luzanni Finance

Aplicativo de gestão financeira para a Luzanni (calçados femininos). Design inspirado no dashboard Frontix da marca: tema escuro, acento verde-água, cards arredondados.

## Estrutura

- `frontend/` — React + Vite + TypeScript + Tailwind CSS
- `backend/` — Express + SQLite (better-sqlite3)

## Rodando localmente

Backend (API na porta 3001):

```bash
cd backend
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
