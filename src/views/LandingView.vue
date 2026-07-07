<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const router = useRouter();
const oficinas = ref<{ nome: string; cor: string; descricao: string | null }[]>([]);

onMounted(async () => {
  const { data } = await supabase.from("oficinas").select("nome, cor, descricao").order("nome");
  if (data) oficinas.value = data;
});
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <header class="flex items-center justify-between border-b px-6 py-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          S
        </div>
        <span class="font-semibold">SAJ</span>
      </div>
      <Button @click="router.push('/login')">Entrar</Button>
    </header>

    <main class="flex-1">
      <section class="flex flex-col items-center justify-center px-6 py-20 text-center md:py-28">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl">
          S
        </div>
        <h1 class="mt-6 text-4xl font-bold tracking-tight md:text-5xl">SAJ — Canais Digitais</h1>
        <p class="mt-4 max-w-lg text-muted-foreground text-lg">
          Painel de conteúdo e calendário editorial para gestão das oficinas, eventos e publicações da SAJ.
        </p>
        <div class="mt-8 flex gap-4">
          <Button size="lg" @click="router.push('/login')">Acessar o painel</Button>
        </div>
      </section>

      <section class="border-t bg-muted/30 px-6 py-16">
        <div class="mx-auto max-w-5xl">
          <h2 class="text-center text-2xl font-bold">Oficinas</h2>
          <p class="mt-2 text-center text-muted-foreground">Conheça nossas oficinas e atividades</p>
          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="o in oficinas"
              :key="o.nome"
              class="rounded-lg border bg-card p-5"
            >
              <div class="mb-3 h-2 w-12 rounded-full" :style="{ backgroundColor: o.cor }" />
              <h3 class="font-semibold">{{ o.nome }}</h3>
              <p v-if="o.descricao" class="mt-1 text-sm text-muted-foreground">{{ o.descricao }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t px-6 py-6 text-center text-sm text-muted-foreground">
      SAJ — Serviço de Apoio à Juventude
    </footer>
  </div>
</template>
