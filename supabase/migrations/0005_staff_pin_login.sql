-- Luzanni Finance: login por PIN para colaboradores

create table if not exists staff (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique
);

alter table staff enable row level security;
alter table staff force row level security;

-- precisa ser legível por quem ainda não fez login, para montar a tela de PIN
create policy staff_anon_select on staff
  for select
  to anon, authenticated
  using (true);
