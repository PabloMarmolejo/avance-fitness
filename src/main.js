import './styles/index.css';
// import { initDB } from './db/database.js';
import { initializeDefaultSettings, getSetting } from './db/models.js';
import { loadInitialExercises } from './db/exerciseLibraryModels.js';
import { router } from './router/router.js';
import { createBottomNav, updateActiveNav } from './components/BottomNav.js';
import { DashboardView, setupDashboardView } from './views/Dashboard.js';
import { WorkoutView, setupWorkoutView } from './views/WorkoutView.js';
import { LogView, setupLogView } from './views/LogView.js';
import { RoutinesView, setupRoutinesView } from './views/RoutinesView.js';
import { ProgressView, setupProgressView } from './views/ProgressView.js';
import { ExerciseLibraryView, setupExerciseLibraryView } from './views/ExerciseLibraryView.js';
import { LoginView, setupLoginView } from './views/LoginView.js';
import { RegisterView, setupRegisterView } from './views/RegisterView.js';
import { ProfileView, setupProfileView } from './views/ProfileView.js';
import { authStore } from './context/authStore.js';

console.log('Script loaded');

// App initialization
async function initApp() {
  console.log('🚀 Starting App Initialization...');
  try {
    // await initDB();
    await initializeDefaultSettings();
    const theme = await getSetting('theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    console.log('Loading initial exercises...');
    await loadInitialExercises();
    console.log('✅ App inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
  }
}

console.log('Calling initApp...');
initApp();

// Get app container
const app = document.querySelector('#app');

// Auth Guard
router.beforeEach(async (to, from) => {
  console.log(`Navigating to ${to} from ${from}`);
  const publicPaths = ['/login', '/register'];
  const isAuthenticated = authStore.isAuthenticated();

  // Wait for auth to load if it's the first load
  if (authStore.loading) {
    console.log('Auth loading, waiting...');
    return new Promise(resolve => {
      const unsubscribe = authStore.subscribe((user, loading) => {
        if (!loading) {
          unsubscribe();
          const isAuth = !!user;
          console.log('Auth loaded. User:', user ? user.uid : 'null');
          if (!isAuth && !publicPaths.includes(to)) {
            console.log('Redirecting to login');
            router.navigate('/login');
            resolve(false);
          } else if (isAuth && publicPaths.includes(to)) {
            console.log('Redirecting to home');
            router.navigate('/');
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
    });
  }

  if (!isAuthenticated && !publicPaths.includes(to)) {
    router.navigate('/login');
    return false;
  }

  if (isAuthenticated && publicPaths.includes(to)) {
    router.navigate('/');
    return false;
  }

  return true;
});

// Setup routes
router.on('/', () => {
  console.log('Rendering Dashboard');
  app.innerHTML = DashboardView();
  setTimeout(() => setupDashboardView(), 0);
});

router.on('/login', () => {
  console.log('Rendering Login');
  app.innerHTML = LoginView();
  setTimeout(() => setupLoginView(), 0);
});

router.on('/register', () => {
  app.innerHTML = RegisterView();
  setTimeout(() => setupRegisterView(), 0);
});

router.on('/profile', () => {
  app.innerHTML = ProfileView();
  setTimeout(() => setupProfileView(), 0);
});

router.on('/workout', async () => {
  app.innerHTML = await WorkoutView();
  setTimeout(() => {
    if (typeof setupWorkoutView === 'function') {
      setupWorkoutView();
    }
  }, 0);
});

router.on('/log', () => {
  console.log('Rendering LogView');
  app.innerHTML = LogView();
  // Setup form handlers after DOM is ready
  setTimeout(() => {
    if (typeof setupLogView === 'function') {
      setupLogView();
    }
  }, 0);
});

router.on('/routines', () => {
  app.innerHTML = RoutinesView();
  // Setup routines handlers after DOM is ready
  setTimeout(() => {
    if (typeof setupRoutinesView === 'function') {
      setupRoutinesView();
    }
  }, 0);
});

router.on('/progress', () => {
  app.innerHTML = ProgressView();
  setTimeout(() => {
    if (typeof setupProgressView === 'function') {
      setupProgressView();
    }
  }, 0);
});

router.on('/exercises', () => {
  app.innerHTML = ExerciseLibraryView();
  setTimeout(() => {
    if (typeof setupExerciseLibraryView === 'function') {
      setupExerciseLibraryView();
    }
  }, 0);
});

// Create and append bottom navigation
const bottomNav = createBottomNav();
document.body.appendChild(bottomNav);

// Handle bottom nav visibility
const handleNavVisibility = () => {
  const currentPath = router.getCurrentPath();
  const hiddenPaths = ['/login', '/register'];

  if (hiddenPaths.includes(currentPath)) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
    updateActiveNav(currentPath);
  }
};

window.addEventListener('hashchange', handleNavVisibility);
// Initial check
handleNavVisibility();

// Trigger initial route
console.log('Triggering initial route...');
router.handleRouteChange();
