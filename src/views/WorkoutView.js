/**
 * Workout View - Workout History
 */

import { getExercisesByWorkout, deleteWorkout } from '../db/models.js';
import { formatDate } from '../utils/helpers.js';
import { navigate } from '../router/router.js';
import { dataStore } from '../context/dataStore.js';

export function WorkoutView() {
  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Entrenamientos</h1>
          <p class="page-subtitle">Historial de sesiones</p>
        </div>

        <div id="workouts-container">
          <!-- Workouts will be rendered here -->
          <div class="loading-skeleton" style="height: 200px;"></div>
          <div class="loading-skeleton" style="height: 200px;"></div>
        </div>
      </div>
    </div>
  `;
}

import { openWorkoutDetailsModal } from '../components/WorkoutDetailsModal.js';

export function setupWorkoutView() {
  // Initial render
  updateWorkoutsList(dataStore.state.workouts);

  // Subscribe to changes
  const unsubscribe = dataStore.subscribe((state) => {
    updateWorkoutsList(state.workouts);
  });

  // Handle cleanup
  if (window.currentViewUnsubscribe) {
    window.currentViewUnsubscribe();
  }
  window.currentViewUnsubscribe = unsubscribe;

  // Make functions globally available
  window.viewWorkoutDetails = openWorkoutDetailsModal;
  window.confirmDeleteWorkout = confirmDeleteWorkout;
}

function updateWorkoutsList(workouts) {
  const container = document.getElementById('workouts-container');
  if (!container) return;

  if (!workouts || workouts.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = renderWorkoutsList(sortedWorkouts);
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
  return `
    <div class="section-header" style="margin-bottom: var(--space-lg);">
      <h3>Historial Completo (${workouts.length})</h3>
      <button class="btn btn-primary" onclick="window.location.hash = '/log'">
        ➕ Nuevo Entrenamiento
      </button>
    </div>

    <div class="workout-list">
      ${workouts.map(workout => `
        <div class="workout-item card-glass" onclick="viewWorkoutDetails('${workout.id}')" style="cursor: pointer;">
          <div class="workout-header">
            <div class="workout-type-badge">${workout.type}</div>
            <span class="workout-date">${formatDate(workout.date)}</span>
          </div>
          <div class="workout-details">
            <span class="workout-time">⏱ ${workout.duration} min</span>
            ${workout.time ? `<span class="workout-time">🕐 ${workout.time}</span>` : ''}
            ${workout.notes ? `<span class="workout-notes">📝 ${workout.notes.substring(0, 100)}${workout.notes.length > 100 ? '...' : ''}</span>` : ''}
          </div>
          <div class="workout-actions">
            <button 
              class="btn btn-sm btn-danger" 
              onclick="event.stopPropagation(); confirmDeleteWorkout('${workout.id}', '${workout.type.replace(/'/g, "\\'")}')"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}



import { showConfirmationModal } from '../components/ConfirmationModal.js';
import { showToast } from '../utils/helpers.js';

async function confirmDeleteWorkout(id, type) {
  console.log('🗑️ Requesting delete confirmation for:', id, type);

  showConfirmationModal({
    title: 'Eliminar Entrenamiento',
    message: `¿Estás seguro de que quieres eliminar el entrenamiento de "${type}"? Esta acción no se puede deshacer.`,
    confirmText: 'Sí, Eliminar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: async () => {
      try {
        console.log('👉 Proceeding with deletion...');
        await deleteWorkout(id);
        console.log('✅ Workout deleted successfully');
        showToast('Entrenamiento eliminado correctamente', 'success');
      } catch (error) {
        console.error('❌ Error deleting workout:', error);
        showToast('Error al eliminar: ' + error.message, 'error');
      }
    },
    onCancel: () => {
      console.log('❌ Deletion cancelled by user');
    }
  });
}
