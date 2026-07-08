<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from "vue-router";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CalendarDays,
  ImageIcon,
  Users,
  PartyPopper,
  ClipboardCheck,
  UserCog,
  LogOut,
  ChevronDown,
} from "@lucide/vue";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { profile, isReviewerOrAbove, isAdmin, signOut } = useAuth();

const nav = [
  { to: "/dashboard", name: "dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/calendario", name: "calendario", label: "Calendário Editorial", icon: CalendarDays },
  { to: "/conteudos", name: "conteudos", label: "Conteúdos", icon: ImageIcon },
  { to: "/oficinas", name: "oficinas", label: "Oficinas & Professores", icon: Users },
  { to: "/eventos", name: "eventos", label: "Eventos", icon: PartyPopper },
];

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  staff: "Equipe",
  reviewer: "Revisor",
  viewer: "Visualizador",
};
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader class="px-3 py-3">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            S
          </div>
          <div class="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span class="font-semibold text-sm">SAJ</span>
            <span class="text-xs text-muted-foreground">Canais Digitais</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in nav" :key="item.name">
                <SidebarMenuButton as-child :is-active="route.name === item.name" :tooltip="item.label">
                  <RouterLink :to="item.to">
                    <component :is="item.icon" class="size-4" />
                    <span>{{ item.label }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup v-if="isReviewerOrAbove">
          <SidebarGroupLabel>Revisão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :is-active="route.name === 'revisao'" tooltip="Fila de Revisão">
                  <RouterLink to="/revisao">
                    <ClipboardCheck class="size-4" />
                    <span>Fila de Revisão</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup v-if="isAdmin">
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :is-active="route.name === 'equipe'" tooltip="Equipe">
                  <RouterLink to="/equipe">
                    <UserCog class="size-4" />
                    <span>Equipe & Permissões</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent">
              <Avatar class="size-7">
                <AvatarImage :src="profile?.avatar_url ?? ''" />
                <AvatarFallback>{{ profile?.full_name?.[0] ?? "?" }}</AvatarFallback>
              </Avatar>
              <div class="flex flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span class="text-sm font-medium truncate max-w-[9rem]">{{ profile?.full_name }}</span>
                <span class="text-xs text-muted-foreground">{{ roleLabel[profile?.role ?? "viewer"] }}</span>
              </div>
              <ChevronDown class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" class="w-56">
            <DropdownMenuItem @click="signOut">
              <LogOut class="mr-2 size-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <h1 class="text-sm font-medium text-muted-foreground">
          {{ nav.find(n => n.name === route.name)?.label ?? "Painel" }}
        </h1>
      </header>
      <main class="flex-1 overflow-auto p-4 md:p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
