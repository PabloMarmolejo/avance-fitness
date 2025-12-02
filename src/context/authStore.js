import { auth } from '../firebase/services';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { router } from '../router/router';
import { initializeDefaultSettings } from '../db/models.js';

class AuthStore {
    constructor() {
        this.currentUser = null;
        this.loading = true;
        this.listeners = [];

        // Initialize listener
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            this.loading = false;

            if (user) {
                // Don't await this, let it run in background so we don't block UI
                initializeDefaultSettings().catch(error => {
                    console.error('Error initializing settings:', error);
                });
            }

            this.notifyListeners();

            // Redirect to login if not authenticated and not in public pages
            const currentPath = router.getCurrentPath();
            const publicPaths = ['/login', '/register'];

            if (!user && !publicPaths.includes(currentPath)) {
                router.navigate('/login');
            } else if (user && publicPaths.includes(currentPath)) {
                router.navigate('/');
            }
        });
    }

    /**
     * Subscribe to auth state changes
     * @param {Function} callback 
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.currentUser, this.loading);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentUser, this.loading));
    }

    async register(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(auth);
            router.navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

export const authStore = new AuthStore();
