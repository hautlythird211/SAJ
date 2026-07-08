import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

const profile = ref<Profile | null>(null);
const loading = ref(true);
const initialized = ref(false);

async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    profile.value = null;
    loading.value = false;
    initialized.value = true;
    return;
  }
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) {
    console.error("Falha ao carregar perfil:", error.message);
    profile.value = null;
  } else {
    profile.value = data as Profile | null;
  }
  loading.value = false;
  initialized.value = true;
}

supabase.auth.onAuthStateChange(() => loadProfile());

export function useAuth() {
  onMounted(() => {
    if (!initialized.value) loadProfile();
  });

  const isStaffOrAbove = computed(() =>
    !!profile.value && ["staff", "reviewer", "admin"].includes(profile.value.role),
  );
  const isReviewerOrAbove = computed(() =>
    !!profile.value && ["reviewer", "admin"].includes(profile.value.role),
  );
  const isAdmin = computed(() => profile.value?.role === "admin");

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadProfile();
  }

  async function signOut() {
    await supabase.auth.signOut();
    profile.value = null;
  }

  return { profile, loading, isStaffOrAbove, isReviewerOrAbove, isAdmin, signInWithPassword, signOut };
}
