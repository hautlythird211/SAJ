<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCalendario } from "@/composables/useCalendario";
import { useOficinas } from "@/composables/useOficinas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronLeft, ChevronRight } from "@lucide/vue";
import type { CalendarioItem } from "@/lib/types";

const { itens, loading, fetchCalendario, createItem, updateItem, deleteItem } = useCalendario();
const { oficinas, fetchOficinas } = useOficinas();

const refDate = ref(new Date());
const editing = ref<Partial<CalendarioItem> | null>(null);
const dialogOpen = ref(false);

const form = ref<Partial<CalendarioItem>>({
  titulo: "", tipo: "post", plataforma: "instagram", status: "planejado",
  data_publicacao: new Date().toISOString().slice(0, 10),
});

const formLegenda = computed({
  get: () => form.value.legenda ?? undefined,
  set: (v) => { form.value.legenda = v ?? null; },
});

const monthLabel = computed(() =>
  refDate.value.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
);

const monthDays = computed(() => {
  const year = refDate.value.getFullYear();
  const month = refDate.value.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
});

function itemsForDay(date: Date) {
  const iso = date.toISOString().slice(0, 10);
  return itens.value.filter((i) => i.data_publicacao === iso);
}

function changeMonth(delta: number) {
  refDate.value = new Date(refDate.value.getFullYear(), refDate.value.getMonth() + delta, 1);
  reload();
}

async function reload() {
  const year = refDate.value.getFullYear();
  const month = refDate.value.getMonth();
  const from = new Date(year, month, 1).toISOString().slice(0, 10);
  const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  await fetchCalendario(from, to);
}

function openCreate(date?: Date) {
  editing.value = null;
  form.value = {
    titulo: "", tipo: "post", plataforma: "instagram", status: "planejado",
    data_publicacao: (date ?? new Date()).toISOString().slice(0, 10),
  };
  dialogOpen.value = true;
}

function openEdit(item: CalendarioItem) {
  editing.value = item;
  form.value = { ...item };
  dialogOpen.value = true;
}

const saving = ref(false);

async function save() {
  saving.value = true;
  try {
    if (editing.value?.id) {
      await updateItem(editing.value.id, form.value);
    } else {
      await createItem(form.value);
    }
    dialogOpen.value = false;
    reload();
  } finally {
    saving.value = false;
  }
}

async function remove(id: string) {
  if (!confirm("Excluir este item?")) return;
  saving.value = true;
  try {
    await deleteItem(id);
    dialogOpen.value = false;
    reload();
  } finally {
    saving.value = false;
  }
}

const statusTone: Record<string, import("@/lib/types").BadgeVariant> = {
  planejado: "secondary", em_producao: "outline", pronto: "default",
  publicado: "default", atrasado: "destructive", cancelado: "outline",
};

onMounted(async () => {
  await fetchOficinas();
  await reload();
});
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <Button variant="outline" size="icon" @click="changeMonth(-1)"><ChevronLeft class="size-4" /></Button>
        <h2 class="min-w-40 text-center text-lg font-semibold capitalize">{{ monthLabel }}</h2>
        <Button variant="outline" size="icon" @click="changeMonth(1)"><ChevronRight class="size-4" /></Button>
      </div>

      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button @click="openCreate()"><Plus class="mr-1 size-4" /> Nova publicação</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ editing ? "Editar publicação" : "Nova publicação" }}</DialogTitle>
            <DialogDescription>Agende um item do calendário editorial.</DialogDescription>
          </DialogHeader>
          <div class="grid gap-3 py-2">
            <div class="grid gap-1.5">
              <Label>Título</Label>
              <Input v-model="form.titulo" placeholder="Ex: Reels oficina de circo" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-1.5">
                <Label>Tipo</Label>
                <Select v-model="form.tipo">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-1.5">
                <Label>Plataforma</Label>
                <Select v-model="form.plataforma">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-1.5">
                <Label>Data</Label>
                <Input v-model="form.data_publicacao" type="date" />
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
              <Label>Legenda / notas</Label>
              <Textarea v-model="formLegenda" rows="3" placeholder="Rascunho da legenda..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">Cancelar</Button>
            <Button variant="destructive" v-if="editing?.id" :disabled="saving" @click="remove(editing.id)">Excluir</Button>
            <Button :disabled="saving" @click="save">{{ saving ? "Salvando..." : "Salvar" }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <Tabs default-value="grid">
      <TabsList>
        <TabsTrigger value="grid">Calendário</TabsTrigger>
        <TabsTrigger value="lista">Lista</TabsTrigger>
      </TabsList>

      <TabsContent value="grid">
        <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          <span v-for="d in ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']" :key="d">{{ d }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, idx) in monthDays"
            :key="idx"
            class="min-h-24 rounded-md border p-1 text-xs sm:min-h-28"
            :class="day ? 'bg-card hover:bg-accent/40 cursor-pointer' : 'bg-transparent border-transparent'"
            @click="day && openCreate(day)"
          >
            <template v-if="day">
              <div class="mb-1 font-medium">{{ day.getDate() }}</div>
              <div class="grid gap-1">
                <div
                  v-for="item in itemsForDay(day).slice(0, 3)"
                  :key="item.id"
                  class="truncate rounded px-1 py-0.5 text-[10px] text-white"
                  :style="{ backgroundColor: item.oficinas?.cor ?? '#6366f1' }"
                  @click.stop="openEdit(item)"
                >
                  {{ item.titulo }}
                </div>
                <span v-if="itemsForDay(day).length > 3" class="text-[10px] text-muted-foreground">
                  +{{ itemsForDay(day).length - 3 }} mais
                </span>
              </div>
            </template>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="lista">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Título</TableHead>
              <TableHead class="hidden sm:table-cell">Oficina</TableHead>
              <TableHead class="hidden sm:table-cell">Plataforma</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in itens"
              :key="item.id"
              class="cursor-pointer"
              @click="openEdit(item)"
            >
              <TableCell>{{ item.data_publicacao }}</TableCell>
              <TableCell class="font-medium">{{ item.titulo }}</TableCell>
              <TableCell class="hidden sm:table-cell">{{ item.oficinas?.nome ?? "—" }}</TableCell>
              <TableCell class="hidden sm:table-cell capitalize">{{ item.plataforma }}</TableCell>
              <TableCell>
                <Badge :variant="statusTone[item.status] ?? 'default'">{{ item.status }}</Badge>
              </TableCell>
            </TableRow>
            <TableRow v-if="!loading && itens.length === 0">
              <TableCell colspan="5" class="text-center text-muted-foreground">Nenhum item neste mês.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  </div>
</template>
