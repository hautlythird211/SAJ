<script setup lang="ts">
import { onMounted } from "vue";
import { useConteudos } from "@/composables/useConteudos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Send } from "@lucide/vue";

const { conteudos, loading, fetchConteudos, reviewConteudo } = useConteudos();

onMounted(() => fetchConteudos({ status: "em_revisao" }));
</script>

<template>
  <div class="grid gap-4">
    <div>
      <h2 class="text-lg font-semibold">Fila de Revisão</h2>
      <p class="text-sm text-muted-foreground">Aprove, rejeite ou publique conteúdos enviados pela equipe.</p>
    </div>

    <div v-if="!loading && conteudos.length === 0" class="text-sm text-muted-foreground">
      Nenhum conteúdo aguardando revisão. 🎉
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="c in conteudos" :key="c.id">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">{{ c.titulo }}</CardTitle>
          <CardDescription class="flex items-center gap-2 text-xs">
            <Badge variant="outline">{{ c.tipo }}</Badge>
            <span>{{ c.oficinas?.nome ?? "—" }} · {{ c.professores?.nome ?? "—" }}</span>
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-3">
          <img
            v-if="c.thumbnail_url || c.arquivo_url"
            :src="c.thumbnail_url ?? c.arquivo_url ?? ''"
            class="aspect-video w-full rounded-md object-cover bg-muted"
          />
          <p class="text-xs text-muted-foreground">{{ c.descricao }}</p>
          <div class="flex gap-2">
            <Button size="sm" class="flex-1" @click="reviewConteudo(c.id, 'aprovado')">
              <Check class="mr-1 size-4" /> Aprovar
            </Button>
            <Button size="sm" variant="outline" class="flex-1" @click="reviewConteudo(c.id, 'publicado')">
              <Send class="mr-1 size-4" /> Publicar
            </Button>
            <Button size="sm" variant="destructive" @click="reviewConteudo(c.id, 'rejeitado')">
              <X class="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
