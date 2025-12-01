/**
 * Routines View - Manage workout routines
 */

import { getAllRoutines, deleteRoutine, startWorkoutFromRoutine } from '../db/models.js';
import { navigate } from '../router/router.js';

export async function RoutinesView() {
  const routines = await getAllRoutines();

  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Rutinas</h1>
          <p class="page-subtitle">Tus rutinas de entrenamiento guardadas</p>
        </div>

        <div class="section-header">
          <h3>Mis Rutinas (${routines.length})</h3>
          <button class="btn btn-primary" id="createRoutineBtn">
            ➕ Crear Rutina
          </button>
        </div>

        ${routines.length === 0 ? renderEmptyState() : renderRoutinesList(routines)}

        <!-- Create/Edit Routine Modal -->
        <div id="routineModal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modalTitle">Nueva Rutina</h2>
              <button class="modal-close" onclick="closeRoutineModal()">✕</button>
            </div>
            <div class="modal-body">
              ${renderRoutineForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="card card-glass" style="text-align: center; padding: var(--space-2xl);">
      <div style="font-size: 4rem; margin-bottom: var(--space-lg);">📋</div>
      <h3>No tienes rutinas guardadas</h3>
      <p style="color: var(--color-text-secondary); margin: var(--space-md) 0;">
        Crea rutinas personalizadas con tus ejercicios favoritos para iniciar entrenamientos más rápido
      </p>
      <button class="btn btn-primary btn-lg" onclick="openRoutineModal()">
        Crear Mi Primera Rutina
      </button>
    </div>
  `;
}

function renderRoutinesList(routines) {
  return `
    <div class="routines-grid">
      ${routines.map(routine => `
        <div class="routine-card card-glass">
          <div class="routine-header">
            <h3>${routine.name}</h3>
            <div class="routine-actions">
              <button 
                class="btn btn-sm btn-secondary" 
                onclick="editRoutine(${routine.id})"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                class="btn btn-sm btn-danger" 
                onclick="confirmDeleteRoutine(${routine.id}, '${routine.name.replace(/'/g, "\\'")}')"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>

          ${routine.description ? `
            <p class="routine-description">${routine.description}</p>
          ` : ''}

          <div class="routine-exercises">
            <div class="exercises-count">
              📝 ${routine.exercises.length} ejercicio(s)
            </div>
            <div class="exercises-preview">
              ${routine.exercises.slice(0, 3).map(ex => `
                <div class="exercise-chip">${ex.name}</div>
              `).join('')}
              ${routine.exercises.length > 3 ? `
                <div class="exercise-chip">+${routine.exercises.length - 3} más</div>
              ` : ''}
            </div>
          </div>

          <button 
            class="btn btn-primary" 
            style="width: 100%; margin-top: var(--space-md);"
            onclick="startFromRoutine(${routine.id}, '${routine.name.replace(/'/g, "\\'")}')"
          >
            🚀 Iniciar Entrenamiento
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRoutineForm() {
  return `
    <form id="routineForm">
      <div class="form-group">
        <label class="form-label">Nombre de la Rutina *</label>
        <input 
          type="text" 
          id="routineName" 
          class="form-input" 
          placeholder="Ej: Día de Pecho, Piernas, Full Body..."
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">Descripción (opcional)</label>
        <textarea 
          id="routineDescription" 
          class="form-textarea" 
          placeholder="Describe esta rutina..."
          rows="2"
        ></textarea>
      </div>

      <div class="form-group">
        <div class="section-header">
          <label class="form-label">Ejercicios *</label>
          <button type="button" class="btn btn-sm btn-primary" id="addRoutineExerciseBtn">
            ➕ Agregar Ejercicio
          </button>
        </div>
        <div id="routineExercisesList">
          <!-- Exercise items will be added here -->
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeRoutineModal()">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">
          💾 Guardar Rutina
        </button>
      </div>
    </form>
  `;
}

// Setup routines view
export function setupRoutinesView() {
  const createBtn = document.getElementById('createRoutineBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => openRoutineModal());
  }

  // Make functions globally available for onclick handlers
  window.openRoutineModal = openRoutineModal;
  window.closeRoutineModal = closeRoutineModal;
  window.editRoutine = editRoutine;
  window.confirmDeleteRoutine = confirmDeleteRoutine;
  window.startFromRoutine = startFromRoutine;
}

let routineExerciseCount = 0;
let currentEditingRoutineId = null;

function openRoutineModal(routine = null) {
  const modal = document.getElementById('routineModal');
  const title = document.getElementById('modalTitle');

  currentEditingRoutineId = routine?.id || null;
  title.textContent = routine ? 'Editar Rutina' : 'Nueva Rutina';

  modal.classList.remove('hidden');

  // Pre-fill form if editing
  if (routine) {
    document.getElementById('routineName').value = routine.name;
    document.getElementById('routineDescription').value = routine.description || '';

    const exercisesList = document.getElementById('routineExercisesList');
    exercisesList.innerHTML = '';
    routine.exercises.forEach((ex, idx) => {
      addRoutineExerciseItem(ex);
    });
  } else {
    // Add one empty exercise for new routine
    document.getElementById('routineExercisesList').innerHTML = '';
    routineExerciseCount = 0;
    addRoutineExerciseItem();
  }

  setupRoutineFormHandlers();
}

function closeRoutineModal() {
  const modal = document.getElementById('routineModal');
  modal.classList.add('hidden');
  document.getElementById('routineForm').reset();
  currentEditingRoutineId = null;
}

function addRoutineExerciseItem(exercise = null) {
  const exercisesList = document.getElementById('routineExercisesList');
  const index = routineExerciseCount++;

  const exerciseHTML = `
    <div class="routine-exercise-item" data-index="${index}">
      <div class="routine-exercise-header">
        <input 
          type="text" 
          class="form-input exercise-name-input" 
          placeholder="Nombre del ejercicio"
          value="${exercise?.name || ''}"
          data-index="${index}"
          required
        />
        <select class="form-select exercise-type-select" data-index="${index}">
          <option value="strength" ${!exercise || exercise.type === 'strength' ? 'selected' : ''}>💪 Fuerza</option>
          <option value="cardio" ${exercise?.type === 'cardio' ? 'selected' : ''}>🏃 Cardio</option>
        </select>
        <button type="button" class="btn btn-sm btn-danger" onclick="removeRoutineExercise(${index})">
          🗑️
        </button>
      </div>
      
      <div class="routine-exercise-details ${!exercise || exercise.type === 'strength' ? '' : 'hidden'}" data-type="strength" data-index="${index}">
        <div class="sets-inputs">
          <input 
            type="number" 
            class="form-input" 
            placeholder="Sets"
            value="${exercise?.sets || ''}"
            data-field="sets"
            data-index="${index}"
            min="1"
          />
          <input 
            type="number" 
            class="form-input" 
            placeholder="Reps"
            value="${exercise?.reps || ''}"
            data-field="reps"
            data-index="${index}"
            min="1"
          />
          <input 
            type="number" 
            step="0.5"
            class="form-input" 
            placeholder="Peso (kg)"
            value="${exercise?.weight || ''}"
            data-field="weight"
            data-index="${index}"
            min="0"
          />
        </div>
      </div>
      
      <div class="routine-exercise-details ${exercise?.type === 'cardio' ? '' : 'hidden'}" data-type="cardio" data-index="${index}">
        <div class="cardio-inputs-compact">
          <input 
            type="number" 
            class="form-input" 
            placeholder="Duración (min)"
            value="${exercise?.duration || ''}"
            data-field="duration"
            data-index="${index}"
            min="1"
          />
          <input 
            type="number" 
            step="0.1"
            class="form-input" 
            placeholder="Velocidad (km/h)"
            value="${exercise?.speed || ''}"
            data-field="speed"
            data-index="${index}"
            min="0"
          />
        </div>
      </div>
    </div>
  `;

  exercisesList.insertAdjacentHTML('beforeend', exerciseHTML);
}

function setupRoutineFormHandlers() {
  const form = document.getElementById('routineForm');
  const addExerciseBtn = document.getElementById('addRoutineExerciseBtn');

  // Add exercise button
  addExerciseBtn.onclick = () => addRoutineExerciseItem();

  // Exercise type toggles
  document.querySelectorAll('.exercise-type-select').forEach(select => {
    select.onchange = (e) => {
      const index = e.target.dataset.index;
      const type = e.target.value;
      const item = document.querySelector(`.routine-exercise-item[data-index="${index}"]`);

      item.querySelectorAll('.routine-exercise-details').forEach(detail => {
        if (detail.dataset.type === type) {
          detail.classList.remove('hidden');
        } else {
          detail.classList.add('hidden');
        }
      });
    };
  });

  // Form submission
  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleRoutineSave();
  };

  // Make remove function global
  window.removeRoutineExercise = (index) => {
    const item = document.querySelector(`.routine-exercise-item[data-index="${index}"]`);
    item.remove();
  };
}

async function handleRoutineSave() {
  try {
    const name = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();

    // Collect exercises
    const exerciseItems = document.querySelectorAll('.routine-exercise-item');
    const exercises = [];

    for (const item of exerciseItems) {
      const index = item.dataset.index;
      const nameInput = item.querySelector('.exercise-name-input');
      const typeSelect = item.querySelector('.exercise-type-select');

      if (!nameInput.value.trim()) continue;

      const exercise = {
        name: nameInput.value.trim(),
        type: typeSelect.value
      };

      if (exercise.type === 'strength') {
        const setsInput = item.querySelector(`[data-field="sets"][data-index="${index}"]`);
        const repsInput = item.querySelector(`[data-field="reps"][data-index="${index}"]`);
        const weightInput = item.querySelector(`[data-field="weight"][data-index="${index}"]`);

        exercise.sets = parseInt(setsInput?.value) || 0;
        exercise.reps = parseInt(repsInput?.value) || 0;
        exercise.weight = parseFloat(weightInput?.value) || 0;
      } else {
        const durationInput = item.querySelector(`[data-field="duration"][data-index="${index}"]`);
        const speedInput = item.querySelector(`[data-field="speed"][data-index="${index}"]`);

        exercise.duration = parseInt(durationInput?.value) || 0;
        exercise.speed = parseFloat(speedInput?.value) || 0;
      }

      exercises.push(exercise);
    }

    if (exercises.length === 0) {
      alert('Debes agregar al menos un ejercicio');
      return;
    }

    const routineData = { name, description, exercises };

    // Save or update
    if (currentEditingRoutineId) {
      const { updateRoutine, getRoutine } = await import('../db/models.js');
      const existing = await getRoutine(currentEditingRoutineId);
      await updateRoutine({ ...existing, ...routineData });
    } else {
      const { createRoutine } = await import('../db/models.js');
      await createRoutine(routineData);
    }

    closeRoutineModal();

    // Reload view
    navigate('/routines');

  } catch (error) {
    console.error('Error saving routine:', error);
    alert('Error al guardar la rutina: ' + error.message);
  }
}

async function editRoutine(id) {
  const { getRoutine } = await import('../db/models.js');
  const routine = await getRoutine(id);
  if (routine) {
    openRoutineModal(routine);
  }
}

async function confirmDeleteRoutine(id, name) {
  if (confirm(`¿Estás seguro de que quieres eliminar la rutina "${name}"?`)) {
    await deleteRoutine(id);
    navigate('/routines');
  }
}

async function startFromRoutine(id, name) {
  if (confirm(`¿Iniciar entrenamiento con la rutina "${name}"?`)) {
    try {
      const workoutId = await startWorkoutFromRoutine(id);
      alert(`✅ Entrenamiento iniciado desde "${name}"`);
      navigate('/');
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Error al iniciar entrenamiento: ' + error.message);
    }
  }
}
