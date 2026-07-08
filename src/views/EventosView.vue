<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useEventos } from "@/composables/useCalendario";
import { useOficinas } from "@/composables/useOficinas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin, CalendarDays } from "@lucide/vue";
import type { Evento } from "@/lib/types";

const { eventos, fetchEventos, createEvento, updateEvento } = useEventos();
const { oficinas, fetchOficinas } = useOficinas();

const dialogOpen = ref(false);
const form = ref<Partial<Evento>>({ titulo: "", status: "agendado", data_evento: new Date().toISOString().slice(0, 10) });

const formLocal = computed({
  get: () => form.value.local ?? undefined,
  set: (v) => { form.value.local = v ?? null; },
});
const formDescricao = computed({
  get: () => form.value.descricao ?? undefined,
  set: (v) => { form.value.descricao = v ?? null; },
});

const statusTone: Record<string, import("@/lib/types").BadgeVariant> = {
  agendado: "outline", confirmado: "secondary", realizado: "default", cancelado: "destructive",
};

async function save() {
  await createEvento(form.value);
  dialogOpen.value = false;
  form.value = { titulo: "", status: "agendado", data_evento: new Date().toISOString().slice(0, 10) };
}

async function marcarRealizado(e: Evento) {
  await updateEvento(e.id, { status: "realizado" });
}

onMounted(async () => {
  await Promise.all([fetchOficinas(), fetchEventos()]);
});
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">Cobertura de Eventos</h2>
        <p class="text-sm text-muted-foreground">1 evento institucional por mês, conforme proposta.</p>
      </div>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child><Button><Plus class="mr-1 size-4" />Novo evento</Button></DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo evento</DialogTitle></DialogHeader>
          <div class="grid gap-3 py-2">
            <div class="grid gap-1.5"><Label>Título</Label><Input v-model="form.titulo" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-1.5"><Label>Data</Label><Input v-model="form.data_evento" type="date" /></div>
              <div class="grid gap-1.5"><Label>Local</Label><Input v-model="formLocal" /></div>
            </div>
            <div class="grid gap-1.5">
              <Label>Oficina relacionada</Label>
              <Select v-model="form.oficina_id">
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="o in oficinas" :key="o.id" :value="o.id">{{ o.nome }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-1.5"><Label>Descrição</Label><Textarea v-model="formDescricao" rows="3" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">Cancelar</Button>
            <Button @click="save">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="e in eventos" :key="e.id">
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-sm">{{ e.titulo }}</CardTitle>
            <Badge :variant="statusTone[e.status] ?? 'default'">{{ e.status }}</Badge>
          </div>
          <CardDescription class="flex items-center gap-1 text-xs">
            <CalendarDays class="size-3" /> {{ e.data_evento }}
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-2">
          <p v-if="e.local" class="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin class="size-3" /> {{ e.local }}
          </p>
          <p class="text-xs text-muted-foreground">{{ e.descricao ?? "Sem descrição." }}</p>
          <Button
            v-if="e.status === 'confirmado'"
            size="sm" variant="outline" @click="marcarRealizado(e)"
          >
            Marcar como realizado
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
