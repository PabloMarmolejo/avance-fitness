import './styles/index.css';

// App entry point
console.log('🏋️ Avance Fitness - Iniciando aplicación...');

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
