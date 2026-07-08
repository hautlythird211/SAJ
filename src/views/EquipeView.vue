<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/lib/types";

const membros = ref<Profile[]>([]);

async function load() {
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  membros.value = (data ?? []) as Profile[];
}

async function updateRole(id: string, role: string) {
  await supabase.from("profiles").update({ role }).eq("id", id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="grid gap-4">
    <div>
      <h2 class="text-lg font-semibold">Equipe & Permissões</h2>
      <p class="text-sm text-muted-foreground">Defina o nível de acesso de cada pessoa (somente admin).</p>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead class="hidden sm:table-cell">Status</TableHead>
          <TableHead>Papel</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="m in membros" :key="m.id">
          <TableCell class="flex items-center gap-2">
            <Avatar class="size-7">
              <AvatarImage :src="m.avatar_url ?? ''" />
              <AvatarFallback class="text-xs">{{ m.full_name[0] ?? "?" }}</AvatarFallback>
            </Avatar>
            {{ m.full_name }}
          </TableCell>
          <TableCell class="hidden sm:table-cell">
            <Badge :variant="m.ativo ? 'default' : 'outline'">{{ m.ativo ? "ativo" : "inativo" }}</Badge>
          </TableCell>
          <TableCell>
            <Select :model-value="m.role" @update:model-value="(v) => updateRole(m.id, v != null ? String(v) : 'viewer')">
              <SelectTrigger class="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="staff">Equipe</SelectItem>
                <SelectItem value="reviewer">Revisor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
