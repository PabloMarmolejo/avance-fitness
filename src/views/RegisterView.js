import { authStore } from '../context/authStore';
import { router } from '../router/router';

export function RegisterView() {
    return `
    <div class="container animate-fadeIn" style="max-width: 400px; margin-top: 4rem;">
        <div class="card">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 class="page-title" style="font-size: 2rem;">Crear Cuenta</h1>
                <p class="page-subtitle">Únete y guarda tu progreso en la nube</p>
            </div>

            <form id="register-form" class="flex flex-col gap-md">
                <div class="form-group">
                    <label class="form-label" for="name">Nombre</label>
                    <input type="text" id="name" class="form-input" required placeholder="Tu Nombre">
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">Correo Electrónico</label>
                    <input type="email" id="email" class="form-input" required placeholder="tu@email.com">
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Contraseña</label>
                    <input type="password" id="password" class="form-input" required placeholder="Mínimo 6 caracteres" minlength="6">
                </div>

                <div id="register-error" class="text-error" style="color: var(--color-error); font-size: 0.875rem; display: none;"></div>

                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
                    Registrarse
                </button>
            </form>

            <div style="text-align: center; margin-top: 1.5rem;">
                <p style="font-size: 0.875rem; color: var(--color-text-secondary);">
                    ¿Ya tienes cuenta? <a href="#/login" style="color: var(--color-primary);">Inicia sesión</a>
                </p>
            </div>
        </div>
    </div>
    `;
}

export function setupRegisterView() {
    const form = document.getElementById('register-form');
    const errorDiv = document.getElementById('register-error');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = form.querySelector('button');

            try {
                btn.disabled = true;
                btn.textContent = 'Creando cuenta...';
                errorDiv.style.display = 'none';

                await authStore.register(email, password, name);
                router.navigate('/');
            } catch (error) {
                console.error(error);
                errorDiv.textContent = getErrorMessage(error.code);
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Registrarse';
            }
        });
    }
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Este correo ya está registrado.';
        case 'auth/invalid-email':
            return 'El correo electrónico no es válido.';
        case 'auth/weak-password':
            return 'La contraseña es muy débil. Usa al menos 6 caracteres.';
        default:
            return 'Error al registrarse. Inténtalo de nuevo.';
    }
}
