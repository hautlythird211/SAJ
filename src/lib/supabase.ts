import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

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
      Authorization: `Bearer ${session?.access_token ?? supabasePublishableKey}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Erro ${res.status}`);
  return json as T;
}
