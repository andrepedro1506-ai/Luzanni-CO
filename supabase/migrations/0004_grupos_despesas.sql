-- Luzanni Finance: grupos de despesas (financeiro)

-- categorias de apoio para os grupos que ainda nao existem (mantem o DRE correto)
insert into categories (name, kind, dre_group, color) values
  ('Fornecedores', 'saida', 'cmv', '#7C3AED'),
  ('Custo Fixo', 'saida', 'despesas_operacionais', '#0D9488'),
  ('Custo Variado', 'saida', 'despesas_operacionais', '#DB2777'),
  ('Despesas Sócios', 'saida', 'despesas_operacionais', '#2563EB'),
  ('Pró-labore', 'saida', 'despesas_operacionais', '#DC2626')
on conflict do nothing;

create table if not exists expense_groups (
  id bigint generated always as identity primary key,
  name text not null,
  color text not null default '#0D9488',
  category_id bigint not null references categories(id)
);

insert into expense_groups (name, color, category_id)
select 'Fornecedores', '#7C3AED', id from categories where name = 'Fornecedores' and kind = 'saida'
union all
select 'Custo Fixo', '#0D9488', id from categories where name = 'Custo Fixo' and kind = 'saida'
union all
select 'Custo Variado', '#DB2777', id from categories where name = 'Custo Variado' and kind = 'saida'
union all
select 'Aluguel', '#D97706', id from categories where name = 'Aluguel' and kind = 'saida'
union all
select 'Despesas Sócios', '#2563EB', id from categories where name = 'Despesas Sócios' and kind = 'saida'
union all
select 'Pró-labore', '#DC2626', id from categories where name = 'Pró-labore' and kind = 'saida'
on conflict do nothing;

alter table transactions add column if not exists expense_group_id bigint references expense_groups(id);
create index if not exists idx_transactions_expense_group_id on transactions(expense_group_id);

alter table expense_groups enable row level security;
alter table expense_groups force row level security;

create policy expense_groups_authenticated_all on expense_groups
  for all
  to authenticated
  using (true)
  with check (true);
