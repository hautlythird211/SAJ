-- ==========================================================
-- SAJ Dashboard — 0002_rls_policies.sql
-- Regras de acesso por papel: admin / staff / reviewer / viewer / anon (público)
-- ==========================================================

alter table profiles enable row level security;
alter table oficinas enable row level security;
alter table professores enable row level security;
alter table conteudos enable row level security;
alter table calendario_editorial enable row level security;
alter table eventos enable row level security;
alter table revisoes enable row level security;

-- ---------- helper: papel do usuário autenticado ----------
create or replace function auth_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function is_staff_or_above()
returns boolean language sql stable security definer as $$
  select coalesce(auth_role() in ('staff', 'reviewer', 'admin'), false);
$$;

create or replace function is_reviewer_or_above()
returns boolean language sql stable security definer as $$
  select coalesce(auth_role() in ('reviewer', 'admin'), false);
$$;

create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(auth_role() = 'admin', false);
$$;

-- ---------- PROFILES ----------
create policy "profiles: leitura autenticada" on profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles: usuário edita a si mesmo" on profiles
  for update using (id = auth.uid());
create policy "profiles: admin gerencia tudo" on profiles
  for all using (is_admin()) with check (is_admin());

-- ---------- OFICINAS ----------
create policy "oficinas: leitura pública" on oficinas
  for select using (true);
create policy "oficinas: staff gerencia" on oficinas
  for insert with check (is_staff_or_above());
create policy "oficinas: staff atualiza" on oficinas
  for update using (is_staff_or_above());
create policy "oficinas: admin exclui" on oficinas
  for delete using (is_admin());

-- ---------- PROFESSORES ----------
create policy "professores: leitura pública" on professores
  for select using (ativo = true);
create policy "professores: staff leitura completa" on professores
  for select using (is_staff_or_above());
create policy "professores: staff insere" on professores
  for insert with check (is_staff_or_above());
create policy "professores: staff atualiza" on professores
  for update using (is_staff_or_above());
create policy "professores: admin exclui" on professores
  for delete using (is_admin());

-- ---------- CONTEÚDOS ----------
-- público só vê conteúdo publicado
create policy "conteudos: leitura pública apenas publicados" on conteudos
  for select using (status = 'publicado');
-- staff/reviewer/admin veem tudo
create policy "conteudos: staff leitura completa" on conteudos
  for select using (is_staff_or_above());
-- staff cria e edita seus próprios rascunhos / em_revisao
create policy "conteudos: staff insere" on conteudos
  for insert with check (is_staff_or_above());
create policy "conteudos: staff atualiza não publicados" on conteudos
  for update using (is_staff_or_above() and status <> 'publicado')
  with check (is_staff_or_above());
-- reviewer/admin podem mudar status (aprovar, rejeitar, publicar)
create policy "conteudos: reviewer aprova" on conteudos
  for update using (is_reviewer_or_above())
  with check (is_reviewer_or_above());
create policy "conteudos: admin exclui" on conteudos
  for delete using (is_admin());

-- ---------- CALENDÁRIO EDITORIAL ----------
create policy "calendario: leitura pública apenas publicado" on calendario_editorial
  for select using (status = 'publicado');
create policy "calendario: staff leitura completa" on calendario_editorial
  for select using (is_staff_or_above());
create policy "calendario: staff insere" on calendario_editorial
  for insert with check (is_staff_or_above());
create policy "calendario: staff atualiza" on calendario_editorial
  for update using (is_staff_or_above()) with check (is_staff_or_above());
create policy "calendario: admin exclui" on calendario_editorial
  for delete using (is_admin());

-- ---------- EVENTOS ----------
create policy "eventos: leitura pública" on eventos
  for select using (status in ('confirmado', 'realizado'));
create policy "eventos: staff leitura completa" on eventos
  for select using (is_staff_or_above());
create policy "eventos: staff insere" on eventos
  for insert with check (is_staff_or_above());
create policy "eventos: staff atualiza" on eventos
  for update using (is_staff_or_above());
create policy "eventos: admin exclui" on eventos
  for delete using (is_admin());

-- ---------- REVISÕES (somente staff+) ----------
create policy "revisoes: staff leitura" on revisoes
  for select using (is_staff_or_above());
create policy "revisoes: reviewer insere" on revisoes
  for insert with check (is_reviewer_or_above());
