-- ==========================================================
-- SAJ Dashboard — 0001_init_schema.sql
-- Enums, tabelas principais e triggers de updated_at
-- ==========================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type user_role as enum ('admin', 'staff', 'reviewer', 'viewer');
create type conteudo_tipo as enum ('foto', 'video', 'texto', 'depoimento', 'bastidor');
create type conteudo_status as enum ('rascunho', 'em_revisao', 'aprovado', 'publicado', 'rejeitado');
create type calendario_tipo as enum ('post', 'reel', 'story', 'evento', 'site');
create type calendario_status as enum ('planejado', 'em_producao', 'pronto', 'publicado', 'atrasado', 'cancelado');
create type plataforma as enum ('instagram', 'facebook', 'whatsapp', 'site', 'outro');
create type evento_status as enum ('agendado', 'confirmado', 'realizado', 'cancelado');

-- ---------- PROFILES (staff/reviewer/admin/viewer) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'viewer',
  avatar_url text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- OFICINAS ----------
create table oficinas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  cor text default '#6366f1', -- usado nas tags do calendário
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROFESSORES / EDUCADORES ----------
create table professores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  oficina_id uuid references oficinas(id) on delete set null,
  foto_url text,
  bio text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- CONTEÚDOS (fotos, vídeos, textos, depoimentos) ----------
create table conteudos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo conteudo_tipo not null default 'foto',
  oficina_id uuid references oficinas(id) on delete set null,
  professor_id uuid references professores(id) on delete set null,
  autor_id uuid references profiles(id) on delete set null,
  arquivo_url text,
  thumbnail_url text,
  descricao text,
  status conteudo_status not null default 'rascunho',
  data_captura date default current_date,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- CALENDÁRIO EDITORIAL ----------
create table calendario_editorial (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo calendario_tipo not null default 'post',
  plataforma plataforma not null default 'instagram',
  oficina_id uuid references oficinas(id) on delete set null,
  conteudo_id uuid references conteudos(id) on delete set null,
  responsavel_id uuid references profiles(id) on delete set null,
  data_publicacao date not null,
  hora_publicacao time,
  status calendario_status not null default 'planejado',
  legenda text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- EVENTOS (cobertura mensal) ----------
create table eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data_evento date not null,
  local text,
  oficina_id uuid references oficinas(id) on delete set null,
  status evento_status not null default 'agendado',
  cobertura_conteudo_id uuid references conteudos(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- REVISÕES (histórico de aprovação/reprovação) ----------
create table revisoes (
  id uuid primary key default gen_random_uuid(),
  conteudo_id uuid references conteudos(id) on delete cascade,
  calendario_id uuid references calendario_editorial(id) on delete cascade,
  revisor_id uuid references profiles(id) on delete set null,
  status conteudo_status not null,
  comentario text,
  created_at timestamptz not null default now(),
  constraint revisao_alvo_check check (
    (conteudo_id is not null and calendario_id is null) or
    (conteudo_id is null and calendario_id is not null)
  )
);

-- ---------- índices ----------
create index idx_conteudos_oficina on conteudos(oficina_id);
create index idx_conteudos_professor on conteudos(professor_id);
create index idx_conteudos_status on conteudos(status);
create index idx_calendario_data on calendario_editorial(data_publicacao);
create index idx_calendario_status on calendario_editorial(status);
create index idx_eventos_data on eventos(data_evento);

-- ---------- trigger genérico updated_at ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_oficinas_updated before update on oficinas for each row execute function set_updated_at();
create trigger trg_professores_updated before update on professores for each row execute function set_updated_at();
create trigger trg_conteudos_updated before update on conteudos for each row execute function set_updated_at();
create trigger trg_calendario_updated before update on calendario_editorial for each row execute function set_updated_at();
create trigger trg_eventos_updated before update on eventos for each row execute function set_updated_at();

-- ---------- cria profile automaticamente ao registrar usuário ----------
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'viewer');
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
