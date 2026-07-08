import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Oficina, Professor } from "@/lib/types";

export function useOficinas() {
  const oficinas = ref<Oficina[]>([]);
  const professores = ref<Professor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOficinas() {
    loading.value = true;
    error.value = null;
    const { data, error: err } = await supabase.from("oficinas").select("*").order("nome");
    if (err) {
      error.value = err.message;
    } else {
      oficinas.value = (data ?? []) as Oficina[];
    }
    loading.value = false;
  }

  async function fetchProfessores() {
    error.value = null;
    const { data, error: err } = await supabase.from("professores").select("*").order("nome");
    if (err) {
      error.value = err.message;
    } else {
      professores.value = (data ?? []) as Professor[];
    }
  }

  async function saveProfessor(payload: Partial<Professor>) {
    error.value = null;
    try {
      if (payload.id) {
        const { error: err } = await supabase.from("professores").update(payload).eq("id", payload.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("professores").insert(payload);
        if (err) throw err;
      }
      await fetchProfessores();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  async function saveOficina(payload: Partial<Oficina>) {
    error.value = null;
    try {
      if (payload.id) {
        const { error: err } = await supabase.from("oficinas").update(payload).eq("id", payload.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("oficinas").insert(payload);
        if (err) throw err;
      }
      await fetchOficinas();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  return { oficinas, professores, loading, error, fetchOficinas, fetchProfessores, saveProfessor, saveOficina };
}
