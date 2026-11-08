import { TIMEOUTS, TIME } from "./constants.js";

/**
 * ============================================================================
 * UTILS & HELPERS
 * Funções utilitárias para sanitização XSS, formatação BRL, datas e imagens
 * ============================================================================
 */
export const Utils = {
  safe: (str) => {
    if (!str) return "";

    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
      "`": "&#96;",
      "/": "&#x2F;",
      "=": "&#x3D;",
      "\n": "&#10;",
      "\r": "&#13;",
      "\0": "",
    };

    return String(str).replace(/[&<>"'`/=\n\r\0]/g, (char) => map[char] || char);
  },

  formatBRL: (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));
  },

  formatBRLInteiro: (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(Number(value || 0)));
  },

  ajustarDataBR: (isoOrDate) => {
    const d = new Date(isoOrDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d;
  },

  formatarTempoRelativo: (data) => {
    const agora = new Date();
    const diff = Math.floor((agora - data) / TIME.SECOND);
    if (diff < 60) return "Agora mesmo";
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} h`;
    return `Há ${Math.floor(diff / 86400)} dias`;
  },

  gerarAvatarPadrao: (nome) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nome || "User"
    )}&background=random&color=fff&size=200`;
  },

  validarImagemURL: (url, timeout = TIMEOUTS.IMAGE_VALIDATION) => {
    return new Promise((resolve) => {
      if (!url || url.trim() === "") {
        resolve(false);
        return;
      }

      const img = new Image();
      let timeoutId;
      let resolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
        img.src = "";
      };

      img.onload = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(true);
        }
      };

      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(false);
        }
      };

      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(false);
        }
      }, timeout);

      img.src = url;
    });
  },
};
