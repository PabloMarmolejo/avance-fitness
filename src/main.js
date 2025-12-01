import './styles/index.css';
import { initDB } from './db/database.js';
import { initializeDefaultSettings } from './db/models.js';
import { router } from './router/router.js';
import { createBottomNav } from './components/BottomNav.js';
import { DashboardView } from './views/Dashboard.js';
import { WorkoutView } from './views/WorkoutView.js';
import { LogView } from './views/LogView.js';
import { RoutinesView } from './views/RoutinesView.js';
import { ProgressView } from './views/ProgressView.js';

// App entry point
console.log('🏋️ Avance Fitness - Iniciando aplicación...');

// Initialize IndexedDB
async function initApp() {
  try {
    await initDB();
    await initializeDefaultSettings();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
  }
}

// Initialize app
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
});

router.on('/routines', () => {
  app.innerHTML = RoutinesView();
});

router.on('/progress', () => {
  app.innerHTML = ProgressView();
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
