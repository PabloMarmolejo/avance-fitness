/**
 * Exercise Library Models - CRUD operations for exercises
 * Uses static list for defaults + Firestore for custom user exercises
 */

import { db, auth } from '../firebase/services';
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query
} from 'firebase/firestore';
import { EXERCISES_DATABASE } from './exerciseLibrary.js';

// Helper to get user-specific collection reference
const getUserCollection = (collectionName) => {
    const user = auth.currentUser;
    if (!user) return null; // Return null if not auth, handle gracefully
    return collection(db, 'users', user.uid, collectionName);
};

const docToObj = (doc) => ({ id: doc.id, ...doc.data() });

/**
 * Load initial exercises
 * No longer needed to store defaults in DB, we use the static list.
 * Kept for compatibility but does nothing or just logs.
 */
export async function loadInitialExercises() {
    console.log('📚 Biblioteca de ejercicios lista (Modo Híbrido: Estático + Nube)');
}

/**
 * Get all exercises from library (Defaults + Custom)
 * @returns {Promise<Array>}
 */
export async function getAllExerciseLibrary() {
    // 1. Get default exercises
    const defaults = [...EXERCISES_DATABASE];

    // 2. Get custom exercises from Firestore
    let custom = [];
    try {
        const colRef = getUserCollection('customExercises');
        if (colRef) {
            const snapshot = await getDocs(query(colRef));
            custom = snapshot.docs.map(docToObj);
        }
    } catch (error) {
        console.warn('Could not load custom exercises (user might be offline or not logged in)', error);
    }

    return [...defaults, ...custom];
}

/**
 * Get exercise by ID
 */
export async function getExerciseFromLibrary(id) {
    const all = await getAllExerciseLibrary();
    return all.find(ex => ex.id === id || ex.id == id); // Handle string/number ID mismatch
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(category) {
    const all = await getAllExerciseLibrary();
    return all.filter(ex => ex.category === category);
}

/**
 * Search exercises by name
 */
export async function searchExercises(query) {
    const allExercises = await getAllExerciseLibrary();
    const lowerQuery = query.toLowerCase();

    return allExercises.filter(ex =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        (ex.description && ex.description.toLowerCase().includes(lowerQuery)) ||
        (ex.musclesWorked && ex.musclesWorked.primary.some(m => m.toLowerCase().includes(lowerQuery))) ||
        (ex.musclesWorked && ex.musclesWorked.secondary.some(m => m.toLowerCase().includes(lowerQuery)))
    );
}

/**
 * Add custom exercise to library
 */
export async function addCustomExercise(exerciseData) {
    const colRef = getUserCollection('customExercises');
    if (!colRef) throw new Error('Debes iniciar sesión para crear ejercicios');

    const exercise = {
        ...exerciseData,
        isCustom: true,
        createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(colRef, exercise);
    return docRef.id;
}

/**
 * Update exercise in library
 */
export async function updateExerciseInLibrary(exercise) {
    if (!exercise.isCustom) {
        throw new Error('No puedes editar ejercicios predeterminados');
    }

    const { id, ...data } = exercise;
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'customExercises', id);
    await updateDoc(docRef, data);
    return id;
}

/**
 * Delete exercise from library (only custom ones)
 */
export async function deleteExerciseFromLibrary(id) {
    const exercise = await getExerciseFromLibrary(id);
    if (!exercise) throw new Error('Ejercicio no encontrado');

    if (exercise.isCustom) {
        const user = auth.currentUser;
        const docRef = doc(db, 'users', user.uid, 'customExercises', id);
        await deleteDoc(docRef);
    } else {
        throw new Error('Solo puedes eliminar ejercicios personalizados');
    }
}
