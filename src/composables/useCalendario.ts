import { ref } from "vue";
import { callFunction } from "@/lib/supabase";
import type { CalendarioItem, Evento } from "@/lib/types";

export function useCalendario() {
  const itens = ref<CalendarioItem[]>([]);
  const loading = ref(false);

  async function fetchCalendario(from?: string, to?: string) {
    loading.value = true;
    const res = await callFunction<{ data: CalendarioItem[] }>("staff-calendar", {
      params: { resource: "calendario", from, to } as Record<string, string>,
    });
    itens.value = res.data;
    loading.value = false;
  }

  async function createItem(payload: Partial<CalendarioItem>) {
    await callFunction("staff-calendar", { method: "POST", params: { resource: "calendario" }, body: payload });
    await fetchCalendario();
  }

  async function updateItem(id: string, payload: Partial<CalendarioItem>) {
    await callFunction("staff-calendar", {
      method: "PATCH",
      params: { resource: "calendario", id },
      body: payload,
    });
    await fetchCalendario();
  }

  async function deleteItem(id: string) {
    await callFunction("staff-calendar", { method: "DELETE", params: { resource: "calendario", id } });
    await fetchCalendario();
  }

  async function publicarItem(id: string) {
    await callFunction("reviewer-review", {
      method: "POST",
      body: { alvo: "calendario", id, decisao: "publicado" },
    });
    await fetchCalendario();
  }

  return { itens, loading, fetchCalendario, createItem, updateItem, deleteItem, publicarItem };
}

export function useEventos() {
  const eventos = ref<Evento[]>([]);
  const loading = ref(false);

  async function fetchEventos() {
    loading.value = true;
    const res = await callFunction<{ data: Evento[] }>("staff-calendar", { params: { resource: "eventos" } });
    eventos.value = res.data;
    loading.value = false;
  }

  async function createEvento(payload: Partial<Evento>) {
    await callFunction("staff-calendar", { method: "POST", params: { resource: "eventos" }, body: payload });
    await fetchEventos();
  }

  async function updateEvento(id: string, payload: Partial<Evento>) {
    await callFunction("staff-calendar", { method: "PATCH", params: { resource: "eventos", id }, body: payload });
    await fetchEventos();
  }

  return { eventos, loading, fetchEventos, createEvento, updateEvento };
}
