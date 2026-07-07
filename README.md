# SAJ — Painel de Conteúdo & Calendário Editorial

Dashboard construído a partir da proposta de prestação de serviços (Tupã Levi / SAJ), cobrindo:
captação, edição, publicação, calendário editorial, organização de conteúdo por **oficina/professor**,
cobertura de eventos mensais e níveis de acesso **staff / revisor / admin / público**.

Stack: **Vue 3 + Vite + TypeScript + Tailwind + shadcn-vue** (única biblioteca de UI) + **Supabase**
(Postgres, Auth, RLS, Edge Functions).

## 1. Estrutura

```
saj-dashboard/
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init_schema.sql      # tabelas, enums, triggers
│   │   ├── 0002_rls_policies.sql     # RLS: admin/staff/reviewer/público
│   │   └── 0003_views_and_seed.sql   # views agregadas + seed das oficinas
│   └── functions/
│       ├── staff-content/            # CRUD de conteúdos (staff+)
│       ├── staff-calendar/           # CRUD calendário + eventos (staff+)
│       ├── reviewer-review/          # aprovar/rejeitar/publicar (reviewer+)
│       ├── public-feed/              # feed público de conteúdo publicado
│       └── public-calendar/          # próximos eventos confirmados (público)
└── src/
    ├── views/                        # Painel, Calendário, Conteúdos, Oficinas, Eventos, Revisão, Equipe
    ├── components/layout/AppShell.vue
    ├── composables/                  # useAuth, useOficinas, useConteudos, useCalendario
    └── lib/                          # supabase client, tipos, utils
```

## 2. Modelo de dados (resumo)

- **profiles** — papel do usuário: `admin` `staff` `reviewer` `viewer`
- **oficinas** / **professores** — base para organizar todo o conteúdo
- **conteudos** — fotos/vídeos/textos/depoimentos, com `status`:
  `rascunho → em_revisao → aprovado/rejeitado → publicado`
- **calendario_editorial** — posts/reels/stories agendados, vinculados a uma oficina e conteúdo
- **eventos** — cobertura mensal (1 evento/mês conforme a proposta)
- **revisoes** — histórico de decisões de revisão

## 3. Níveis de acesso (RLS + Edge Functions)

| Nível     | Lê                              | Escreve                                   |
|-----------|----------------------------------|--------------------------------------------|
| Público (anon) | Somente `status = publicado` / eventos confirmados | — |
| Staff     | Tudo                              | Cria/edita conteúdo e calendário (não publica) |
| Reviewer  | Tudo                              | Aprova, rejeita, publica                   |
| Admin     | Tudo                              | Tudo, inclusive excluir e gerenciar equipe |

As policies estão em `0002_rls_policies.sql`; as Edge Functions replicam essas regras no lado da API
(`requireRole` em `_shared/auth.ts`) para os fluxos que passam por lógica de negócio (ex.: registrar
em `revisoes` ao aprovar).

## 4. Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Supabase
cp .env.example .env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Aplicar as migrations no seu projeto Supabase
supabase link --project-ref SEU_PROJECT_REF
supabase db push

# 4. Deploy das Edge Functions
supabase functions deploy staff-content
supabase functions deploy staff-calendar
supabase functions deploy reviewer-review
supabase functions deploy public-feed --no-verify-jwt
supabase functions deploy public-calendar --no-verify-jwt

# 5. Instalar os componentes shadcn-vue usados neste projeto
npx shadcn-vue@latest init
npx shadcn-vue@latest add button card input label textarea select dialog \
  table tabs badge avatar dropdown-menu separator skeleton alert sidebar

# 6. Rodar em desenvolvimento
npm run dev
```

> O `components.json` já está configurado (estilo `new-york`, cor base `zinc`, alias `@/components/ui`),
> então o CLI do shadcn-vue vai gerar os componentes direto na estrutura esperada pelas views.

## 5. Endpoints públicos (para o site institucional)

- `GET /functions/v1/public-feed?oficina=Circo&tipo=foto&limit=12` — feed de conteúdo publicado
- `GET /functions/v1/public-calendar` — próximos eventos confirmados/realizados

Nenhum dos dois exige autenticação; a RLS garante que apenas `status = 'publicado'` seja retornado.

## 6. Primeiro usuário admin

Depois de criar a conta pelo Supabase Auth (ou tela de login), promova manualmente para admin:

```sql
update profiles set role = 'admin' where id = 'UUID_DO_USUARIO';
```
