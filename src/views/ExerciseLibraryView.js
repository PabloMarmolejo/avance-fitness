/**
 * Exercise Library View - Browse and search exercises
 */

import {
  getAllExerciseLibrary,
  getExercisesByCategory,
  searchExercises
} from '../db/exerciseLibraryModels.js';
import { CATEGORY_LABELS } from '../db/exerciseLibrary.js';
import { debounce } from '../utils/helpers.js';

let allExercises = [];
let currentFilter = 'all';
let currentSearchQuery = '';

export function ExerciseLibraryView() {
  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">📚 Guía de Ejercicios</h1>
          <p class="page-subtitle" id="subtitle">Explora nuestra biblioteca de ejercicios</p>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <input 
            type="text" 
            id="exerciseSearch" 
            class="search-input" 
            placeholder="🔍 Buscar ejercicios..."
          />
        </div>

        <!-- Category Filters -->
        <div class="category-filters">
          <button class="filter-chip active" data-category="all">
            🎯 Todos
          </button>
          ${Object.entries(CATEGORY_LABELS).map(([key, data]) => `
            <button class="filter-chip" data-category="${key}">
              ${data.emoji} ${data.name}
            </button>
          `).join('')}
        </div>

        <!-- Exercise Grid -->
        <div id="exerciseGrid" class="exercise-grid">
            <div class="loading-skeleton" style="height: 100px;"></div>
            <div class="loading-skeleton" style="height: 100px;"></div>
            <div class="loading-skeleton" style="height: 100px;"></div>
        </div>

        <!-- Exercise Detail Modal -->
        <div id="exerciseModal" class="modal">
          <div class="modal-content exercise-modal-content">
            <div class="modal-header">
              <h2 id="exerciseModalTitle"></h2>
              <button class="modal-close" onclick="closeExerciseModal()">✕</button>
            </div>
            <div class="modal-body" id="exerciseModalBody">
              <!-- Exercise details will be inserted here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExercises(exercises) {
  if (exercises.length === 0) {
    return `
      <div class="empty-state">
        <div style="font-size: 4rem; margin-bottom: var(--space-lg);">🔍</div>
        <h3>No se encontraron ejercicios</h3>
        <p style="color: var(--color-text-secondary);">
          Intenta con otra búsqueda o filtro
        </p>
      </div>
    `;
  }

  return exercises.map(exercise => `
    <div class="exercise-card card-glass" onclick="showExerciseDetail(${exercise.id})">
      <div class="exercise-card-icon">
        ${CATEGORY_LABELS[exercise.category]?.emoji || '💪'}
      </div>
      <div class="exercise-card-content">
        <h3 class="exercise-card-title">${exercise.name}</h3>
        <div class="exercise-card-meta">
          <span class="meta-badge" style="background: ${CATEGORY_LABELS[exercise.category]?.color}20; color: ${CATEGORY_LABELS[exercise.category]?.color}">
            ${CATEGORY_LABELS[exercise.category]?.name}
          </span>
          <span class="meta-badge difficulty-${exercise.difficulty}">
            ${getDifficultyLabel(exercise.difficulty)}
          </span>
        </div>
        <p class="exercise-card-description">
          ${exercise.description.substring(0, 80)}${exercise.description.length > 80 ? '...' : ''}
        </p>
      </div>
      <div class="exercise-card-arrow">→</div>
    </div>
  `).join('');
}

function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: '⭐ Principiante',
    intermediate: '⭐⭐ Intermedio',
    advanced: '⭐⭐⭐ Avanzado'
  };
  return labels[difficulty] || difficulty;
}

// Setup view
export async function setupExerciseLibraryView() {
  console.log('🚀 setupExerciseLibraryView called');

  try {
    allExercises = await getAllExerciseLibrary();
    const grid = document.getElementById('exerciseGrid');
    const subtitle = document.getElementById('subtitle');
    if (grid) {
      grid.innerHTML = renderExercises(allExercises);
    }
    if (subtitle) {
      subtitle.textContent = `Descubre y aprende ${allExercises.length} ejercicios`;
    }
  } catch (error) {
    console.error('Error loading exercises:', error);
  }

  setupSearch();
  setupFilters();

  // Make functions global for onclick
  window.showExerciseDetail = showExerciseDetail;
  window.closeExerciseModal = closeExerciseModal;
}

