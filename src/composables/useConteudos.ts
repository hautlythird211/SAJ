import { ref } from "vue";
import { callFunction } from "@/lib/supabase";
import type { Conteudo } from "@/lib/types";

export function useConteudos() {
  const conteudos = ref<Conteudo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchConteudos(filters: { oficina_id?: string; professor_id?: string; status?: string } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await callFunction<{ data: Conteudo[] }>("staff-content", { params: filters });
      conteudos.value = res.data;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function createConteudo(payload: Partial<Conteudo>) {
    await callFunction("staff-content", { method: "POST", body: payload });
    await fetchConteudos();
  }

  async function updateConteudo(id: string, payload: Partial<Conteudo>) {
    await callFunction("staff-content", { method: "PATCH", params: { id }, body: payload });
    await fetchConteudos();
  }

  async function deleteConteudo(id: string) {
    await callFunction("staff-content", { method: "DELETE", params: { id } });
    await fetchConteudos();
  }

  async function reviewConteudo(id: string, decisao: "aprovado" | "rejeitado" | "publicado", comentario?: string) {
    await callFunction("reviewer-review", {
      method: "POST",
      body: { alvo: "conteudo", id, decisao, comentario },
    });
    await fetchConteudos();
  }

  return { conteudos, loading, error, fetchConteudos, createConteudo, updateConteudo, deleteConteudo, reviewConteudo };
}
