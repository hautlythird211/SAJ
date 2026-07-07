// supabase/functions/public-calendar/index.ts
// Nível: público (sem autenticação)
// Retorna próximos eventos confirmados/realizados (usado no site institucional)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Use GET" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const { data, error } = await supabase
    .from("eventos")
    .select("id, titulo, descricao, data_evento, local, oficinas(nome, cor), status")
    .in("status", ["confirmado", "realizado"])
    .order("data_evento", { ascending: true })
    .limit(20);

  if (error) return json({ error: error.message }, 500);
  return json({ data });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
  });
}
