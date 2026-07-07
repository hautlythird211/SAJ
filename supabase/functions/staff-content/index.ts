// supabase/functions/staff-content/index.ts
// Nível: staff, reviewer, admin
// CRUD de conteúdos (fotos, vídeos, textos, depoimentos)
import { corsHeaders } from "../_shared/cors.ts";
import { getClients, requireRole } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const profile = await requireRole(req, ["staff", "reviewer", "admin"]);
    const { adminClient } = getClients(req);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    switch (req.method) {
      case "GET": {
        let query = adminClient
          .from("conteudos")
          .select(
            "*, oficinas(nome, cor), professores(nome, foto_url), profiles!conteudos_autor_id_fkey(full_name)",
          )
          .order("created_at", { ascending: false });

        const oficinaId = url.searchParams.get("oficina_id");
        const professorId = url.searchParams.get("professor_id");
        const status = url.searchParams.get("status");
        if (oficinaId) query = query.eq("oficina_id", oficinaId);
        if (professorId) query = query.eq("professor_id", professorId);
        if (status) query = query.eq("status", status);

        const { data, error } = await query;
        if (error) throw error;
        return json({ data });
      }

      case "POST": {
        const body = await req.json();
        const { data, error } = await adminClient
          .from("conteudos")
          .insert({ ...body, autor_id: profile.id, status: body.status ?? "rascunho" })
          .select()
          .single();
        if (error) throw error;
        return json({ data }, 201);
      }

      case "PATCH": {
        if (!id) return json({ error: "id é obrigatório" }, 400);
        const body = await req.json();
        const { data, error } = await adminClient
          .from("conteudos")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return json({ data });
      }

      case "DELETE": {
        if (!id) return json({ error: "id é obrigatório" }, 400);
        if (profile.role !== "admin") {
          return json({ error: "Somente admin pode excluir conteúdo" }, 403);
        }
        const { error } = await adminClient.from("conteudos").delete().eq("id", id);
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
