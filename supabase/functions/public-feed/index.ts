// supabase/functions/public-feed/index.ts
// Nível: público (sem autenticação) — usado pelo site institucional
// Retorna somente conteúdo com status = 'publicado', paginado
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Use GET" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!, // anon key: RLS restringe a status = 'publicado'
  );

  const url = new URL(req.url);
  const oficina = url.searchParams.get("oficina");
  const tipo = url.searchParams.get("tipo");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  let query = supabase
    .from("vw_feed_publico")
    .select("*")
    .order("data_captura", { ascending: false })
    .range(offset, offset + limit - 1);

  if (oficina) query = query.eq("oficina_nome", oficina);
  if (tipo) query = query.eq("tipo", tipo);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);

  return json({ data, limit, offset });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}