function setupSearch() {
  const searchInput = document.getElementById('exerciseSearch');
  if (!searchInput) return;

  const debouncedSearch = debounce(async (query) => {
    currentSearchQuery = query.toLowerCase();
    await updateExerciseGrid();
  }, 300);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-chip');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update filter
      currentFilter = btn.dataset.category;
      await updateExerciseGrid();
    });
  });
}

async function updateExerciseGrid() {
  let exercises = [];

  // Apply category filter
  if (currentFilter === 'all') {
    exercises = await getAllExerciseLibrary();
  } else {
    exercises = await getExercisesByCategory(currentFilter);
  }

  // Apply search filter
  if (currentSearchQuery) {
    exercises = exercises.filter(ex =>
      ex.name.toLowerCase().includes(currentSearchQuery) ||
      ex.description.toLowerCase().includes(currentSearchQuery) ||
      ex.musclesWorked.primary.some(m => m.toLowerCase().includes(currentSearchQuery)) ||
      ex.musclesWorked.secondary.some(m => m.toLowerCase().includes(currentSearchQuery))
    );
  }

  // Update grid
  const grid = document.getElementById('exerciseGrid');
  if (grid) {
    grid.innerHTML = renderExercises(exercises);
  }
}

async function showExerciseDetail(id) {
  // Fetch directly from DB to ensure we have the correct data
  const exercise = await import('../db/exerciseLibraryModels.js').then(m => m.getExerciseFromLibrary(id));

  if (!exercise) {
    console.error('Exercise not found:', id);
    return;
  }

  const modal = document.getElementById('exerciseModal');
  const title = document.getElementById('exerciseModalTitle');
  const body = document.getElementById('exerciseModalBody');

  title.textContent = exercise.name;

  body.innerHTML = `
    <div class="exercise-detail">
      <div class="detail-icon">
        ${CATEGORY_LABELS[exercise.category]?.emoji || '💪'}
      </div>

      <div class="detail-meta">
        <span class="meta-badge" style="background: ${CATEGORY_LABELS[exercise.category]?.color}20; color: ${CATEGORY_LABELS[exercise.category]?.color}">
          ${CATEGORY_LABELS[exercise.category]?.name}
        </span>
        <span class="meta-badge difficulty-${exercise.difficulty}">
          ${getDifficultyLabel(exercise.difficulty)}
        </span>
        ${exercise.equipment && exercise.equipment.length > 0 ? `
          <span class="meta-badge">
            🏋️ ${exercise.equipment.join(', ')}
          </span>
        ` : ''}
      </div>

      <div class="detail-section">
        <h3>📝 Descripción</h3>
        <p>${exercise.description}</p>
      </div>

      <div class="detail-section">
        <h3>📋 Instrucciones</h3>
        <ol>
          ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ol>
      </div>

      ${exercise.tips && exercise.tips.length > 0 ? `
        <div class="detail-section">
          <h3>💡 Consejos</h3>
          <ul>
            ${exercise.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="detail-section">
        <h3>🎯 Músculos Trabajados</h3>
        <div class="muscles-worked">
          <div>
            <strong>Principales:</strong>
            <div class="muscle-tags">
              ${exercise.musclesWorked.primary.map(m => `
                <span class="muscle-tag primary">${m}</span>
              `).join('')}
            </div>
          </div>
          ${exercise.musclesWorked.secondary.length > 0 ? `
            <div style="margin-top: var(--space-sm);">
              <strong>Secundarios:</strong>
              <div class="muscle-tags">
                ${exercise.musclesWorked.secondary.map(m => `
                  <span class="muscle-tag secondary">${m}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: var(--space-lg);" onclick="useExerciseInWorkout('${exercise.name}')">
        ➕ Usar en Entrenamiento
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeExerciseModal() {
  const modal = document.getElementById('exerciseModal');
  modal.classList.remove('active');
}

window.useExerciseInWorkout = (exerciseName) => {
  // Store exercise name in localStorage for use in workout form
  localStorage.setItem('selectedExercise', exerciseName);
  closeExerciseModal();
  // Navigate to log workout
  window.location.hash = '/log';
  alert(`✅ "${exerciseName}" seleccionado. Ahora completa los detalles del ejercicio.`);
};
