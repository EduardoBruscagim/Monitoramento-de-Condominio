import { State } from "./state.js";

/**
 * ============================================================================
 * MODAL UX (WCAG 2.2 AA Focus Trap & Keyboard Navigation)
 * Controlador de modais acessíveis com restauração de foco e suporte a Escape
 * ============================================================================
 */
export const ModalUX = {
  overlays: [],
  previousActiveElement: null,

  init() {
    this.overlays = Array.from(document.querySelectorAll(".modal-overlay"));

    this.overlays.forEach((overlay) => {
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close(overlay);
      });

      // Trap focus dentro do modal aberto (WCAG 2.2 SC 2.4.3 Focus Order)
      overlay.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;

        const focusables = Array.from(
          overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (el) => !el.disabled && el.offsetWidth > 0 && el.offsetHeight > 0
        );

        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const aberto = this.overlays.find((m) => m.classList.contains("active"));
      if (aberto) this.close(aberto);
    });

    document
      .querySelectorAll(".close-modal, .close-modal-reserva, .btn-outline")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.closeAll();
          State.reservaParaDeletar = null;
          State.ocorrenciaParaDeletar = null;
          State.emailParaDeletar = null;
        });
      });
  },

  open(overlay) {
    if (!overlay) return;
    this.previousActiveElement = document.activeElement;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(() => {
      const focusable = overlay.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
    }, 50);
  },

  close(overlay) {
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    const algumAberto = this.overlays.some((m) =>
      m.classList.contains("active")
    );
    if (!algumAberto) document.body.classList.remove("modal-open");

    if (
      this.previousActiveElement &&
      typeof this.previousActiveElement.focus === "function"
    ) {
      this.previousActiveElement.focus();
    }
  },

  closeAll() {
    this.overlays.forEach((o) => this.close(o));
  },
};
