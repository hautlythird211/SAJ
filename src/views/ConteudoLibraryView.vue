<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useConteudos } from "@/composables/useConteudos";
import { useOficinas } from "@/composables/useOficinas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ImageIcon, Video, FileText, Quote } from "@lucide/vue";
import type { Conteudo, BadgeVariant } from "@/lib/types";

const { conteudos, loading, fetchConteudos, createConteudo } = useConteudos();
const { oficinas, professores, fetchOficinas, fetchProfessores } = useOficinas();

const filtroOficina = ref<string>("todas");
const agruparPor = ref<"oficina" | "professor">("oficina");
const dialogOpen = ref(false);

const form = ref<Partial<Conteudo>>({ titulo: "", tipo: "foto", status: "rascunho" });

const formArquivoUrl = computed({
  get: () => form.value.arquivo_url ?? undefined,
  set: (v) => { form.value.arquivo_url = v ?? null; },
});
const formDescricao = computed({
  get: () => form.value.descricao ?? undefined,
  set: (v) => { form.value.descricao = v ?? null; },
});

const tipoIcon: Record<string, any> = { foto: ImageIcon, video: Video, texto: FileText, depoimento: Quote, bastidor: ImageIcon };
const statusTone: Record<string, BadgeVariant> = {
  rascunho: "outline", em_revisao: "secondary", aprovado: "default", publicado: "default", rejeitado: "destructive",
};

const filtrados = computed(() =>
  filtroOficina.value === "todas"
    ? conteudos.value
    : conteudos.value.filter((c) => c.oficina_id === filtroOficina.value),
);

const agrupados = computed(() => {
  const groups: Record<string, Conteudo[]> = {};
  for (const c of filtrados.value) {
    const key =
      agruparPor.value === "oficina"
        ? c.oficinas?.nome ?? "Sem oficina"
        : c.professores?.nome ?? "Sem professor";
    (groups[key] ??= []).push(c);
  }
  return groups;
});

async function save() {
  await createConteudo(form.value);
  dialogOpen.value = false;
  form.value = { titulo: "", tipo: "foto", status: "rascunho" };
}

onMounted(async () => {
  await Promise.all([fetchOficinas(), fetchProfessores(), fetchConteudos()]);
});
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="filtroOficina">
          <SelectTrigger class="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as oficinas</SelectItem>
            <SelectItem v-for="o in oficinas" :key="o.id" :value="o.id">{{ o.nome }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="agruparPor">
          <SelectTrigger class="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="oficina">Agrupar por oficina</SelectItem>
            <SelectItem value="professor">Agrupar por professor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button><Plus class="mr-1 size-4" /> Novo conteúdo</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo conteúdo</DialogTitle></DialogHeader>
          <div class="grid gap-3 py-2">
            <div class="grid gap-1.5">
              <Label>Título</Label>
              <Input v-model="form.titulo" placeholder="Ex: Ensaio do espetáculo de circo" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-1.5">
                <Label>Tipo</Label>
                <Select v-model="form.tipo">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="depoimento">Depoimento</SelectItem>
                    <SelectItem value="bastidor">Bastidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-1.5">
                <Label>Oficina</Label>
                <Select v-model="form.oficina_id">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="o in oficinas" :key="o.id" :value="o.id">{{ o.nome }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="grid gap-1.5">
              <Label>Professor</Label>
              <Select v-model="form.professor_id">
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in professores" :key="p.id" :value="p.id">{{ p.nome }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-1.5">
              <Label>URL do arquivo</Label>
              <Input v-model="formArquivoUrl" placeholder="https://..." />
            </div>
            <div class="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea v-model="formDescricao" rows="3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">Cancelar</Button>
            <Button @click="save">Salvar rascunho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card v-for="i in 4" :key="i">
        <CardHeader class="pb-2">
          <Skeleton class="h-4 w-full" />
        </CardHeader>
        <CardContent class="grid gap-2">
          <Skeleton class="aspect-video w-full rounded-md" />
          <div class="flex items-center justify-between">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    </div>

    <template v-else>
      <div v-for="(items, group) in agrupados" :key="group" class="grid gap-2">
        <h3 class="text-sm font-semibold text-muted-foreground">{{ group }} · {{ items.length }}</h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card v-for="c in items" :key="c.id">
            <CardHeader class="pb-2">
              <div class="flex items-start justify-between gap-2">
                <CardTitle class="text-sm leading-snug">{{ c.titulo }}</CardTitle>
                <component :is="tipoIcon[c.tipo]" class="size-4 shrink-0 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent class="grid gap-2">
              <img
                v-if="c.thumbnail_url || c.arquivo_url"
                :src="c.thumbnail_url ?? c.arquivo_url ?? ''"
                class="aspect-video w-full rounded-md object-cover bg-muted"
              />
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <Avatar class="size-5">
                    <AvatarImage :src="c.professores?.foto_url ?? ''" />
                    <AvatarFallback class="text-[10px]">{{ c.professores?.nome?.[0] ?? "?" }}</AvatarFallback>
                  </Avatar>
                  <span class="text-xs text-muted-foreground">{{ c.professores?.nome ?? "—" }}</span>
                </div>
                <Badge :variant="statusTone[c.status] ?? 'default'" class="text-[10px]">{{ c.status }}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p v-if="conteudos.length === 0" class="text-sm text-muted-foreground">
        Nenhum conteúdo cadastrado ainda.
      </p>
    </template>
  </div>
</template>
