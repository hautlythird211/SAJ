<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/composables/useAuth";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();
const { signInWithPassword } = useAuth();

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await signInWithPassword(email.value, password.value);
    router.push("/dashboard");
  } catch (e) {
    error.value = "E-mail ou senha inválidos.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-muted/40 p-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          S
        </div>
        <CardTitle>Painel SAJ</CardTitle>
        <CardDescription>Entre com sua conta da equipe</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="onSubmit">
          <div class="grid gap-2">
            <Label for="email">E-mail</Label>
            <Input id="email" v-model="email" type="email" placeholder="voce@saj.org.br" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Senha</Label>
            <Input id="password" v-model="password" type="password" required />
          </div>
          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Entrando..." : "Entrar" }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
