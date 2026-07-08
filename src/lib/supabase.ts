import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL não configurada no .env");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY não configurada no .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para chamar as Edge Functions com o JWT do usuário logado
export async function callFunction<T = unknown>(
  name: string,
  opts: { method?: string; params?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(`${supabaseUrl}/functions/v1/${name}`);
  if (opts.params) {
    Object.entries(opts.params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? supabaseAnonKey}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Erro ${res.status}`);
  return json as T;
}
