-- Luzanni Finance: suporte a múltiplas lojas

create table if not exists stores (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique
);

insert into stores (name, slug) values
  ('Alecrim', 'alecrim'),
  ('Nova Parnamirim', 'nova-parnamirim')
on conflict do nothing;

alter table transactions add column if not exists store_id bigint references stores(id);
alter table orders add column if not exists store_id bigint references stores(id);

update transactions set store_id = (select id from stores order by id limit 1) where store_id is null;
update orders set store_id = (select id from stores order by id limit 1) where store_id is null;

alter table transactions alter column store_id set not null;
alter table orders alter column store_id set not null;

create index if not exists idx_transactions_store_id on transactions(store_id);
create index if not exists idx_orders_store_id on orders(store_id);

alter table stores enable row level security;
alter table stores force row level security;

create policy stores_authenticated_all on stores
  for all
  to authenticated
  using (true)
  with check (true);
