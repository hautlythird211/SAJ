import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type Role = "admin" | "staff" | "reviewer" | "viewer";

/**
 * Cria um client Supabase autenticado como o usuário que fez a chamada
 * (usa o token JWT recebido no header Authorization), e também retorna
 * um client "admin" com a service_role key para operações privilegiadas.
 */
export function getClients(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const adminClient: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  return { userClient, adminClient };
}

/**
 * Retorna o perfil (com role) do usuário autenticado, ou null se não autenticado.
 */
export async function getCallerProfile(req: Request) {
  const { userClient, adminClient } = getClients(req);
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, role, full_name, ativo")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

/** Garante que o usuário tem um dos papéis exigidos. Lança Response 401/403 se não. */
export async function requireRole(req: Request, allowed: Role[]) {
  const profile = await getCallerProfile(req);
  if (!profile) {
    throw new Response(JSON.stringify({ error: "Não autenticado" }), {
      status: 401,
    });
  }
  if (!profile.ativo || !allowed.includes(profile.role)) {
    throw new Response(JSON.stringify({ error: "Acesso negado para este papel" }), {
      status: 403,
    });
  }
  return profile;
}
