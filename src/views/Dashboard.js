/**
 * Dashboard View - Home Screen
 */

import { getAllWorkouts } from '../db/models.js';
import { getAllPersonalRecords } from '../db/models.js';
import { getLatestBodyMetrics } from '../db/models.js';
import {
  calculateFrequency,
  calculateStreak,
  formatDate,
  getDaysAgo
} from '../utils/helpers.js';
import { navigate } from '../router/router.js';

export async function DashboardView() {
  // Fetch data
  const workouts = await getAllWorkouts();
  const allPRs = await getAllPersonalRecords();
  const latestMetrics = await getLatestBodyMetrics();

  // Calculate statistics
  const weeklyWorkouts = calculateFrequency(workouts, 7);
  const monthlyWorkouts = calculateFrequency(workouts, 30);
  const currentStreak = calculateStreak(workouts);

  // Get recent PRs (last 5)
  const recentPRs = allPRs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get recent workouts (last 3)
  const recentWorkouts = workouts.slice(0, 3);

  return `
    <div class="app-container">
      <div class="app-content">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">¡Bienvenido a Avance Fitness! ${getGreeting()}</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card card-glass">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <p class="stat-label">Esta Semana</p>
              <p class="stat-number">${weeklyWorkouts}</p>
              <p class="stat-sublabel">entrenamientos</p>
            </div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <p class="stat-label">Este Mes</p>
              <p class="stat-number">${monthlyWorkouts}</p>
              <p class="stat-sublabel">entrenamientos</p>
            </div>
          </div>

          <div class="stat-card card-glass ${currentStreak >= 3 ? 'stat-card-highlight' : ''}">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <p class="stat-label">Racha Actual</p>
              <p class="stat-number">${currentStreak}</p>
              <p class="stat-sublabel">días consecutivos</p>
            </div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon">💪</div>
            <div class="stat-content">
              <p class="stat-label">Total Registrados</p>
              <p class="stat-number">${workouts.length}</p>
              <p class="stat-sublabel">entrenamientos</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3 style="margin-bottom: var(--space-md);">Acciones Rápidas</h3>
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg" onclick="window.location.hash = '/log'">
              ➕ Registrar Entrenamiento
            </button>
            <button class="btn btn-secondary" onclick="window.location.hash = '/routines'">
              📋 Ver Rutinas
            </button>
            <button class="btn btn-secondary" onclick="window.location.hash = '/progress'">
              📊 Ver Progreso
            </button>
          </div>
        </div>

        ${renderRecentWorkouts(recentWorkouts)}
        ${renderRecentPRs(recentPRs)}
        ${renderBodyMetrics(latestMetrics)}
      </div>
    </div>
  `;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅 Buenos días';
  if (hour < 18) return '☀️ Buenas tardes';
  return '🌙 Buenas noches';
}

function renderRecentWorkouts(workouts) {
  if (workouts.length === 0) {
    return `
      <div class="card card-glass" style="margin-top: var(--space-xl); text-align: center;">
        <h3>No hay entrenamientos registrados</h3>
        <p style="color: var(--color-text-secondary); margin: var(--space-md) 0;">
          Comienza a registrar tus entrenamientos para ver tu progreso aquí
        </p>
        <button class="btn btn-primary" onclick="window.location.hash = '/log'">
          Registrar Primer Entrenamiento
        </button>
      </div>
    `;
  }

  return `
    <div class="section" style="margin-top: var(--space-2xl);">
      <div class="section-header">
        <h3>Entrenamientos Recientes</h3>
        <button class="btn btn-sm btn-secondary" onclick="window.location.hash = '/workout'">
          Ver Todos →
        </button>
      </div>
      <div class="workout-list">
        ${workouts.map(workout => `
          <div class="workout-item card-glass">
            <div class="workout-header">
              <div class="workout-type-badge">${workout.type}</div>
              <span class="workout-date">${formatDate(workout.date)}</span>
            </div>
            <div class="workout-details">
              <span class="workout-time">⏱ ${workout.duration} min</span>
              ${workout.notes ? `<span class="workout-notes">📝 ${workout.notes.substring(0, 50)}${workout.notes.length > 50 ? '...' : ''}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecentPRs(prs) {
  if (prs.length === 0) return '';

  return `
    <div class="section" style="margin-top: var(--space-2xl);">
      <div class="section-header">
        <h3>🏆 Records Personales Recientes</h3>
      </div>
      <div class="pr-grid">
        ${prs.map(pr => `
          <div class="pr-card card-glass">
            <div class="pr-header">
              <span class="pr-exercise">${pr.exerciseName}</span>
              <span class="pr-date">${formatDate(pr.date)}</span>
            </div>
            <div class="pr-value">
              ${pr.value} ${getPRUnit(pr.type)}
            </div>
            <div class="pr-type">${getPRTypeLabel(pr.type)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderBodyMetrics(metrics) {
  if (!metrics) return '';

  return `
    <div class="section" style="margin-top: var(--space-2xl);">
      <div class="section-header">
        <h3>📏 Últimas Métricas</h3>
        <button class="btn btn-sm btn-secondary" onclick="window.location.hash = '/progress'">
          Actualizar →
        </button>
      </div>
      <div class="metrics-grid">
        <div class="metric-card card-glass">
          <div class="metric-label">Peso</div>
          <div class="metric-value">${metrics.weight} kg</div>
        </div>
        <div class="metric-card card-glass">
          <div class="metric-label">IMC</div>
          <div class="metric-value">${metrics.bmi}</div>
        </div>
        ${metrics.bodyFat ? `
          <div class="metric-card card-glass">
            <div class="metric-label">% Grasa</div>
            <div class="metric-value">${metrics.bodyFat}%</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getPRUnit(type) {
  switch (type) {
    case 'weight': return 'kg';
    case 'reps': return 'reps';
    case 'distance': return 'km';
    case 'time': return 'min';
    default: return '';
  }
}

function getPRTypeLabel(type) {
  switch (type) {
    case 'weight': return 'Peso Máximo';
    case 'reps': return 'Repeticiones Máximas';
    case 'distance': return 'Distancia Máxima';
    case 'time': return 'Mejor Tiempo';
    default: return type;
  }
}
