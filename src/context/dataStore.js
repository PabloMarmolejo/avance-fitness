import { db, auth } from '../firebase/services.js';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    where
} from 'firebase/firestore';
import { authStore } from './authStore.js';

class DataStore {
    constructor() {
        this.state = {
            workouts: [],
            routines: [],
            bodyMetrics: [],
            personalRecords: [],
            photos: [],
            customExercises: [],
            settings: {}
        };

        this.listeners = [];
        this.subscribers = [];
        this.initialized = false;
        this.loading = true;

        // Subscribe to auth changes to init/cleanup
        authStore.subscribe((user) => {
            if (user) {
                this.init(user);
            } else {
                this.cleanup();
            }
        });
    }

    init(user) {
        if (this.initialized) return;

        console.log('🔄 Initializing DataStore real-time listeners...');
        this.loading = true;
        this.notifySubscribers();

        const userId = user.uid;
        const userRef = collection(db, 'users', userId, 'workouts'); // Just to get base path

        // 1. Workouts Listener
        const workoutsQuery = query(
            collection(db, 'users', userId, 'workouts'),
            orderBy('date', 'desc')
            // orderBy('time', 'desc') // Removed to avoid composite index requirement for now
        );

        this.listeners.push(onSnapshot(workoutsQuery, (snapshot) => {
            console.log('📸 Workouts snapshot received!', snapshot.size, 'docs');
            const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server";
            console.log("Source: " + source);
            this.state.workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('Updated workouts state:', this.state.workouts.length);
            this.notifySubscribers('workouts');
        }, (error) => {
            console.error("❌ Error in workouts listener:", error);
        }));

        // 2. Routines Listener
        const routinesQuery = query(
            collection(db, 'users', userId, 'routines'),
            orderBy('name')
        );

        this.listeners.push(onSnapshot(routinesQuery, (snapshot) => {
            this.state.routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.notifySubscribers('routines');
        }));

        // 3. Body Metrics Listener
        const metricsQuery = query(
            collection(db, 'users', userId, 'bodyMetrics'),
            orderBy('date', 'desc')
        );

        this.listeners.push(onSnapshot(metricsQuery, (snapshot) => {
            this.state.bodyMetrics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.notifySubscribers('bodyMetrics');
        }));

        // 4. Personal Records Listener
        const prQuery = query(
            collection(db, 'users', userId, 'personalRecords')
        );

        this.listeners.push(onSnapshot(prQuery, (snapshot) => {
            this.state.personalRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.notifySubscribers('personalRecords');
        }));

        // 5. Photos Listener
        const photosQuery = query(
            collection(db, 'users', userId, 'photos'),
            orderBy('date', 'desc')
        );

        this.listeners.push(onSnapshot(photosQuery, (snapshot) => {
            this.state.photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.notifySubscribers('photos');
        }));

        // 6. Custom Exercises Listener
        const exercisesQuery = query(
            collection(db, 'users', userId, 'customExercises')
        );

        this.listeners.push(onSnapshot(exercisesQuery, (snapshot) => {
            this.state.customExercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.notifySubscribers('customExercises');
        }));

        this.initialized = true;
        this.loading = false;
        console.log('✅ DataStore initialized');
    }

    cleanup() {
        console.log('🧹 Cleaning up DataStore listeners...');
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
        this.state = {
            workouts: [],
            routines: [],
            bodyMetrics: [],
            personalRecords: [],
            photos: [],
            customExercises: [],
            settings: {}
        };
        this.initialized = false;
        this.loading = true;
        this.notifySubscribers();
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        // Immediate callback with current state
        callback(this.state, this.loading);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notifySubscribers(changedCollection = null) {
        this.subscribers.forEach(callback => callback(this.state, this.loading, changedCollection));
    }

    // Getters
    getWorkouts() { return this.state.workouts; }
    getRoutines() { return this.state.routines; }
    getBodyMetrics() { return this.state.bodyMetrics; }
    getLatestBodyMetrics() { return this.state.bodyMetrics[0] || null; }
    getPersonalRecords() { return this.state.personalRecords; }
    getPhotos() { return this.state.photos; }
    getCustomExercises() { return this.state.customExercises; }
}

export const dataStore = new DataStore();
