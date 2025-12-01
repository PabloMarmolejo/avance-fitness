/**
 * Routines View - Manage workout routines
 */

export function RoutinesView() {
    return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Rutinas</h1>
          <p class="page-subtitle">Tus rutinas de entrenamiento</p>
        </div>

        <div class="card card-glass">
          <p style="text-align: center; color: var(--color-text-secondary);">
            No tienes rutinas guardadas.
          </p>
          <button class="btn btn-primary" style="margin-top: var(--space-lg); width: 100%;">
            Crear Rutina
          </button>
        </div>
      </div>
    </div>
  `;
}
