/**
 * Dashboard View - Home Screen
 */

export function DashboardView() {
    return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Resumen de tu progreso</p>
        </div>

        <div class="grid grid-cols-2 gap-md">
          <div class="card card-glass">
            <h3>Entrenamientos esta semana</h3>
            <p class="stat-number">0</p>
          </div>

          <div class="card card-glass">
            <h3>Racha actual</h3>
            <p class="stat-number">0 días</p>
          </div>
        </div>

        <div class="card card-glass" style="margin-top: var(--space-lg)">
          <h3>Bienvenido a Avance Fitness</h3>
          <p>Comienza a registrar tus entrenamientos para ver tu progreso aquí.</p>
        </div>
      </div>
    </div>
  `;
}
