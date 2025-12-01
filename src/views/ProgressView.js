/**
 * Progress View - Track progress and stats
 */

export function ProgressView() {
    return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Progreso</h1>
          <p class="page-subtitle">Métricas y estadísticas</p>
        </div>

        <div class="card card-glass">
          <h3>Métricas Corporales</h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--space-lg);">
            No hay métricas registradas aún.
          </p>
          <button class="btn btn-primary" style="width: 100%;">
            Registrar Métricas
          </button>
        </div>
      </div>
    </div>
  `;
}
