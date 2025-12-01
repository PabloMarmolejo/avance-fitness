import './styles/index.css';
import { initDB } from './db/database.js';
import { initializeDefaultSettings } from './db/models.js';
import { loadInitialExercises } from './db/exerciseLibraryModels.js';
import { router } from './router/router.js';
import { createBottomNav } from './components/BottomNav.js';
import { DashboardView } from './views/Dashboard.js';
import { WorkoutView } from './views/WorkoutView.js';
import { LogView, setupLogView } from './views/LogView.js';
import { RoutinesView, setupRoutinesView } from './views/RoutinesView.js';
import { ProgressView } from './views/ProgressView.js';
import { ExerciseLibraryView, setupExerciseLibraryView } from './views/ExerciseLibraryView.js';

// App initialization
async function initApp() {
  try {
    await initDB();
    await initializeDefaultSettings();
    await loadInitialExercises();
    console.log('✅ App inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
  }
}

initApp();

// Get app container
const app = document.querySelector('#app');

// Setup routes
router.on('/', async () => {
  app.innerHTML = await DashboardView();
});

router.on('/workout', () => {
  app.innerHTML = WorkoutView();
});

router.on('/log', () => {
  app.innerHTML = LogView();
  // Setup form handlers after DOM is ready
  setTimeout(() => {
    if (typeof setupLogView === 'function') {
      setupLogView();
    }
  }, 0);
});

router.on('/routines', async () => {
  app.innerHTML = await RoutinesView();
  // Setup routines handlers after DOM is ready
  setTimeout(() => {
    if (typeof setupRoutinesView === 'function') {
      setupRoutinesView();
    }
  }, 0);
});

router.on('/progress', () => {
  app.innerHTML = ProgressView();
});

router.on('/exercises', async () => {
  app.innerHTML = await ExerciseLibraryView();
  setTimeout(() => {
    if (typeof setupExerciseLibraryView === 'function') {
      setupExerciseLibraryView();
    }
  }, 0);
});

// Create and append bottom navigation
const bottomNav = createBottomNav();
document.body.appendChild(bottomNav);

// Trigger initial route
router.handleRouteChange();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Error al registrar Service Worker:', error);
      });
  });
}
