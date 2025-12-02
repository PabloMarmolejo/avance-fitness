import { dataStore } from '../context/dataStore.js';
import { getExercisesByWorkout } from '../db/models.js';
import { formatDate } from '../utils/helpers.js';

export async function openWorkoutDetailsModal(id) {
    const workout = dataStore.state.workouts.find(w => w.id === id);
    if (!workout) return;

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
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    };
}
