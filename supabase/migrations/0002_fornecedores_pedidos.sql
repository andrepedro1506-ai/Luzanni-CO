-- Luzanni Finance: fornecedores e pedidos

create table if not exists suppliers (
  id bigint generated always as identity primary key,
  name text not null,
  cnpj text,
  contact_name text,
  phone text,
  email text,
  city text,
  state text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  supplier_id bigint not null references suppliers(id),
  order_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  pairs_quantity integer not null check (pairs_quantity > 0),
  has_invoice boolean not null default true,
  payment_method text not null check (payment_method in (
    'pix', 'boleto', 'cartao_credito', 'transferencia', 'dinheiro', 'outro'
  )),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_order_date on orders(order_date);
create index if not exists idx_orders_supplier_id on orders(supplier_id);

alter table suppliers enable row level security;
alter table suppliers force row level security;
alter table orders enable row level security;
alter table orders force row level security;

create policy suppliers_authenticated_all on suppliers
  for all
  to authenticated
  using (true)
  with check (true);

create policy orders_authenticated_all on orders
  for all
  to authenticated
  using (true)
  with check (true);
