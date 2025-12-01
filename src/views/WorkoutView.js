/**
 * Workout View - Workout History
 */

export function WorkoutView() {
    return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Entrenamientos</h1>
          <p class="page-subtitle">Historial de sesiones</p>
        </div>

        <div class="card card-glass">
          <p style="text-align: center; color: var(--color-text-secondary);">
            No hay entrenamientos registrados aún.
          </p>
          <button class="btn btn-primary" style="margin-top: var(--space-lg); width: 100%;">
            Registrar Entrenamiento
          </button>
        </div>
      </div>
    </div>
  `;
}
