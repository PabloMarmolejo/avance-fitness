/**
 * Exercise Library View - Browse and search exercises
 */

import { CATEGORY_LABELS, EXERCISES_DATABASE } from '../db/exerciseLibrary.js';
import { debounce } from '../utils/helpers.js';
import { dataStore } from '../context/dataStore.js';

let allExercises = [];
let filteredExercises = [];
let currentFilter = 'all';
let currentSearchQuery = '';
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

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
        <div id="exerciseGrid" class="grid grid-cols-2 gap-md animate-fadeIn">
            <!-- Exercises will be loaded here -->
        </div>
        
        <!-- Load More Button -->
        <div id="loadMoreContainer" style="text-align: center; margin-top: var(--space-lg); display: none;">
            <button id="loadMoreBtn" class="btn btn-secondary">
                ⬇️ Cargar más
            </button>
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

function renderExerciseCard(exercise) {
  return `
    <div class="exercise-card card-glass" onclick="showExerciseDetail('${exercise.id}')">
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
  `;
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
export function setupExerciseLibraryView() {
  console.log('🚀 setupExerciseLibraryView called');

  // Initial load
  loadExercisesData();

  // Subscribe to changes in custom exercises
  const unsubscribe = dataStore.subscribe((state, loading, changedCollection) => {
    if (changedCollection === 'customExercises' || !changedCollection) {
      loadExercisesData();
    }
  });

  if (window.currentViewUnsubscribe) {
    window.currentViewUnsubscribe();
  }
  window.currentViewUnsubscribe = unsubscribe;

  setupSearch();
  setupFilters();
  setupLoadMore();

  // Make functions global for onclick
  window.showExerciseDetail = showExerciseDetail;
  window.closeExerciseModal = closeExerciseModal;
}

function loadExercisesData() {
  const customExercises = dataStore.getCustomExercises();
  // Merge default and custom exercises
  // Merge default and custom exercises
  // Assign IDs to default exercises since they don't have one in the static DB
  const defaults = EXERCISES_DATABASE.map((ex, index) => ({
    ...ex,
    id: `def-${index}`
  }));

  allExercises = [...defaults, ...customExercises];

  // Update subtitle
  const subtitle = document.getElementById('subtitle');
  if (subtitle) {
    subtitle.textContent = `Descubre y aprende ${allExercises.length} ejercicios`;
  }

  // Reset and filter
  applyFilters();
}

function setupSearch() {
  const searchInput = document.getElementById('exerciseSearch');
  if (!searchInput) return;

  const debouncedSearch = debounce((query) => {
    currentSearchQuery = query.toLowerCase();
    applyFilters();
  }, 300);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-chip');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update filter
      currentFilter = btn.dataset.category;
      applyFilters();
    });
  });
}

function setupLoadMore() {
  const btn = document.getElementById('loadMoreBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      currentPage++;
      renderGrid(true); // Append mode
    });
  }
}

function applyFilters() {
  // 1. Filter by category
  let result = allExercises;
  if (currentFilter !== 'all') {
    result = result.filter(ex => ex.category === currentFilter);
  }

  // 2. Filter by search
  if (currentSearchQuery) {
    result = result.filter(ex =>
      ex.name.toLowerCase().includes(currentSearchQuery) ||
      ex.description.toLowerCase().includes(currentSearchQuery) ||
      ex.musclesWorked.primary.some(m => m.toLowerCase().includes(currentSearchQuery)) ||
      ex.musclesWorked.secondary.some(m => m.toLowerCase().includes(currentSearchQuery))
    );
  }

  filteredExercises = result;
  currentPage = 1; // Reset pagination
  renderGrid(false); // Replace mode
}

function renderGrid(append = false) {
  const grid = document.getElementById('exerciseGrid');
  const loadMoreContainer = document.getElementById('loadMoreContainer');

  if (!grid) return;

  const start = 0;
  const end = currentPage * ITEMS_PER_PAGE;
  const exercisesToShow = filteredExercises.slice(0, end);

  // If append mode, we could optimize to only render new items, 
  // but for simplicity and correctness with the slice logic, we'll re-render the visible set 
  // OR we can just render the new slice. 
  // Let's re-render the visible set to keep it simple and robust against filter changes.
  // Actually, for "Load More", we usually want to append. 
  // But since we are using innerHTML for the grid, we have to be careful.

  if (exercisesToShow.length === 0) {
    grid.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: var(--space-lg);">🔍</div>
            <h3>No se encontraron ejercicios</h3>
            <p style="color: var(--color-text-secondary);">
            Intenta con otra búsqueda o filtro
            </p>
        </div>
      `;
    loadMoreContainer.style.display = 'none';
    return;
  }

  // Optimized rendering: build one big string
  const html = exercisesToShow.map(ex => renderExerciseCard(ex)).join('');
  grid.innerHTML = html;

  // Show/Hide Load More button
  if (exercisesToShow.length < filteredExercises.length) {
    loadMoreContainer.style.display = 'block';
  } else {
    loadMoreContainer.style.display = 'none';
  }
}

function showExerciseDetail(id) {
  // Find exercise in memory
  // ID can be string or number depending on source
  const exercise = allExercises.find(ex => ex.id == id);

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
