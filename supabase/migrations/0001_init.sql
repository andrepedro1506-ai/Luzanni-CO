-- Luzanni Finance: schema inicial (categorias, transacoes)

create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  kind text not null check (kind in ('entrada', 'saida')),
  dre_group text not null check (dre_group in (
    'receita', 'deducoes', 'cmv', 'despesas_operacionais',
    'despesas_financeiras', 'receitas_financeiras'
  )),
  color text not null default '#2DD4BF'
);

create table if not exists transactions (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('entrada', 'saida')),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  category_id bigint not null references categories(id),
  status text not null default 'pago' check (status in ('pago', 'pendente')),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_transactions_category_id on transactions(category_id);

alter table categories enable row level security;
alter table categories force row level security;
alter table transactions enable row level security;
alter table transactions force row level security;

create policy categories_authenticated_all on categories
  for all
  to authenticated
  using (true)
  with check (true);

create policy transactions_authenticated_all on transactions
  for all
  to authenticated
  using (true)
  with check (true);

insert into categories (name, kind, dre_group, color) values
  ('Venda de calçados', 'entrada', 'receita', '#2DD4BF'),
  ('Venda de acessórios', 'entrada', 'receita', '#34D399'),
  ('Receita financeira', 'entrada', 'receitas_financeiras', '#3B82F6'),
  ('Impostos sobre venda', 'saida', 'deducoes', '#F5A623'),
  ('Devoluções', 'saida', 'deducoes', '#EF4444'),
  ('Matéria-prima e insumos', 'saida', 'cmv', '#9B6FFF'),
  ('Produção / fabricação', 'saida', 'cmv', '#FF4FA3'),
  ('Aluguel', 'saida', 'despesas_operacionais', '#F5A623'),
  ('Folha de pagamento', 'saida', 'despesas_operacionais', '#EF4444'),
  ('Marketing', 'saida', 'despesas_operacionais', '#9B6FFF'),
  ('Logística e frete', 'saida', 'despesas_operacionais', '#3B82F6'),
  ('Despesas administrativas', 'saida', 'despesas_operacionais', '#8B958F'),
  ('Juros e taxas bancárias', 'saida', 'despesas_financeiras', '#EF4444')
on conflict do nothing;
