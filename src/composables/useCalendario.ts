import { ref } from "vue";
import { callFunction } from "@/lib/supabase";
import type { CalendarioItem, Evento } from "@/lib/types";

export function useCalendario() {
  const itens = ref<CalendarioItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCalendario(from?: string, to?: string) {
    loading.value = true;
    error.value = null;
    try {
      const params: Record<string, string> = { resource: "calendario" };
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await callFunction<{ data: CalendarioItem[] }>("staff-calendar", { params });
      itens.value = res.data;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function createItem(payload: Partial<CalendarioItem>) {
    error.value = null;
    try {
      await callFunction("staff-calendar", { method: "POST", params: { resource: "calendario" }, body: payload });
      await fetchCalendario();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  async function updateItem(id: string, payload: Partial<CalendarioItem>) {
    error.value = null;
    try {
      await callFunction("staff-calendar", {
        method: "PATCH",
        params: { resource: "calendario", id },
        body: payload,
      });
      await fetchCalendario();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  async function deleteItem(id: string) {
    error.value = null;
    try {
      await callFunction("staff-calendar", { method: "DELETE", params: { resource: "calendario", id } });
      await fetchCalendario();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  async function publicarItem(id: string) {
    error.value = null;
    try {
      await callFunction("reviewer-review", {
        method: "POST",
        body: { alvo: "calendario", id, decisao: "publicado" },
      });
      await fetchCalendario();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  return { itens, loading, error, fetchCalendario, createItem, updateItem, deleteItem, publicarItem };
}

export function useEventos() {
  const eventos = ref<Evento[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEventos() {
    loading.value = true;
    error.value = null;
    try {
      const res = await callFunction<{ data: Evento[] }>("staff-calendar", { params: { resource: "eventos" } });
      eventos.value = res.data;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function createEvento(payload: Partial<Evento>) {
    error.value = null;
    try {
      await callFunction("staff-calendar", { method: "POST", params: { resource: "eventos" }, body: payload });
      await fetchEventos();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  async function updateEvento(id: string, payload: Partial<Evento>) {
    error.value = null;
    try {
      await callFunction("staff-calendar", { method: "PATCH", params: { resource: "eventos", id }, body: payload });
      await fetchEventos();
    } catch (e) {
      error.value = (e as Error).message;
    }
  }

  return { eventos, loading, error, fetchEventos, createEvento, updateEvento };
}
