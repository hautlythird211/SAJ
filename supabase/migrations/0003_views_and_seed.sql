-- ==========================================================
-- SAJ Dashboard — 0003_views_and_seed.sql
-- Views agregadas (dashboard) + seed opcional de oficinas
-- ==========================================================

-- View: resumo mensal para os cards do dashboard
create or replace view vw_resumo_mensal as
select
  date_trunc('month', now())                                             as mes_referencia,
  (select count(*) from calendario_editorial
     where status = 'publicado'
       and date_trunc('month', data_publicacao) = date_trunc('month', now())) as publicacoes_mes,
  (select count(*) from conteudos where status = 'em_revisao')            as pendentes_revisao,
  (select count(*) from eventos
     where data_evento >= current_date
       and status in ('agendado', 'confirmado')
     limit 100)                                                           as proximos_eventos,
  (select count(*) from calendario_editorial
     where status = 'atrasado')                                          as publicacoes_atrasadas;

-- View: conteúdo agrupado por oficina/professor (para tela de organização)
create or replace view vw_conteudos_organizados as
select
  c.id, c.titulo, c.tipo, c.status, c.arquivo_url, c.thumbnail_url,
  c.data_captura, c.tags,
  o.id as oficina_id, o.nome as oficina_nome, o.cor as oficina_cor,
  p.id as professor_id, p.nome as professor_nome, p.foto_url as professor_foto
from conteudos c
left join oficinas o on o.id = c.oficina_id
left join professores p on p.id = c.professor_id;

-- View pública: feed publicado (usada pelo endpoint público)
create or replace view vw_feed_publico as
select
  c.id, c.titulo, c.tipo, c.arquivo_url, c.thumbnail_url, c.descricao,
  c.data_captura, o.nome as oficina_nome, p.nome as professor_nome
from conteudos c
left join oficinas o on o.id = c.oficina_id
left join professores p on p.id = c.professor_id
where c.status = 'publicado'
order by c.data_captura desc;

grant select on vw_feed_publico to anon, authenticated;

-- ---------- SEED opcional das oficinas citadas na proposta ----------
insert into oficinas (nome, descricao, cor) values
  ('Circo', 'Oficina de artes circenses', '#f97316'),
  ('Esportes', 'Atividades esportivas diversas', '#22c55e'),
  ('Artes', 'Oficina de artes visuais', '#eab308'),
  ('Música', 'Oficina de música e instrumentos', '#8b5cf6'),
  ('Psicossocial', 'Acompanhamento psicossocial', '#06b6d4')
on conflict do nothing;
