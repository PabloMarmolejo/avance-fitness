/**
 * Workout View - Workout History
 */

import { getAllWorkouts, getExercisesByWorkout, deleteWorkout } from '../db/models.js';
import { formatDate } from '../utils/helpers.js';
import { navigate } from '../router/router.js';

export async function WorkoutView() {
  console.log('🔍 WorkoutView: Fetching workouts...');
  const workouts = await getAllWorkouts();
  console.log('🔍 WorkoutView: Got workouts:', workouts.length);

  const html = `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Entrenamientos</h1>
          <p class="page-subtitle">Historial de sesiones</p>
        </div>

        ${workouts.length === 0 ? renderEmptyState() : renderWorkoutsList(workouts)}
      </div>
    </div>
  `;

  console.log('🔍 WorkoutView: Rendering complete');
  return html;
}

function renderEmptyState() {
  return `
    <div class="card card-glass" style="text-align: center; padding: var(--space-2xl);">
      <div style="font-size: 4rem; margin-bottom: var(--space-lg);">💪</div>
      <h3>No hay entrenamientos registrados aún</h3>
      <p style="color: var(--color-text-secondary); margin: var(--space-md) 0;">
        Comienza a registrar tus entrenamientos para ver tu historial aquí
      </p>
      <button class="btn btn-primary btn-lg" onclick="window.location.hash = '/log'">
        Registrar Primer Entrenamiento
      </button>
    </div>
  `;
}

function renderWorkoutsList(workouts) {
  console.log('🔍 renderWorkoutsList: Rendering', workouts.length, 'workouts');

  const workoutItems = workouts.map(workout => {
    const formattedDate = formatDate(workout.date);
    console.log('🔍 Workout:', workout.id, 'Date:', workout.date, 'Formatted:', formattedDate);

    return `
      <div class="workout-item card-glass">
        <div class="workout-header">
          <div class="workout-type-badge">${workout.type}</div>
          <span class="workout-date">${formattedDate}</span>
        </div>
        <div class="workout-details">
          <span class="workout-time">⏱ ${workout.duration} min</span>
          ${workout.time ? `<span class="workout-time">🕐 ${workout.time}</span>` : ''}
          ${workout.notes ? `<span class="workout-notes">📝 ${workout.notes.substring(0, 100)}${workout.notes.length > 100 ? '...' : ''}</span>` : ''}
        </div>
        <div class="workout-actions">
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="viewWorkoutDetails(${workout.id})"
            title="Ver detalles"
          >
            👁️ Ver
          </button>
          <button 
            class="btn btn-sm btn-danger" 
            onclick="confirmDeleteWorkout(${workout.id}, '${workout.type.replace(/'/g, "\\'")}')"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-header" style="margin-bottom: var(--space-lg);">
      <h3>Historial Completo (${workouts.length})</h3>
      <button class="btn btn-primary" onclick="window.location.hash = '/log'">
        ➕ Nuevo Entrenamiento
      </button>
    </div>

    <div class="workout-list">
      ${workoutItems}
    </div>
  `;
}

export function setupWorkoutView() {
  console.log('🔍 setupWorkoutView: Setting up handlers');
  // Make functions globally available
  window.viewWorkoutDetails = viewWorkoutDetails;
  window.confirmDeleteWorkout = confirmDeleteWorkout;
}

async function viewWorkoutDetails(id) {
  console.log('🔍 viewWorkoutDetails:', id);
  const workout = await import('../db/models.js').then(m => m.getWorkout(id));
  const exercises = await getExercisesByWorkout(id);

  const detailsHTML = `
    <div class="modal" style="display: block;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detalles del Entrenamiento</h2>
          <button class="modal-close" onclick="closeWorkoutDetails()">✕</button>
        </div>
        <div class="modal-body">
          <div class="workout-detail-info">
            <p><strong>Tipo:</strong> ${workout.type}</p>
            <p><strong>Fecha:</strong> ${formatDate(workout.date)}</p>
            <p><strong>Hora:</strong> ${workout.time || 'No especificada'}</p>
            <p><strong>Duración:</strong> ${workout.duration} minutos</p>
            ${workout.notes ? `<p><strong>Notas:</strong> ${workout.notes}</p>` : ''}
          </div>

          ${exercises.length > 0 ? `
            <h3 style="margin-top: var(--space-lg);">Ejercicios (${exercises.length})</h3>
            <div class="exercises-list">
              ${exercises.map(ex => `
                <div class="exercise-detail-card card-glass">
                  <h4>${ex.name}</h4>
                  ${ex.type === 'strength' ? `
                    <div class="sets-summary">
                      ${ex.sets.map((set, idx) => `
                        <div class="set-detail">
                          Set ${idx + 1}: ${set.reps} reps × ${set.weight} kg
                        </div>
                      `).join('')}
                    </div>
                  ` : `
                    <div class="cardio-summary">
                      <p>⏱ ${ex.duration} min</p>
                      ${ex.speed ? `<p>🏃 ${ex.speed} km/h</p>` : ''}
                      ${ex.distance ? `<p>📏 ${ex.distance} km</p>` : ''}
                    </div>
                  `}
                </div>
              `).join('')}
            </div>
          ` : '<p>No hay ejercicios registrados</p>'}
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeWorkoutDetails()">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', detailsHTML);

  window.closeWorkoutDetails = () => {
    document.querySelector('.modal').remove();
  };
}

async function confirmDeleteWorkout(id, type) {
  if (confirm(`¿Estás seguro de que quieres eliminar el entrenamiento "${type}"?`)) {
    await deleteWorkout(id);
    navigate('/workout');
  }
}
