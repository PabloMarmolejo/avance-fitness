/**
 * Avance Fitness - Bottom Navigation Component
 * 
 * Mobile-style bottom navigation bar
 */

import { navigate } from '../router/router.js';

export function createBottomNav() {
  const navItems = [
    {
      icon: 'home',
      label: 'Inicio',
      path: '/'
    },
    {
      icon: 'book',
      label: 'Ejercicios',
      path: '/exercises'
    },
    {
      icon: 'plus',
      label: 'Quick Log',
      path: '/log',
      isPrimary: true
    },
    {
      icon: 'list',
      label: 'Rutinas',
      path: '/routines'
    },
    {
      icon: 'chart',
      label: 'Progreso',
      path: '/progress'
    }
  ];

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  navItems.forEach(item => {
    const button = document.createElement('button');
    button.className = `nav-item${item.isPrimary ? ' nav-item-primary' : ''}`;
    button.setAttribute('data-route', item.path);
    button.setAttribute('aria-label', item.label);

    button.innerHTML = `
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        ${getIconPath(item.icon)}
      </svg>
      ${!item.isPrimary ? `<span class="nav-label">${item.label}</span>` : ''}
    `;

    button.addEventListener('click', () => {
      navigate(item.path);
    });

    nav.appendChild(button);
  });

  return nav;
}

function getIconPath(icon) {
  const icons = {
    home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />',
    book: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />',
    plus: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />',
    list: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />',
    chart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
  };

  return icons[icon] || icons.home;
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
