/**
 * Avance Fitness - Router
 * 
 * Simple hash-based SPA router for navigation
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.beforeRouteChange = null;

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    /**
     * Register a route
     * @param {string} path - Route path (e.g., '/dashboard', '/workout')
     * @param {function} handler - Function to execute when route is accessed
     */
    on(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navigate to a route
     * @param {string} path - Route path
     */
    navigate(path) {
        window.location.hash = path;
    }

    /**
     * Get current route path
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1) || '/';
        return hash.split('?')[0];
    }

    /**
     * Get route parameters (for routes like /workout/:id)
     */
    getParams() {
        const hash = this.getCurrentPath();
        const parts = hash.split('/');
        return parts;
    }

    /**
     * Set a middleware function to run before route changes
     */
    beforeEach(callback) {
        this.beforeRouteChange = callback;
    }

    /**
     * Handle route change
     */
    async handleRouteChange() {
        const path = this.getCurrentPath();

        // Run before route change middleware
        if (this.beforeRouteChange) {
            const canContinue = await this.beforeRouteChange(path, this.currentRoute);
            if (canContinue === false) {
                // Prevent navigation
                return;
            }
        }

        // Find matching route
        let handler = this.routes[path];

        // If exact match not found, try to find with parameters
        if (!handler) {
            for (const route in this.routes) {
                if (this.matchRoute(route, path)) {
                    handler = this.routes[route];
                    break;
                }
            }
        }

        // Execute route handler or show 404
        if (handler) {
            this.currentRoute = path;
            handler();
            this.updateActiveNav();
        } else {
            // Default fallback (dashboard)
            if (this.routes['/']) {
                this.routes['/']();
                this.updateActiveNav();
            } else {
                console.warn(`No route found for: ${path}`);
            }
        }
    }

    /**
     * Match route with parameters (basic implementation)
     */
    matchRoute(routePattern, actualPath) {
        const routeParts = routePattern.split('/');
        const pathParts = actualPath.split('/');

        if (routeParts.length !== pathParts.length) {
            return false;
        }

        return routeParts.every((part, i) => {
            return part.startsWith(':') || part === pathParts[i];
        });
    }

    /**
     * Update active state in navigation
     */
    updateActiveNav() {
        const currentPath = this.getCurrentPath();
        const navLinks = document.querySelectorAll('[data-route]');

        navLinks.forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Go back in history
     */
    back() {
        window.history.back();
    }
}

// Create and export router instance
export const router = new Router();

// Export navigate function for convenience
export function navigate(path) {
    router.navigate(path);
}

// Export current route getter
export function getCurrentRoute() {
    return router.getCurrentPath();
}
