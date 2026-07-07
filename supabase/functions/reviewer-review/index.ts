// supabase/functions/reviewer-review/index.ts
// Nível: reviewer, admin
// Aprova, rejeita ou publica um conteúdo/entrada de calendário, e registra em `revisoes`
import { corsHeaders } from "../_shared/cors.ts";
import { getClients, requireRole } from "../_shared/auth.ts";

type ReviewBody = {
  alvo: "conteudo" | "calendario";
  id: string;
  decisao: "aprovado" | "rejeitado" | "publicado";
  comentario?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const profile = await requireRole(req, ["reviewer", "admin"]);
    const { adminClient } = getClients(req);
    const body = (await req.json()) as ReviewBody;

    if (!body.id || !body.alvo || !body.decisao) {
      return json({ error: "alvo, id e decisao são obrigatórios" }, 400);
    }

    if (body.alvo === "conteudo") {
      const statusMap = { aprovado: "aprovado", rejeitado: "rejeitado", publicado: "publicado" } as const;
      const { data, error } = await adminClient
        .from("conteudos")
        .update({ status: statusMap[body.decisao] })
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;

      await adminClient.from("revisoes").insert({
        conteudo_id: body.id,
        revisor_id: profile.id,
        status: statusMap[body.decisao],
        comentario: body.comentario ?? null,
      });

      return json({ data });
    }

    if (body.alvo === "calendario") {
      const statusMap = {
        aprovado: "pronto",
        rejeitado: "planejado",
        publicado: "publicado",
      } as const;
      const { data, error } = await adminClient
        .from("calendario_editorial")
        .update({ status: statusMap[body.decisao] })
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;

      await adminClient.from("revisoes").insert({
        calendario_id: body.id,
        revisor_id: profile.id,
        status: body.decisao === "rejeitado" ? "rejeitado" : "aprovado",
        comentario: body.comentario ?? null,
      });

      return json({ data });
    }

    return json({ error: "alvo inválido" }, 400);
  } catch (e) {
    if (e instanceof Response) return withHeaders(e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function withHeaders(res: Response) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
