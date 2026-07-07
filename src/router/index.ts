import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/lib/supabase";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: () => import("@/views/LandingView.vue"), meta: { public: true } },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: { public: true } },
    {
      path: "/dashboard",
      component: () => import("@/components/layout/AppShell.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "dashboard", component: () => import("@/views/DashboardView.vue") },
        { path: "calendario", name: "calendario", component: () => import("@/views/CalendarioEditorialView.vue") },
        { path: "conteudos", name: "conteudos", component: () => import("@/views/ConteudoLibraryView.vue") },
        { path: "oficinas", name: "oficinas", component: () => import("@/views/OficinasProfessoresView.vue") },
        { path: "eventos", name: "eventos", component: () => import("@/views/EventosView.vue") },
        {
          path: "revisao",
          name: "revisao",
          component: () => import("@/views/RevisaoView.vue"),
          meta: { roles: ["reviewer", "admin"] },
        },
        {
          path: "equipe",
          name: "equipe",
          component: () => import("@/views/EquipeView.vue"),
          meta: { roles: ["admin"] },
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.public) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && to.name === "landing") return { name: "dashboard" };
    return true;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { name: "login" };

  if (to.meta.roles) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    const allowed = (to.meta.roles as string[]).includes(profile?.role ?? "");
    if (!allowed) return { name: "dashboard" };
  }
  return true;
});

export default router;
