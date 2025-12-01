/**
 * Log Workout View - Quick workout logging
 */

import { createWorkout, addExercise, checkAndUpdatePR } from '../db/models.js';
import { createExerciseInput, setupExerciseInputHandlers, collectExerciseData } from '../components/ExerciseInput.js';
import { getCurrentDate, getCurrentTime, validateWorkout } from '../utils/helpers.js';
import { navigate } from '../router/router.js';

let exerciseCount = 0;

export function LogView() {
  exerciseCount = 1;

  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Registrar Entrenamiento</h1>
          <p class="page-subtitle">Nueva sesión de entrenamiento</p>
        </div>

        <form id="workoutForm" class="workout-form">
          <!-- Workout Details -->
          <div class="card card-glass">
            <h3 style="margin-bottom: var(--space-lg);">Detalles del Entrenamiento</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Fecha</label>
                <input 
                  type="date" 
                  id="workoutDate" 
                  class="form-input" 
                  value="${getCurrentDate()}"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Hora Inicio</label>
                <input 
                  type="time" 
                  id="workoutTime" 
                  class="form-input" 
                  value="${getCurrentTime()}"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Hora Fin</label>
                <input 
                  type="time" 
                  id="workoutEndTime" 
                  class="form-input" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Tipo de Entrenamiento</label>
                <select id="workoutType" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Fuerza">💪 Fuerza</option>
                  <option value="Cardio">🏃 Cardio</option>
                  <option value="Funcional">🤸 Funcional</option>
                  <option value="HIIT">⚡ HIIT</option>
                  <option value="Yoga">🧘 Yoga</option>
                  <option value="Mixto">🔄 Mixto</option>
                  <option value="Otro">📝 Otro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Duración (minutos)</label>
                <input 
                  type="number" 
                  id="workoutDuration" 
                  class="form-input" 
                  placeholder="60"
                  min="1"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notas Personales</label>
              <textarea 
                id="workoutNotes" 
                class="form-textarea" 
                placeholder="¿Cómo te sentiste? ¿Alguna observación?"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Exercises Section -->
          <div class="card card-glass" style="margin-top: var(--space-xl);">
            <div class="section-header">
              <h3>Ejercicios</h3>
              <button type="button" class="btn btn-sm btn-primary" id="addExerciseBtn">
                ➕ Agregar Ejercicio
              </button>
            </div>

            <div id="exercisesContainer">
              ${createExerciseInput(0)}
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="window.history.back()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary btn-lg">
              💾 Guardar Entrenamiento
            </button>
          </div>

          <!-- Loading/Success Messages -->
          <div id="formFeedback" class="form-feedback hidden"></div>
        </form>
      </div>
    </div>
  `;
}

// Setup form after rendering
export function setupLogView() {
  const form = document.getElementById('workoutForm');
  const exercisesContainer = document.getElementById('exercisesContainer');
  const addExerciseBtn = document.getElementById('addExerciseBtn');
  const feedback = document.getElementById('formFeedback');

  // Setup initial exercise input handlers
  setupExerciseInputHandlers(exercisesContainer);

  // Setup duration auto-calculation
  const startTimeInput = document.getElementById('workoutTime');
  const endTimeInput = document.getElementById('workoutEndTime');
  const durationInput = document.getElementById('workoutDuration');

  function updateDuration() {
    const start = startTimeInput.value;
    const end = endTimeInput.value;

    if (start && end) {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // Handle overnight (if end time is earlier than start time, assume next day)
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const duration = endMinutes - startMinutes;
      if (duration > 0) {
        durationInput.value = duration;
      }
    }
  }

  startTimeInput.addEventListener('change', updateDuration);
  endTimeInput.addEventListener('change', updateDuration);

  // Add exercise button
  addExerciseBtn.addEventListener('click', () => {
    exerciseCount++;
    exercisesContainer.insertAdjacentHTML('beforeend', createExerciseInput(exerciseCount));
    setupExerciseInputHandlers(exercisesContainer);

    // Setup remove exercise handlers
    setupRemoveExerciseHandlers(exercisesContainer);
  });

  // Setup remove exercise handlers
  setupRemoveExerciseHandlers(exercisesContainer);

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleWorkoutSubmit(form, exercisesContainer, feedback);
  });
}

function setupRemoveExerciseHandlers(container) {
  container.querySelectorAll('.remove-exercise').forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index;
      const exerciseCard = container.querySelector(`.exercise-input[data-index="${index}"]`);
      exerciseCard.remove();
    };
  });
}

async function handleWorkoutSubmit(form, exercisesContainer, feedback) {
  try {
    // Show loading
    feedback.className = 'form-feedback';
    feedback.innerHTML = '<div class="loading">💾 Guardando entrenamiento...</div>';

    // Collect workout data
    const workoutData = {
      date: document.getElementById('workoutDate').value,
      time: document.getElementById('workoutTime').value,
      type: document.getElementById('workoutType').value,
      duration: parseInt(document.getElementById('workoutDuration').value),
      notes: document.getElementById('workoutNotes').value
    };

    // Validate
    const validation = validateWorkout(workoutData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Save workout
    const workoutId = await createWorkout(workoutData);

    // Collect and save exercises
    const exerciseCards = exercisesContainer.querySelectorAll('.exercise-input');
    const exercises = [];
    const newPRs = [];

    for (const card of exerciseCards) {
      const index = card.dataset.index;
      const exerciseData = collectExerciseData(exercisesContainer, index);

      if (exerciseData) {
        exerciseData.workoutId = workoutId;
        await addExercise(exerciseData);
        exercises.push(exerciseData);

        // Check for PRs
        if (exerciseData.type === 'strength' && exerciseData.sets.length > 0) {
          const maxWeight = Math.max(...exerciseData.sets.map(s => s.weight || 0));
          const maxReps = Math.max(...exerciseData.sets.map(s => s.reps || 0));

          if (maxWeight > 0) {
            const prResult = await checkAndUpdatePR(exerciseData.name, 'weight', maxWeight);
            if (prResult.isNewPR) {
              newPRs.push({ exercise: exerciseData.name, type: 'weight', value: maxWeight });
            }
          }

          if (maxReps > 0) {
            const prResult = await checkAndUpdatePR(exerciseData.name, 'reps', maxReps);
            if (prResult.isNewPR) {
              newPRs.push({ exercise: exerciseData.name, type: 'reps', value: maxReps });
            }
          }
        }
      }
    }

    // Show success message
    let successMessage = `
      <div class="success-message">
        <h3>✅ Entrenamiento Guardado</h3>
        <p>${exercises.length} ejercicio(s) registrado(s)</p>
    `;

    if (newPRs.length > 0) {
      successMessage += `
        <div class="pr-notifications">
          <h4>🏆 ¡Nuevos Records Personales!</h4>
          <ul>
            ${newPRs.map(pr => `
              <li>${pr.exercise}: ${pr.value} ${pr.type === 'weight' ? 'kg' : 'reps'}</li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    successMessage += `
        <button class="btn btn-primary" onclick="window.location.hash = '/'">
          Ir al Dashboard
        </button>
      </div>
    `;

    feedback.innerHTML = successMessage;

    // Reset form
    setTimeout(() => {
      navigate('/');
    }, 2000);

  } catch (error) {
    console.error('Error saving workout:', error);
    feedback.className = 'form-feedback';
    feedback.innerHTML = `
      <div class="error-message">
        <h3>❌ Error</h3>
        <p>${error.message}</p>
        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.classList.add('hidden')">
          Cerrar
        </button>
      </div>
    `;
  }
}
