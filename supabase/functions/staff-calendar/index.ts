// supabase/functions/staff-calendar/index.ts
// Nível: staff, reviewer, admin
// CRUD do calendário editorial e eventos (query ?resource=calendario|eventos)
import { corsHeaders } from "../_shared/cors.ts";
import { getClients, requireRole } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const profile = await requireRole(req, ["staff", "reviewer", "admin"]);
    const { adminClient } = getClients(req);
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") ?? "calendario";
    const table = resource === "eventos" ? "eventos" : "calendario_editorial";
    const id = url.searchParams.get("id");

    switch (req.method) {
      case "GET": {
        let query = adminClient
          .from(table)
          .select("*, oficinas(nome, cor)")
          .order(table === "eventos" ? "data_evento" : "data_publicacao", { ascending: true });

        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        const dateCol = table === "eventos" ? "data_evento" : "data_publicacao";
        if (from) query = query.gte(dateCol, from);
        if (to) query = query.lte(dateCol, to);

        const { data, error } = await query;
        if (error) throw error;
        return json({ data });
      }

      case "POST": {
        const body = await req.json();
        const payload =
          table === "calendario_editorial"
            ? { ...body, responsavel_id: body.responsavel_id ?? profile.id }
            : body;
        const { data, error } = await adminClient.from(table).insert(payload).select().single();
        if (error) throw error;
        return json({ data }, 201);
      }

      case "PATCH": {
        if (!id) return json({ error: "id é obrigatório" }, 400);
        const body = await req.json();
        const { data, error } = await adminClient.from(table).update(body).eq("id", id).select().single();
        if (error) throw error;
        return json({ data });
      }

      case "DELETE": {
        if (!id) return json({ error: "id é obrigatório" }, 400);
        if (profile.role !== "admin") return json({ error: "Somente admin pode excluir" }, 403);
        const { error } = await adminClient.from(table).delete().eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: "Método não suportado" }, 405);
    }
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
