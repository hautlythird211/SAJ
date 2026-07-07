<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useOficinas } from "@/composables/useOficinas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "@lucide/vue";
import type { Oficina, Professor } from "@/lib/types";

const { oficinas, professores, fetchOficinas, fetchProfessores, saveOficina, saveProfessor } = useOficinas();

const oficinaDialog = ref(false);
const professorDialog = ref(false);
const oficinaForm = ref<Partial<Oficina>>({ nome: "", cor: "#6366f1" });
const professorForm = ref<Partial<Professor>>({ nome: "" });

async function saveOficinaForm() {
  await saveOficina(oficinaForm.value);
  oficinaDialog.value = false;
  oficinaForm.value = { nome: "", cor: "#6366f1" };
}
async function saveProfessorForm() {
  await saveProfessor(professorForm.value);
  professorDialog.value = false;
  professorForm.value = { nome: "" };
}

onMounted(async () => {
  await Promise.all([fetchOficinas(), fetchProfessores()]);
});
</script>

<template>
  <Tabs default-value="oficinas">
    <TabsList>
      <TabsTrigger value="oficinas">Oficinas</TabsTrigger>
      <TabsTrigger value="professores">Professores</TabsTrigger>
    </TabsList>

    <TabsContent value="oficinas" class="grid gap-4">
      <div class="flex justify-end">
        <Dialog v-model:open="oficinaDialog">
          <DialogTrigger as-child><Button><Plus class="mr-1 size-4" />Nova oficina</Button></DialogTrigger>
          <DialogContent class="sm:max-w-sm">
            <DialogHeader><DialogTitle>Nova oficina</DialogTitle></DialogHeader>
            <div class="grid gap-3 py-2">
              <div class="grid gap-1.5"><Label>Nome</Label><Input v-model="oficinaForm.nome" /></div>
              <div class="grid gap-1.5"><Label>Descrição</Label><Textarea v-model="oficinaForm.descricao" rows="2" /></div>
              <div class="grid gap-1.5"><Label>Cor</Label><Input v-model="oficinaForm.cor" type="color" class="h-10 w-16 p-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="oficinaDialog = false">Cancelar</Button>
              <Button @click="saveOficinaForm">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="o in oficinas" :key="o.id">
          <CardHeader class="flex flex-row items-center gap-2 space-y-0 pb-2">
            <span class="size-3 rounded-full" :style="{ backgroundColor: o.cor }" />
            <CardTitle class="text-sm">{{ o.nome }}</CardTitle>
            <Badge v-if="!o.ativo" variant="outline" class="ml-auto">inativa</Badge>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">{{ o.descricao ?? "Sem descrição." }}</p>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="professores" class="grid gap-4">
      <div class="flex justify-end">
        <Dialog v-model:open="professorDialog">
          <DialogTrigger as-child><Button><Plus class="mr-1 size-4" />Novo professor</Button></DialogTrigger>
          <DialogContent class="sm:max-w-sm">
            <DialogHeader><DialogTitle>Novo professor</DialogTitle></DialogHeader>
            <div class="grid gap-3 py-2">
              <div class="grid gap-1.5"><Label>Nome</Label><Input v-model="professorForm.nome" /></div>
              <div class="grid gap-1.5"><Label>E-mail</Label><Input v-model="professorForm.email" type="email" /></div>
              <div class="grid gap-1.5">
                <Label>Oficina</Label>
                <Select v-model="professorForm.oficina_id">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="o in oficinas" :key="o.id" :value="o.id">{{ o.nome }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-1.5"><Label>Bio</Label><Textarea v-model="professorForm.bio" rows="2" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="professorDialog = false">Cancelar</Button>
              <Button @click="saveProfessorForm">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="p in professores" :key="p.id">
          <CardHeader class="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Avatar>
              <AvatarImage :src="p.foto_url ?? ''" />
              <AvatarFallback>{{ p.nome[0] }}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle class="text-sm">{{ p.nome }}</CardTitle>
              <p class="text-xs text-muted-foreground">{{ p.email ?? "sem e-mail" }}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">{{ p.bio ?? "Sem biografia." }}</p>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
</template>
