import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Oficina, Professor } from "@/lib/types";

export function useOficinas() {
  const oficinas = ref<Oficina[]>([]);
  const professores = ref<Professor[]>([]);
  const loading = ref(false);

  async function fetchOficinas() {
    loading.value = true;
    const { data, error } = await supabase.from("oficinas").select("*").order("nome");
    if (!error) oficinas.value = (data ?? []) as Oficina[];
    loading.value = false;
  }

  async function fetchProfessores() {
    const { data, error } = await supabase.from("professores").select("*").order("nome");
    if (!error) professores.value = (data ?? []) as Professor[];
  }

  async function saveProfessor(payload: Partial<Professor>) {
    if (payload.id) {
      const { error } = await supabase.from("professores").update(payload).eq("id", payload.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("professores").insert(payload);
      if (error) throw error;
    }
    await fetchProfessores();
  }

  async function saveOficina(payload: Partial<Oficina>) {
    if (payload.id) {
      const { error } = await supabase.from("oficinas").update(payload).eq("id", payload.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("oficinas").insert(payload);
      if (error) throw error;
    }
    await fetchOficinas();
  }

  return { oficinas, professores, loading, fetchOficinas, fetchProfessores, saveProfessor, saveOficina };
}
