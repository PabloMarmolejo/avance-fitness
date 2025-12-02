import { authStore } from '../context/authStore';
import { router } from '../router/router';

export function LoginView() {
    return `
    <div class="container animate-fadeIn" style="max-width: 400px; margin-top: 4rem;">
        <div class="card">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 class="page-title" style="font-size: 2rem;">Bienvenido</h1>
                <p class="page-subtitle">Inicia sesión para sincronizar tu progreso</p>
            </div>

            <form id="login-form" class="flex flex-col gap-md">
                <div class="form-group">
                    <label class="form-label" for="email">Correo Electrónico</label>
                    <input type="email" id="email" class="form-input" required placeholder="tu@email.com">
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Contraseña</label>
                    <input type="password" id="password" class="form-input" required placeholder="••••••••">
                </div>

                <div id="login-error" class="text-error" style="color: var(--color-error); font-size: 0.875rem; display: none;"></div>

                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                    Iniciar Sesión
                </button>
            </form>

            <div style="text-align: center; margin-top: 1.5rem;">
                <p style="font-size: 0.875rem; color: var(--color-text-secondary);">
                    ¿No tienes cuenta? <a href="#/register" style="color: var(--color-primary);">Regístrate aquí</a>
                </p>
            </div>
        </div>
    </div>
    `;
}

export function setupLoginView() {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = form.querySelector('button');

            try {
                btn.disabled = true;
                btn.textContent = 'Iniciando...';
                errorDiv.style.display = 'none';

                await authStore.login(email, password);
                router.navigate('/');
            } catch (error) {
                console.error(error);
                errorDiv.textContent = getErrorMessage(error.code);
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            }
        });
    }
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email':
            return 'El correo electrónico no es válido.';
        case 'auth/user-disabled':
            return 'Este usuario ha sido deshabilitado.';
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta.';
        case 'auth/invalid-credential':
            return 'Credenciales inválidas.';
        default:
            return 'Error al iniciar sesión. Inténtalo de nuevo.';
    }
}
