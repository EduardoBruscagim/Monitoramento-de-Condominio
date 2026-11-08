/**
 * ============================================================================
 * CONSTANTS
 * Constantes globais de tempo, timeouts e TTL de cache
 * ============================================================================
 */
export const TIMEOUTS = {
  TOAST_DISPLAY: 4000,
  TOAST_DISPLAY_ERROR: 6000,
  IMAGE_VALIDATION: 8000,
  SETTINGS_SAVE_FEEDBACK: 2000,
};

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

export const CACHE_TTL = {
  DEFAULT: 5 * TIME.MINUTE,
  KPIS: 2 * TIME.MINUTE,
  RESERVAS: 10 * TIME.MINUTE,
  MORADORES: 15 * TIME.MINUTE,
  NOTIFICACOES: 3 * TIME.MINUTE,
};
