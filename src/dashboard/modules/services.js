import { supabase } from "../../services/supabase.js";
import { State, getMeuUserId } from "./state.js";
import { cache } from "./cache.js";
import { Utils } from "./utils.js";

/**
 * ============================================================================
 * SERVICES LAYER
 * Camada de comunicação com o Supabase (Tabelas, Views e RPCs)
 * ============================================================================
 */
export const MoradorService = {
  async buscarPerfilUsuario() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;
    const { data, error } = await supabase
      .from("moradores")
      .select(
        "id, nome, email, cargo, user_id, celular, tipo, status, unidade, img"
      )
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { session, perfil: data };
  },

  async listarTodos() {
    return await supabase
      .from("moradores")
      .select("id, nome, email, cargo, celular, tipo, status, unidade, img, user_id")
      .order("id", { ascending: false });
  },

  async salvar(dados, id) {
    return await supabase.from("moradores").update(dados).eq("id", id);
  },

  async atualizarMeuPerfil(id, dados) {
    const { data, error } = await supabase
      .from("moradores")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluir(email) {
    return await supabase.from("moradores").delete().eq("email", email);
  },

  async excluirCompleto(user_id) {
    try {
      const { data, error } = await supabase.rpc("delete_user_auth", {
        target_user_id: user_id,
      });

      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message);
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error("Erro completo:", error);
      throw new Error(error.message || "Erro ao deletar usuário");
    }
  },

  async logout(onError) {
    try {
      if (window.dashboardChannel) {
        await window.dashboardChannel.unsubscribe();
        window.dashboardChannel = null;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        if (typeof onError === "function") {
          onError("Erro ao desconectar. Redirecionando...");
        }
        setTimeout(() => {
          window.location.href = "../auth/login.html";
        }, 1000);
      } else {
        State.usuarioLogado = null;
        cache.invalidateAll();
        State.moradoresCache = [];
        State.pendingRequests.clear();
        window.location.href = "../auth/login.html";
      }
    } catch (err) {
      console.error("Erro fatal no logout:", err);
      window.location.href = "../auth/login.html";
    }
  },
};

export const ReservaService = {
  async listar() {
    return await supabase
      .from("vw_reservas_detalhes")
      .select("id, area, data, user_id, nome_morador, created_at")
      .order("data", { ascending: true });
  },

  async criar(area, data) {
    const userId = await getMeuUserId();
    return await supabase
      .from("reservas")
      .insert([{ user_id: userId, area, data }]);
  },

  async deletar(id) {
    return await supabase.from("reservas").delete().eq("id", id);
  },
};

export const OcorrenciaService = {
  async listar() {
    return await supabase
      .from("vw_ocorrencias_detalhes")
      .select(
        "id, titulo, descricao, status, created_at, minha, registrador_nome, registrador_unidade, registrador_celular"
      )
      .order("created_at", { ascending: false })
      .limit(50);
  },

  async criar(titulo, descricao) {
    const userId = await getMeuUserId();
    return await supabase
      .from("ocorrencias")
      .insert([{ user_id: userId, titulo, descricao }]);
  },

  async deletar(id) {
    return await supabase.from("ocorrencias").delete().eq("id", id);
  },
};

export const CaixaService = {
  async saldo() {
    return await supabase.from("vw_saldo_caixa").select("saldo").single();
  },

  async listarPublico() {
    return await supabase
      .from("vw_caixa_movimentos_publico")
      .select("id, tipo, valor, descricao, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
  },

  async movimentar(tipo, valor, descricao) {
    const userId = await getMeuUserId();
    return await supabase
      .from("caixa_movimentos")
      .insert([{ user_id: userId, tipo, valor, descricao }]);
  },
};

export const KpiService = {
  async unidades() {
    return await supabase.rpc("kpi_unidades");
  },
};

export const NotificationService = {
  async buscarTudo() {
    const [ocorrencias, reservas, caixa] = await Promise.all([
      supabase
        .from("vw_ocorrencias_detalhes")
        .select("titulo, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("vw_reservas_detalhes")
        .select("area, data, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("vw_caixa_movimentos_publico")
        .select("tipo, valor, descricao, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const lista = [];

    if (ocorrencias.data) {
      ocorrencias.data.forEach((o) =>
        lista.push({
          tipo: "ocorrencia",
          titulo: "Nova Ocorrência",
          desc: o.titulo || "Sem título",
          data: new Date(o.created_at),
          icon: "fa-triangle-exclamation",
          color: "bg-notif-orange",
        })
      );
    }

    if (reservas.data) {
      reservas.data.forEach((r) => {
        const dataRef = r.created_at
          ? new Date(r.created_at)
          : new Date(r.data);
        lista.push({
          tipo: "reserva",
          titulo: "Reserva Confirmada",
          desc: `${r.area} - ${Utils.ajustarDataBR(r.data).toLocaleDateString(
            "pt-BR"
          )}`,
          data: dataRef,
          icon: "fa-calendar-check",
          color: "bg-notif-purple",
        });
      });
    }

    if (caixa.data) {
      caixa.data.forEach((c) => {
        const isEntrada = c.tipo === "entrada";
        lista.push({
          tipo: "caixa",
          titulo: isEntrada ? "Entrada no Caixa" : "Saída do Caixa",
          desc: `${Utils.formatBRL(c.valor)} - ${c.descricao}`,
          data: new Date(c.created_at),
          icon: isEntrada ? "fa-arrow-trend-up" : "fa-arrow-trend-down",
          color: isEntrada ? "bg-notif-green" : "bg-notif-blue",
        });
      });
    }

    return lista.sort((a, b) => b.data - a.data).slice(0, 20);
  },
};
