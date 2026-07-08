<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileImage, ClipboardList, CalendarClock, AlertTriangle } from "@lucide/vue";

interface ProximoItem {
  id: string;
  titulo: string;
  data_publicacao: string;
  status: string;
  plataforma: string;
  oficinas: { nome: string; cor: string } | null;
}

const loading = ref(true);
const resumo = ref({
  publicacoes_mes: 0,
  pendentes_revisao: 0,
  proximos_eventos: 0,
  publicacoes_atrasadas: 0,
});
const proximosItens = ref<ProximoItem[]>([]);

onMounted(async () => {
  const { data } = await supabase.from("vw_resumo_mensal").select("*").single();
  if (data) {
    resumo.value.publicacoes_mes = data.publicacoes_mes ?? 0;
    resumo.value.pendentes_revisao = data.pendentes_revisao ?? 0;
    resumo.value.proximos_eventos = data.proximos_eventos ?? 0;
    resumo.value.publicacoes_atrasadas = data.publicacoes_atrasadas ?? 0;
  }

  const { data: itens } = await supabase
    .from("calendario_editorial")
    .select("id, titulo, data_publicacao, status, plataforma, oficinas(nome, cor)")
    .order("data_publicacao", { ascending: true })
    .limit(6);
  proximosItens.value = (itens ?? []) as unknown as ProximoItem[];
  loading.value = false;
});

const cards = [
  { key: "publicacoes_mes", label: "Publicações este mês", icon: FileImage, tone: "text-primary" },
  { key: "pendentes_revisao", label: "Pendentes de revisão", icon: ClipboardList, tone: "text-secondary" },
  { key: "proximos_eventos", label: "Próximos eventos", icon: CalendarClock, tone: "text-emerald-500" },
  { key: "publicacoes_atrasadas", label: "Publicações atrasadas", icon: AlertTriangle, tone: "text-destructive" },
] as const;
</script>

<template>
  <div class="grid gap-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="c in cards" :key="c.key">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">{{ c.label }}</CardTitle>
          <component :is="c.icon" class="size-4" :class="c.tone" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="loading" class="h-8 w-16" />
          <div v-else class="text-2xl font-bold">{{ resumo[c.key] }}</div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Próximas publicações</CardTitle>
        <CardDescription>Itens agendados no calendário editorial</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3">
        <div v-if="loading" class="grid gap-2">
          <Skeleton v-for="i in 4" :key="i" class="h-12 w-full" />
        </div>
        <div v-else-if="proximosItens.length === 0" class="text-sm text-muted-foreground">
          Nenhuma publicação agendada.
        </div>
        <div
          v-for="item in proximosItens"
          :key="item.id"
          class="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: item.oficinas?.cor ?? '#a1a1aa' }"
            />
            <div>
              <p class="text-sm font-medium">{{ item.titulo }}</p>
              <p class="text-xs text-muted-foreground">
                {{ item.oficinas?.nome ?? "Geral" }} · {{ item.plataforma }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="outline">{{ item.data_publicacao }}</Badge>
            <Badge>{{ item.status }}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
