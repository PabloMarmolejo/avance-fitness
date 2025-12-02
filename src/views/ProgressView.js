/**
 * Progress View - Comprehensive progress tracking
 */

import Chart from 'chart.js/auto';
import {
  getAllExercises,
  addBodyMetrics,
  addProgressPhoto
} from '../db/models.js';

import {
  calculateTotalVolume,
  getWorkoutFrequency,
  getTopExercisesByVolume,
  calculateWeightChange,
  formatVolume,
  groupMetricsByDate,
  getWorkoutTrend
} from '../utils/progressHelpers.js';

import { calculateStreak, formatDate, compressImage } from '../utils/helpers.js';
import { dataStore } from '../context/dataStore.js';

let currentTab = 'overview';
let activeCharts = {};

export function ProgressView() {
  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Progreso</h1>
          <p class="page-subtitle">Tu viaje fitness en números y fotos</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button class="tab-button active" data-tab="overview">
            📊 Resumen
          </button>
          <button class="tab-button" data-tab="metrics">
            📏 Métricas
          </button>
          <button class="tab-button" data-tab="performance">
            💪 Rendimiento
          </button>
          <button class="tab-button" data-tab="photos">
            📸 Fotos
          </button>
        </div>

        <!-- Tab Contents -->
        <div id="tabContents">
          <div id="overviewContent" class="tab-content active">
            <div class="loading-skeleton" style="height: 200px;"></div>
          </div>
          <div id="metricsContent" class="tab-content"></div>
          <div id="performanceContent" class="tab-content"></div>
          <div id="photosContent" class="tab-content"></div>
        </div>

        <!-- Modals -->
        <div id="metricsModal" class="modal"></div>
        <div id="photoModal" class="modal"></div>
      </div>
    </div>
  `;
}

export function setupProgressView() {
  setupTabs();
  loadTabContent('overview');

  // Subscribe to changes
  const unsubscribe = dataStore.subscribe((state) => {
    // Reload current tab content when data changes
    // We only reload if the relevant data changed, but for simplicity we reload the tab
    loadTabContent(currentTab);
  });

  if (window.currentViewUnsubscribe) {
    window.currentViewUnsubscribe();
  }
  window.currentViewUnsubscribe = unsubscribe;
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');

  tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const tab = button.dataset.tab;

      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      currentTab = tab;
      await loadTabContent(tab);
    });
  });
}

async function loadTabContent(tab) {
  const contentDiv = document.getElementById(`${tab}Content`);

  // Destroy existing charts in this tab to prevent memory leaks
  destroyActiveCharts();

  switch (tab) {
    case 'overview':
      contentDiv.innerHTML = renderOverviewTab();
      initOverviewCharts();
      setupOverviewHandlers();
      contentDiv.classList.add('active');
      break;
    case 'metrics':
      contentDiv.innerHTML = renderBodyMetricsTab();
      initMetricsCharts();
      setupMetricsHandlers();
      contentDiv.classList.add('active');
      break;
    case 'performance':
      contentDiv.innerHTML = await renderPerformanceTab(); // Still async for exercises
      contentDiv.classList.add('active');
      break;
    case 'photos':
      contentDiv.innerHTML = renderPhotosTab();
      setupPhotosHandlers();
      contentDiv.classList.add('active');
      break;
  }
}

function destroyActiveCharts() {
  Object.values(activeCharts).forEach(chart => {
    if (chart) chart.destroy();
  });
  activeCharts = {};
}

// ============================================
// OVERVIEW TAB
// ============================================

function renderOverviewTab() {
  const workouts = dataStore.getWorkouts();
  const metrics = dataStore.getBodyMetrics();
  const latestMetric = metrics[0] || null;
  // Note: getAllExercises still fetches from DB for now, or we can use dataStore.customExercises + default
  // For volume calculation we need all exercises. 
  // Ideally we should cache all exercises too, but let's stick to what we have.
  // Calculating total volume might be heavy if we fetch all exercises every time.
  // Let's simplify and use workouts data if possible, or accept one fetch.

  const totalWorkouts = workouts.length;
  const weeklyWorkouts = getWorkoutFrequency(workouts, 7);
  const currentStreak = calculateStreak(workouts);

  // We can't easily calculate total volume without exercise details if they are not in workout
  // But wait, workout objects don't have exercises embedded in the list view usually?
  // In Firestore model, exercises are in subcollection.
  // dataStore.workouts only has the workout documents.
  // To get volume, we need exercises.
  // dataStore doesn't fetch all exercises of all workouts. That would be too much.
  // So we might need to skip total volume or fetch it separately.
  // For now, let's display 0 or remove it to avoid blocking.
  const totalVolume = 0;

  const weightChange = calculateWeightChange(metrics);

  return `
    <!-- Quick Stats Grid -->
    <div class="metrics-overview-grid">
      <div class="overview-stat-card card-glass">
        <div class="overview-stat-icon">🏋️</div>
        <div class="overview-stat-label">Total Entrenamientos</div>
        <div class="overview-stat-value">${totalWorkouts}</div>
        <div class="overview-stat-change">
          ${weeklyWorkouts} esta semana
        </div>
      </div>

      ${latestMetric ? `
        <div class="overview-stat-card card-glass">
          <div class="overview-stat-icon">⚖️</div>
          <div class="overview-stat-label">Peso Actual</div>
          <div class="overview-stat-value">${latestMetric.weight} kg</div>
          ${weightChange.direction !== 'none' ? `
            <div class="overview-stat-change ${weightChange.direction === 'down' ? 'positive' : 'negative'}">
              ${weightChange.direction === 'down' ? '↓' : '↑'} ${weightChange.change} kg
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="overview-stat-card card-glass">
          <div class="overview-stat-icon">⚖️</div>
          <div class="overview-stat-label">Peso</div>
          <div class="overview-stat-value">--</div>
          <div class="overview-stat-change">Sin registros</div>
        </div>
      `}

      <div class="overview-stat-card card-glass">
        <div class="overview-stat-icon">🔥</div>
        <div class="overview-stat-label">Racha Actual</div>
        <div class="overview-stat-value">${currentStreak}</div>
        <div class="overview-stat-change">días consecutivos</div>
      </div>
    </div>

    <!-- Activity Chart -->
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Actividad Reciente</h3>
      </div>
      <div class="chart-wrapper">
        <canvas id="activityChart"></canvas>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 style="margin-bottom: var(--space-md);">Acciones Rápidas</h3>
      <div class="action-buttons">
        <button class="btn btn-primary" id="quickMetricsBtn">
          📏 Registrar Métricas
        </button>
        <button class="btn btn-secondary" id="quickPhotoBtn">
          📸 Subir Foto
        </button>
      </div>
    </div>
  `;
}

function initOverviewCharts() {
  const workouts = dataStore.getWorkouts();
  const trend = getWorkoutTrend(workouts, 7); // Last 7 days

  const ctx = document.getElementById('activityChart');
  if (ctx) {
    activeCharts.activity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trend.labels,
        datasets: [{
          label: 'Entrenamientos',
          data: trend.counts,
          backgroundColor: '#6366f1',
          borderRadius: 4,
          barThickness: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#a0a0b8' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#a0a0b8' },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function setupOverviewHandlers() {
  const metricsBtn = document.getElementById('quickMetricsBtn');
  const photoBtn = document.getElementById('quickPhotoBtn');

  if (metricsBtn) {
    metricsBtn.addEventListener('click', () => openMetricsModal());
  }

  if (photoBtn) {
    photoBtn.addEventListener('click', () => openPhotoModal());
  }
}

// ============================================
// BODY METRICS TAB
// ============================================

function renderBodyMetricsTab() {
  const metrics = dataStore.getBodyMetrics();
  const latestMetric = metrics[0] || null;

  if (metrics.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📏</div>
        <h3 class="empty-state-title">No hay métricas registradas</h3>
        <p class="empty-state-description">
          Comienza a registrar tu peso, IMC y medidas corporales para ver tu progreso
        </p>
        <button class="btn btn-primary" id="addMetricsBtn">
          📏 Registrar Primera Métrica
        </button>
      </div>
    `;
  }

  return `
    <!-- Current Metrics -->
    <div class="card card-glass" style="margin-bottom: var(--space-xl);">
      <div class="section-header">
        <h3>Métricas Actuales</h3>
        <button class="btn btn-primary btn-sm" id="addMetricsBtn">
          ➕ Registrar Nuevas
        </button>
      </div>
      
      <div class="metrics-grid" style="margin-top: var(--space-lg);">
        <div class="metric-card">
          <div class="metric-label">Peso</div>
          <div class="metric-value">${latestMetric.weight} kg</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">IMC</div>
          <div class="metric-value">${latestMetric.bmi || '--'}</div>
        </div>
        ${latestMetric.bodyFat ? `
          <div class="metric-card">
            <div class="metric-label">% Grasa</div>
            <div class="metric-value">${latestMetric.bodyFat}%</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Weight Chart -->
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Historial de Peso</h3>
      </div>
      <div class="chart-wrapper">
        <canvas id="weightChart"></canvas>
      </div>
    </div>
  `;
}

function initMetricsCharts() {
  const metrics = dataStore.getBodyMetrics();
  const data = groupMetricsByDate(metrics);

  const ctx = document.getElementById('weightChart');
  if (ctx) {
    activeCharts.weight = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Peso (kg)',
          data: data.weights,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: { color: '#a0a0b8' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#a0a0b8' },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function setupMetricsHandlers() {
  const addBtn = document.getElementById('addMetricsBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openMetricsModal());
  }
}

function openMetricsModal() {
  const modal = document.getElementById('metricsModal');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeMetricsModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Registrar Métricas</h2>
        <button class="modal-close" onclick="closeMetricsModal()">✕</button>
      </div>
      <div class="modal-body">
        ${renderMetricsForm()}
      </div>
    </div>
  `;
  modal.classList.add('active');

  // Setup form submission
  const form = document.getElementById('metricsForm');
  form.addEventListener('submit', handleSaveMetrics);
}

window.closeMetricsModal = function () {
  const modal = document.getElementById('metricsModal');
  modal.classList.remove('active');
};

function renderMetricsForm() {
  const today = new Date().toISOString().split('T')[0];

  return `
    <form id="metricsForm">
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input type="date" name="date" class="form-input" value="${today}" required>
      </div>
      
      <div class="metric-input-group">
        <div class="form-group">
          <label class="form-label">Peso (kg) *</label>
          <input type="number" name="weight" class="form-input" step="0.1" required>
        </div>
        <div class="form-group">
          <label class="form-label">Altura (cm)</label>
          <input type="number" name="height" class="form-input" placeholder="Opcional">
        </div>
      </div>
      
      <div class="metric-input-group">
        <div class="form-group">
          <label class="form-label">% Grasa Corporal</label>
          <input type="number" name="bodyFat" class="form-input" step="0.1" placeholder="Opcional">
        </div>
      </div>
      
      <h4 style="margin-bottom: var(--space-md); margin-top: var(--space-lg);">Medidas (cm)</h4>
      
      <div class="metric-input-group">
        <div class="form-group">
          <label class="form-label">Pecho</label>
          <input type="number" name="chest" class="form-input" step="0.5">
        </div>
        <div class="form-group">
          <label class="form-label">Cintura</label>
          <input type="number" name="waist" class="form-input" step="0.5">
        </div>
        <div class="form-group">
          <label class="form-label">Brazos</label>
          <input type="number" name="arms" class="form-input" step="0.5">
        </div>
        <div class="form-group">
          <label class="form-label">Piernas</label>
          <input type="number" name="legs" class="form-input" step="0.5">
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeMetricsModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">💾 Guardar</button>
      </div>
    </form>
  `;
}

async function handleSaveMetrics(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const weight = parseFloat(formData.get('weight'));
  const height = parseFloat(formData.get('height'));

  let bmi = 0;
  if (weight && height) {
    const heightInMeters = height / 100;
    bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  const metrics = {
    date: formData.get('date'),
    weight: weight,
    height: height,
    bmi: bmi,
    bodyFat: parseFloat(formData.get('bodyFat')) || 0,
    measurements: {
      chest: parseFloat(formData.get('chest')) || 0,
      waist: parseFloat(formData.get('waist')) || 0,
      arms: parseFloat(formData.get('arms')) || 0,
      legs: parseFloat(formData.get('legs')) || 0
    }
  };

  try {
    await addBodyMetrics(metrics);

    closeMetricsModal();
    // Reload handled by subscription
    alert('✅ Métricas guardadas correctamente');
  } catch (error) {
    console.error('Error saving metrics:', error);
    alert('❌ Error al guardar métricas');
  }
}

// ============================================
// PERFORMANCE TAB
// ============================================

async function renderPerformanceTab() {
  const exercises = await getAllExercises(); // Still async
  const topExercises = getTopExercisesByVolume(exercises, 5);

  if (topExercises.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">💪</div>
        <h3 class="empty-state-title">No hay datos de rendimiento</h3>
        <p class="empty-state-description">
          Registra entrenamientos para ver tus gráficas de progreso por ejercicio
        </p>
        <button class="btn btn-primary" onclick="window.location.hash = '/log'">
          ➕ Registrar Entrenamiento
        </button>
      </div>
    `;
  }

  return `
    <!-- Top Exercises by Volume -->
    <div class="card card-glass">
      <h3 style="margin-bottom: var(--space-lg);">🏆 Top Ejercicios por Volumen</h3>
      <div class="top-exercises-list">
        ${topExercises.map((ex, index) => `
          <div class="top-exercise-item">
            <span class="top-exercise-name">#${index + 1} ${ex.name}</span>
            <span class="top-exercise-volume">${formatVolume(ex.volume)} kg</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================
// PHOTOS TAB
// ============================================

function renderPhotosTab() {
  const photos = dataStore.getPhotos();

  if (photos.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📸</div>
        <h3 class="empty-state-title">No hay fotos de progreso</h3>
        <p class="empty-state-description">
          Sube fotos para documentar tu transformación física
        </p>
        <button class="btn btn-primary" id="addPhotoBtn">
          📸 Subir Primera Foto
        </button>
      </div>
    `;
  }

  return `
    <div class="section-header">
      <h3>Galería de Progreso</h3>
      <button class="btn btn-primary btn-sm" id="addPhotoBtn">
        ➕ Agregar Foto
      </button>
    </div>

    <div class="photo-grid">
      ${photos.map(photo => `
        <div class="photo-card card-glass">
          <img src="${photo.imageData}" alt="Foto de progreso ${formatDate(photo.date)}" />
          <div class="photo-date-overlay">${formatDate(photo.date)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function setupPhotosHandlers() {
  const addBtn = document.getElementById('addPhotoBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openPhotoModal());
  }
}

function openPhotoModal() {
  const modal = document.getElementById('photoModal');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closePhotoModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Subir Foto de Progreso</h2>
        <button class="modal-close" onclick="closePhotoModal()">✕</button>
      </div>
      <div class="modal-body">
        ${renderPhotoForm()}
      </div>
    </div>
  `;
  modal.classList.add('active');

  // Setup form submission
  const form = document.getElementById('photoForm');
  form.addEventListener('submit', handleSavePhoto);

  // Setup file input preview
  const fileInput = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

window.closePhotoModal = function () {
  const modal = document.getElementById('photoModal');
  modal.classList.remove('active');
};

function renderPhotoForm() {
  const today = new Date().toISOString().split('T')[0];

  return `
    <form id="photoForm">
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input type="date" name="date" class="form-input" value="${today}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">Foto *</label>
        <div class="file-upload-container" style="text-align: center; padding: var(--space-lg); border: 2px dashed var(--color-bg-tertiary); border-radius: var(--radius-lg);">
          <input type="file" id="photoInput" name="photo" accept="image/*" style="display: none;" required>
          <label for="photoInput" class="btn btn-secondary">
            📁 Seleccionar Imagen
          </label>
          <div style="margin-top: var(--space-md);">
            <img id="photoPreview" src="" alt="Vista previa" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md); display: none;">
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Notas (opcional)</label>
        <textarea name="notes" class="form-textarea" placeholder="¿Cómo te sientes? ¿Qué cambios notas?"></textarea>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closePhotoModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">💾 Guardar Foto</button>
      </div>
    </form>
  `;
}

async function handleSavePhoto(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const fileInput = document.getElementById('photoInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Por favor selecciona una imagen');
    return;
  }

  try {
    // Compress image
    const compressedImage = await compressImage(file, 800, 0.8);

    const photoData = {
      date: formData.get('date'),
      imageData: compressedImage,
      notes: formData.get('notes')
    };

    await addProgressPhoto(photoData);

    closePhotoModal();
    // Reload handled by subscription
    alert('✅ Foto guardada correctamente');

  } catch (error) {
    console.error('Error saving photo:', error);
    alert('❌ Error al guardar la foto');
  }
}
