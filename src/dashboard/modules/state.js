import { supabase } from "../../services/supabase.js";

/**
 * ============================================================================
 * GLOBAL STATE & REQUEST DEDUPLICATION
 * Gerenciamento centralizado do estado da aplicação e controle de concorrência
 * ============================================================================
 */
export const State = {
  usuarioLogado: null,
  moradoresCache: [],
  idEditando: null,

  emailParaDeletar: null,
  reservaParaDeletar: null,
  ocorrenciaParaDeletar: null,

  carregandoReservas: false,
  carregandoOcorrencias: false,
  carregandoCaixa: false,
  carregandoNotificacoes: false,
  carregandoKPIs: false,

  pendingRequests: new Map(),
};

export const isAdmin = () =>
  State.usuarioLogado?.cargo === "Dono" ||
  State.usuarioLogado?.cargo === "admin";

export const getMeuUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) {
    throw new Error("Usuário não autenticado");
  }
  return data.user.id;
};

/**
 * Previne race conditions deduplicando requisições concorrentes para a mesma chave.
 */
export async function fetchWithDedup(key, fetchFn) {
  if (State.pendingRequests.has(key)) {
    return State.pendingRequests.get(key);
  }

  const promise = fetchFn().finally(() => {
    State.pendingRequests.delete(key);
  });

  State.pendingRequests.set(key, promise);
  return promise;
}
