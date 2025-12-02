import { authStore } from '../context/authStore';
import { router } from '../router/router';

export function ProfileView() {
    const user = authStore.getCurrentUser();

    return `
    <div class="container animate-fadeIn" style="padding-top: 2rem;">
        <div class="page-header">
            <h1 class="page-title">Perfil</h1>
            <p class="page-subtitle">Gestiona tu cuenta</p>
        </div>

        <div class="card" style="margin-bottom: 2rem;">
            <div class="flex items-center gap-md" style="margin-bottom: 1.5rem;">
                <div style="width: 60px; height: 60px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                    ${user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div>
                    <h2 style="font-size: 1.25rem; margin-bottom: 0.25rem;">${user?.displayName || 'Usuario'}</h2>
                    <p style="color: var(--color-text-secondary); font-size: 0.875rem;">${user?.email}</p>
                </div>
            </div>

            <div class="flex flex-col gap-md">
                <button id="sync-btn" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
                    <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sincronizar Datos
                </button>
                
                <button id="logout-btn" class="btn btn-secondary" style="width: 100%; justify-content: flex-start; color: var(--color-error); border-color: rgba(239, 68, 68, 0.3);">
                    <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="btn btn-secondary btn-sm" onclick="window.history.back()">
                Volver
            </button>
        </div>
    </div>
    `;
}

export function setupProfileView() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                await authStore.logout();
            }
        });
    }

    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            alert('La sincronización automática está activada.');
        });
    }
}
