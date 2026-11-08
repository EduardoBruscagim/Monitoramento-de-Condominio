import { CACHE_TTL } from "./constants.js";

/**
 * ============================================================================
 * SMART CACHE SYSTEM
 * Sistema de cache em memória com TTL dinâmico por domínio e pub/sub
 * ============================================================================
 */
export class SmartCache {
  constructor() {
    this.stores = new Map();
    this.listeners = new Map();
  }

  getTTL(key) {
    const ttls = {
      kpis: CACHE_TTL.KPIS,
      reservas: CACHE_TTL.RESERVAS,
      moradores: CACHE_TTL.MORADORES,
      notificacoes: CACHE_TTL.NOTIFICACOES,
      ocorrencias: CACHE_TTL.DEFAULT,
      caixa: CACHE_TTL.DEFAULT,
    };
    return ttls[key] || CACHE_TTL.DEFAULT;
  }

  set(key, value) {
    this.stores.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: this.getTTL(key),
    });
    this.notifyListeners(key, value);
  }

  get(key) {
    const store = this.stores.get(key);
    if (!store) return null;

    const isExpired = Date.now() - store.timestamp > store.ttl;
    if (isExpired) {
      this.stores.delete(key);
      return null;
    }

    return store.data;
  }

  invalidate(key) {
    this.stores.delete(key);
    this.notifyListeners(key, null);
  }

  invalidateAll() {
    this.stores.clear();
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
  }

  notifyListeners(key, data) {
    const callbacks = this.listeners.get(key) || [];
    callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in cache listener for ${key}:`, error);
      }
    });
  }
}

export const cache = new SmartCache();
