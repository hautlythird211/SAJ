export type UserRole = "admin" | "staff" | "reviewer" | "viewer";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  ativo: boolean;
}

export interface Oficina {
  id: string;
  nome: string;
  descricao?: string | null;
  cor: string;
  ativo: boolean;
}

export interface Professor {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  oficina_id?: string | null;
  foto_url?: string | null;
  bio?: string | null;
  ativo: boolean;
}

export type ConteudoTipo = "foto" | "video" | "texto" | "depoimento" | "bastidor";
export type ConteudoStatus = "rascunho" | "em_revisao" | "aprovado" | "publicado" | "rejeitado";

export interface Conteudo {
  id: string;
  titulo: string;
  tipo: ConteudoTipo;
  oficina_id?: string | null;
  professor_id?: string | null;
  autor_id?: string | null;
  arquivo_url?: string | null;
  thumbnail_url?: string | null;
  descricao?: string | null;
  status: ConteudoStatus;
  data_captura: string;
  tags: string[];
  oficinas?: { nome: string; cor: string } | null;
  professores?: { nome: string; foto_url?: string | null } | null;
}

export type CalendarioTipo = "post" | "reel" | "story" | "evento" | "site";
export type CalendarioStatus = "planejado" | "em_producao" | "pronto" | "publicado" | "atrasado" | "cancelado";
export type Plataforma = "instagram" | "facebook" | "whatsapp" | "site" | "outro";

export interface CalendarioItem {
  id: string;
  titulo: string;
  tipo: CalendarioTipo;
  plataforma: Plataforma;
  oficina_id?: string | null;
  conteudo_id?: string | null;
  responsavel_id?: string | null;
  data_publicacao: string;
  hora_publicacao?: string | null;
  status: CalendarioStatus;
  legenda?: string | null;
  notas?: string | null;
  oficinas?: { nome: string; cor: string } | null;
}

export type EventoStatus = "agendado" | "confirmado" | "realizado" | "cancelado";

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string | null;
  data_evento: string;
  local?: string | null;
  oficina_id?: string | null;
  status: EventoStatus;
  cobertura_conteudo_id?: string | null;
  oficinas?: { nome: string; cor: string } | null;
}
