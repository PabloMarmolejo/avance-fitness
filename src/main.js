import './styles/index.css';
import { initDB } from './db/database.js';
import { initializeDefaultSettings } from './db/models.js';

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

// Main app container
const app = document.querySelector('#app');

// Temporary landing page
app.innerHTML = `
  <div class="landing">
    <div class="landing-content">
      <h1>💪 Avance Fitness</h1>
      <p>Tu aplicación para registrar entrenamientos y progreso</p>
      <div class="status">
        <span class="status-badge">✅ Proyecto inicializado</span>
        <span class="status-badge">✅ Base de datos configurada</span>
        <span class="status-badge">⏳ En desarrollo</span>
      </div>
    </div>
  </div>
`;

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
