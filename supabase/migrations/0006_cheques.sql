-- Luzanni Finance: controle de cheques recebidos/emitidos

create table if not exists cheques (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('recebido', 'emitido')),
  numero text not null,
  valor numeric(12, 2) not null check (valor > 0),
  data_vencimento date not null,
  contraparte text not null,
  status text not null default 'pendente' check (status in ('pendente', 'compensado', 'devolvido')),
  store_id bigint not null references stores(id),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_cheques_data_vencimento on cheques(data_vencimento);
create index if not exists idx_cheques_store_id on cheques(store_id);
create index if not exists idx_cheques_status on cheques(status);

alter table cheques enable row level security;
alter table cheques force row level security;

create policy cheques_authenticated_all on cheques
  for all
  to authenticated
  using (true)
  with check (true);
