/**
 * Exercise Input Component
 * 
 * Component for adding exercises to a workout (strength or cardio)
 */

import { setupExerciseAutocomplete } from '../utils/exerciseAutocomplete.js';

export function createExerciseInput(index, exercise = null) {
  const exerciseName = exercise?.name || '';
  const exerciseType = exercise?.type || 'strength';
  const sets = exercise?.sets || [{ reps: '', weight: '' }];

  return `
    <div class="exercise-input card-glass" data-index="${index}">
      <div class="exercise-header">
        <div class="exercise-header-top">
          <select class="form-select exercise-type" data-index="${index}">
            <option value="strength" ${exerciseType === 'strength' ? 'selected' : ''}>💪 Fuerza</option>
            <option value="cardio" ${exerciseType === 'cardio' ? 'selected' : ''}>🏃 Cardio</option>
          </select>
          <button type="button" class="btn btn-sm btn-danger remove-exercise" data-index="${index}">
            🗑️
          </button>
        </div>
        <div class="exercise-name-wrapper">
          <input 
            type="text" 
            class="form-input exercise-name" 
            placeholder="Nombre del ejercicio (ej: Press de banca)"
            value="${exerciseName}"
            data-index="${index}"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="exercise-details ${exerciseType === 'strength' ? '' : 'hidden'}" data-type="strength" data-index="${index}">
        <div class="sets-container" data-index="${index}">
          ${renderSets(sets, index)}
        </div>
        <button type="button" class="btn btn-sm btn-secondary add-set" data-index="${index}">
          ➕ Agregar Set
        </button>
      </div>

      <div class="exercise-details ${exerciseType === 'cardio' ? '' : 'hidden'}" data-type="cardio" data-index="${index}">
        <div class="cardio-inputs">
          <div class="form-group">
            <label class="form-label">Duración (min)</label>
            <input type="number" class="form-input cardio-duration" placeholder="30" data-index="${index}">
          </div>
          <div class="form-group">
            <label class="form-label">Velocidad (km/h)</label>
            <input type="number" step="0.1" class="form-input cardio-speed" placeholder="10" data-index="${index}">
          </div>
          <div class="form-group">
            <label class="form-label">Inclinación (%)</label>
            <input type="number" step="0.1" class="form-input cardio-incline" placeholder="5" data-index="${index}">
          </div>
          <div class="form-group">
            <label class="form-label">Distancia (km)</label>
            <input type="number" step="0.1" class="form-input cardio-distance" placeholder="5" data-index="${index}">
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSets(sets, exerciseIndex) {
  return sets.map((set, setIndex) => `
    <div class="set-row" data-exercise="${exerciseIndex}" data-set="${setIndex}">
      <span class="set-number">Set ${setIndex + 1}</span>
      <input 
        type="number" 
        class="form-input set-reps" 
        placeholder="Reps"
        value="${set.reps}"
        data-exercise="${exerciseIndex}"
        data-set="${setIndex}"
      />
      <input 
        type="number" 
        step="0.5"
        class="form-input set-weight" 
        placeholder="Peso (kg)"
        value="${set.weight}"
        data-exercise="${exerciseIndex}"
        data-set="${setIndex}"
      />
      ${setIndex > 0 ? `
        <button type="button" class="btn btn-sm btn-danger remove-set" data-exercise="${exerciseIndex}" data-set="${setIndex}">
          ✕
        </button>
      ` : ''}
    </div>
  `).join('');
}

export function setupExerciseInputHandlers(container) {
  // Setup autocomplete on all exercise name inputs
  container.querySelectorAll('.exercise-name').forEach(input => {
    setupExerciseAutocomplete(input, (selectedExercise) => {
      // Auto-select exercise type if from library
      const index = input.dataset.index;
      const exerciseCard = container.querySelector(`.exercise-input[data-index="${index}"]`);
      const typeSelect = exerciseCard.querySelector('.exercise-type');

      if (selectedExercise.category === 'cardio') {
        typeSelect.value = 'cardio';
      } else {
        typeSelect.value = 'strength';
      }

      // Trigger type change to show correct fields
      typeSelect.dispatchEvent(new Event('change'));
    });
  });

  // Toggle exercise type (strength/cardio)
  container.querySelectorAll('.exercise-type').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = e.target.dataset.index;
      const type = e.target.value;
      const exerciseCard = container.querySelector(`.exercise-input[data-index="${index}"]`);

      exerciseCard.querySelectorAll('.exercise-details').forEach(detail => {
        if (detail.dataset.type === type) {
          detail.classList.remove('hidden');
        } else {
          detail.classList.add('hidden');
        }
      });
    });
  });

  // Add set button - using onclick to prevent duplicate listeners
  container.querySelectorAll('.add-set').forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index;
      const setsContainer = container.querySelector(`.sets-container[data-index="${index}"]`);
      const setCount = setsContainer.querySelectorAll('.set-row').length;

      const newSetHTML = `
        <div class="set-row" data-exercise="${index}" data-set="${setCount}">
          <span class="set-number">Set ${setCount + 1}</span>
          <input 
            type="number" 
            class="form-input set-reps" 
            placeholder="Reps"
            data-exercise="${index}"
            data-set="${setCount}"
          />
          <input 
            type="number" 
            step="0.5"
            class="form-input set-weight" 
            placeholder="Peso (kg)"
            data-exercise="${index}"
            data-set="${setCount}"
          />
          <button type="button" class="btn btn-sm btn-danger remove-set" data-exercise="${index}" data-set="${setCount}">
            ✕
          </button>
        </div>
      `;

      setsContainer.insertAdjacentHTML('beforeend', newSetHTML);

      // Re-setup handlers for new set
      setupRemoveSetHandlers(container);
    };
  });

  // Remove set buttons
  setupRemoveSetHandlers(container);
}

function setupRemoveSetHandlers(container) {
  container.querySelectorAll('.remove-set').forEach(btn => {
    btn.onclick = (e) => {
      const setRow = e.target.closest('.set-row');
      setRow.remove();

      // Renumber remaining sets
      const exerciseIndex = e.target.dataset.exercise;
      const setsContainer = container.querySelector(`.sets-container[data-index="${exerciseIndex}"]`);
      const setRows = setsContainer.querySelectorAll('.set-row');
      setRows.forEach((row, idx) => {
        row.querySelector('.set-number').textContent = `Set ${idx + 1}`;
        row.dataset.set = idx;
        row.querySelectorAll('input, button').forEach(el => {
          el.dataset.set = idx;
        });
      });
    };
  });
}

export function collectExerciseData(container, index) {
  const exerciseCard = container.querySelector(`.exercise-input[data-index="${index}"]`);

  const name = exerciseCard.querySelector('.exercise-name').value;
  const type = exerciseCard.querySelector('.exercise-type').value;

  if (!name || !name.trim()) {
    return null;
  }

  const data = {
    name: name.trim(),
    type
  };

  if (type === 'strength') {
    const setRows = exerciseCard.querySelectorAll('.set-row');
    data.sets = Array.from(setRows).map(row => ({
      reps: parseInt(row.querySelector('.set-reps').value) || 0,
      weight: parseFloat(row.querySelector('.set-weight').value) || 0
    })).filter(set => set.reps > 0);
  } else {
    data.duration = parseFloat(exerciseCard.querySelector('.cardio-duration').value) || 0;
    data.speed = parseFloat(exerciseCard.querySelector('.cardio-speed').value) || 0;
    data.incline = parseFloat(exerciseCard.querySelector('.cardio-incline').value) || 0;
    data.distance = parseFloat(exerciseCard.querySelector('.cardio-distance').value) || 0;
  }

  return data;
}
