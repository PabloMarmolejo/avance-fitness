/**
 * Avance Fitness - Bottom Navigation Component
 * 
 * Mobile-style bottom navigation bar
 */

import { navigate } from '../router/router.js';

export function createBottomNav() {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.innerHTML = `
    <button class="nav-item" data-route="/" aria-label="Dashboard">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span class="nav-label">Inicio</span>
    </button>

    <button class="nav-item" data-route="/workout" aria-label="Log Workout">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="3"></circle>
        <path d="M12 11v10M9 14h6M9 18h6"></path>
      </svg>
      <span class="nav-label">Entrenar</span>
    </button>

    <button class="nav-item nav-item-primary" data-route="/log" aria-label="Quick Log">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <button class="nav-item" data-route="/routines" aria-label="Routines">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="9" y1="15" x2="15" y2="15"></line>
        <line x1="9" y1="11" x2="15" y2="11"></line>
      </svg>
      <span class="nav-label">Rutinas</span>
    </button>

    <button class="nav-item" data-route="/progress" aria-label="Progress">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span class="nav-label">Progreso</span>
    </button>
  `;

    // Add click handlers
    const navItems = nav.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const route = item.getAttribute('data-route');
            navigate(route);
        });
    });

    return nav;
}

/**
 * Update active nav item
 */
export function updateActiveNav(currentRoute) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const route = item.getAttribute('data-route');
        if (route === currentRoute) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
