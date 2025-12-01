/**
 * Exercise Library Models - CRUD operations for pre-loaded exercises
 */

import { addData, getData, getAllData, updateData, deleteData, getByIndex } from './database.js';
import { EXERCISES_DATABASE } from './exerciseLibrary.js';

const STORE_NAME = 'exerciseLibrary';

/**
 * Load initial exercises into database (first time only)
 * @returns {Promise<void>}
 */
export async function loadInitialExercises() {
    const existing = await getAllExerciseLibrary();

    // Check if we need to update:
    // 1. Empty database
    // 2. Different count of default exercises
    // 3. Old 'arms' category exists
    // 4. Duplicates exist (simple check: count > expected + custom)
    const customExercises = existing.filter(ex => ex.isCustom);
    const defaultExercises = existing.filter(ex => !ex.isCustom);
    const hasOldCategories = existing.some(ex => ex.category === 'arms');
    const hasDuplicates = defaultExercises.length > EXERCISES_DATABASE.length;

    if (existing.length === 0 || defaultExercises.length !== EXERCISES_DATABASE.length || hasOldCategories || hasDuplicates) {
        console.log('📚 Reconstruyendo biblioteca de ejercicios...');

        // 1. Delete ALL existing exercises
        if (existing.length > 0) {
            for (const ex of existing) {
                await deleteData(STORE_NAME, ex.id);
            }
        }

        // 2. Restore custom exercises
        for (const ex of customExercises) {
            // Remove ID to let DB assign a new one and avoid conflicts
            const { id, ...exerciseData } = ex;
            await addData(STORE_NAME, exerciseData);
        }

        // 3. Load new default exercises
        for (const exercise of EXERCISES_DATABASE) {
            await addData(STORE_NAME, exercise);
        }
        console.log(`✅ Biblioteca actualizada: ${EXERCISES_DATABASE.length} ejercicios base cargados`);
    }
}

/**
 * Get all exercises from library
 * @returns {Promise<Array>}
 */
export async function getAllExerciseLibrary() {
    return await getAllData(STORE_NAME);
}

/**
 * Get exercise by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getExerciseFromLibrary(id) {
    return await getData(STORE_NAME, id);
}

/**
 * Get exercises by category
 * @param {string} category
 * @returns {Promise<Array>}
 */
export async function getExercisesByCategory(category) {
    return await getByIndex(STORE_NAME, 'category', category);
}

/**
 * Search exercises by name
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchExercises(query) {
    const allExercises = await getAllExerciseLibrary();
    const lowerQuery = query.toLowerCase();

    return allExercises.filter(ex =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.description.toLowerCase().includes(lowerQuery) ||
        ex.musclesWorked.primary.some(m => m.toLowerCase().includes(lowerQuery)) ||
        ex.musclesWorked.secondary.some(m => m.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Add custom exercise to library
 * @param {object} exerciseData
 * @returns {Promise<number>}
 */
export async function addCustomExercise(exerciseData) {
    const exercise = {
        ...exerciseData,
        isCustom: true,
        createdAt: new Date().toISOString()
    };
    return await addData(STORE_NAME, exercise);
}

/**
 * Update exercise in library
 * @param {object} exercise
 * @returns {Promise<number>}
 */
export async function updateExerciseInLibrary(exercise) {
    return await updateData(STORE_NAME, exercise);
}

/**
 * Delete exercise from library (only custom ones)
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteExerciseFromLibrary(id) {
    const exercise = await getExerciseFromLibrary(id);
    if (exercise && exercise.isCustom) {
        return await deleteData(STORE_NAME, id);
    }
    throw new Error('Solo puedes eliminar ejercicios personalizados');
}
