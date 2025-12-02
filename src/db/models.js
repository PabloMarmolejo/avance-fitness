/**
 * Avance Fitness - Data Models
 * 
 * CRUD operations for all entities in the app
 */

import {
    addData,
    getData,
    getAllData,
    updateData,
    deleteData,
    getByIndex,
    clearStore
} from './database.js';

export {
    addData,
    getData,
    getAllData,
    updateData,
    deleteData,
    getByIndex,
    clearStore
};

// ============================================
// WORKOUT OPERATIONS
// ============================================

/**
 * Create a new workout
 * @param {Object} workout - { date, time, type, duration, notes }
 * @returns {Promise<number>} workout ID
 */
export async function createWorkout(workout) {
    const workoutData = {
        date: workout.date || new Date().toISOString().split('T')[0],
        time: workout.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: workout.type, // 'Fuerza', 'Cardio', 'Funcional', 'HIIT', etc.
        duration: workout.duration || 0, // en minutos
        notes: workout.notes || '',
        createdAt: new Date().toISOString()
    };
    return await addData('workouts', workoutData);
}

/**
 * Get workout by ID
 */
export async function getWorkout(id) {
    return await getData('workouts', id);
}

/**
 * Get all workouts
 */
export async function getAllWorkouts() {
    const workouts = await getAllData('workouts');
    // Ordenar por fecha y hora descendente (más reciente primero)
    return workouts.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateB - dateA;
    });
}

/**
 * Get workouts by date range
 */
export async function getWorkoutsByDateRange(startDate, endDate) {
    const allWorkouts = await getAllWorkouts();
    return allWorkouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= new Date(startDate) && workoutDate <= new Date(endDate);
    });
}

/**
 * Get workouts by type
 */
export async function getWorkoutsByType(type) {
    return await getByIndex('workouts', 'type', type);
}

/**
 * Update workout
 */
export async function updateWorkout(workout) {
    return await updateData('workouts', workout);
}

/**
 * Delete workout (and its exercises)
 */
export async function deleteWorkout(id) {
    // Delete associated exercises first
    const exercises = await getExercisesByWorkout(id);
    for (const exercise of exercises) {
        await deleteData('exercises', exercise.id);
    }
    // Delete workout
    return await deleteData('workouts', id);
}

// ============================================
// EXERCISE OPERATIONS
// ============================================

/**
 * Add exercise to workout
 * @param {Object} exercise - { workoutId, name, type, sets, reps, weight, duration, speed, incline, distance }
 */
export async function addExercise(exercise) {
    const exerciseData = {
        workoutId: exercise.workoutId,
        name: exercise.name,
        type: exercise.type, // 'strength' or 'cardio'
        // For strength exercises
        sets: exercise.sets || [],
        // For cardio exercises
        duration: exercise.duration || 0,
        speed: exercise.speed || 0,
        incline: exercise.incline || 0,
        distance: exercise.distance || 0,
        createdAt: new Date().toISOString()
    };
    return await addData('exercises', exerciseData);
}

/**
 * Get exercises by workout ID
 */
export async function getExercisesByWorkout(workoutId) {
    return await getByIndex('exercises', 'workoutId', workoutId);
}

/**
 * Get all exercises by name (for autocomplete)
 */
export async function getAllExerciseNames() {
    const exercises = await getAllData('exercises');
    const uniqueNames = [...new Set(exercises.map(e => e.name))];
    return uniqueNames.sort();
}

/**
 * Update exercise
 */
export async function updateExercise(exercise) {
    return await updateData('exercises', exercise);
}

/**
 * Delete exercise
 */
export async function deleteExercise(id) {
    return await deleteData('exercises', id);
}

// ============================================
// ROUTINE OPERATIONS
// ============================================

/**
 * Create routine
 * @param {Object} routine - { name, description, exercises: [{name, type, sets, reps, weight}] }
 */
export async function createRoutine(routine) {
    const routineData = {
        name: routine.name,
        description: routine.description || '',
        exercises: routine.exercises || [],
        createdAt: new Date().toISOString()
    };
    return await addData('routines', routineData);
}

/**
 * Get routine by ID
 */
export async function getRoutine(id) {
    return await getData('routines', id);
}

/**
 * Get all routines
 */
export async function getAllRoutines() {
    return await getAllData('routines');
}

/**
 * Update routine
 */
export async function updateRoutine(routine) {
    return await updateData('routines', routine);
}

/**
 * Delete routine
 */
export async function deleteRoutine(id) {
    return await deleteData('routines', id);
}

/**
 * Start workout from routine
 * Creates a new workout with the routine's exercises
 */
export async function startWorkoutFromRoutine(routineId) {
    const routine = await getRoutine(routineId);
    if (!routine) throw new Error('Routine not found');

    // Create workout
    const workoutId = await createWorkout({
        type: 'Rutina: ' + routine.name,
        duration: 0,
        notes: `Iniciado desde rutina: ${routine.name}`
    });

    // Add exercises from routine
    for (const exercise of routine.exercises) {
        await addExercise({
            workoutId,
            ...exercise
        });
    }

    return workoutId;
}

// ============================================
// BODY METRICS OPERATIONS
// ============================================

/**
 * Add body metrics
 * @param {Object} metrics - { date, weight, bmi, bodyFat, measurements: {chest, waist, arms, legs} }
 */
export async function addBodyMetrics(metrics) {
    const metricsData = {
        date: metrics.date || new Date().toISOString().split('T')[0],
        weight: metrics.weight || 0,
        bmi: metrics.bmi || 0,
        bodyFat: metrics.bodyFat || 0,
        measurements: metrics.measurements || {
            chest: 0,
            waist: 0,
            arms: 0,
            legs: 0
        },
        createdAt: new Date().toISOString()
    };
    return await addData('bodyMetrics', metricsData);
}

/**
 * Get all body metrics
 */
export async function getAllBodyMetrics() {
    const metrics = await getAllData('bodyMetrics');
    return metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get latest body metrics
 */
export async function getLatestBodyMetrics() {
    const all = await getAllBodyMetrics();
    return all[0] || null;
}

/**
 * Update body metrics
 */
export async function updateBodyMetrics(metrics) {
    return await updateData('bodyMetrics', metrics);
}

/**
 * Delete body metrics
 */
export async function deleteBodyMetrics(id) {
    return await deleteData('bodyMetrics', id);
}

// ============================================
// PHOTO OPERATIONS
// ============================================

/**
 * Add progress photo
 * @param {Object} photo - { date, imageData (base64), notes }
 */
export async function addProgressPhoto(photo) {
    const photoData = {
        date: photo.date || new Date().toISOString().split('T')[0],
        imageData: photo.imageData, // base64 string
        notes: photo.notes || '',
        createdAt: new Date().toISOString()
    };
    return await addData('photos', photoData);
}

/**
 * Get all progress photos
 */
export async function getAllProgressPhotos() {
    const photos = await getAllData('photos');
    return photos.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get photo by ID
 */
export async function getProgressPhoto(id) {
    return await getData('photos', id);
}

/**
 * Update photo
 */
export async function updateProgressPhoto(photo) {
    return await updateData('photos', photo);
}

/**
 * Delete photo
 */
export async function deleteProgressPhoto(id) {
    return await deleteData('photos', id);
}

// ============================================
// PERSONAL RECORDS OPERATIONS
// ============================================

/**
 * Add or update personal record
 * @param {Object} pr - { exerciseName, type ('weight' or 'reps'), value, date }
 */
export async function addPersonalRecord(pr) {
    const prData = {
        exerciseName: pr.exerciseName,
        type: pr.type, // 'weight', 'reps', 'distance', 'time'
        value: pr.value,
        date: pr.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    return await addData('personalRecords', prData);
}

/**
 * Get all personal records
 */
export async function getAllPersonalRecords() {
    return await getAllData('personalRecords');
}

/**
 * Get PRs by exercise name
 */
export async function getPersonalRecordsByExercise(exerciseName) {
    return await getByIndex('personalRecords', 'exerciseName', exerciseName);
}

/**
 * Check and update PR automatically
 * Called after saving a workout to detect new records
 */
export async function checkAndUpdatePR(exerciseName, type, value) {
    const existingPRs = await getPersonalRecordsByExercise(exerciseName);
    const samePRs = existingPRs.filter(pr => pr.type === type);

    if (samePRs.length === 0) {
        // First PR for this exercise/type
        await addPersonalRecord({ exerciseName, type, value });
        return { isNewPR: true, improvement: value };
    }

    const maxPR = Math.max(...samePRs.map(pr => pr.value));
    if (value > maxPR) {
        // New PR!
        await addPersonalRecord({ exerciseName, type, value });
        return { isNewPR: true, improvement: value - maxPR };
    }

    return { isNewPR: false };
}

/**
 * Delete personal record
 */
export async function deletePersonalRecord(id) {
    return await deleteData('personalRecords', id);
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Get setting by key
 */
export async function getSetting(key) {
    return await getData('settings', key);
}

/**
 * Set setting
 */
export async function setSetting(key, value) {
    return await updateData('settings', { key, value });
}

/**
 * Get all settings
 */
export async function getAllSettings() {
    const settings = await getAllData('settings');
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
}

/**
 * Initialize default settings
 */
export async function initializeDefaultSettings() {
    const defaults = {
        theme: 'dark',
        units: 'metric', // 'metric' or 'imperial'
        weightUnit: 'kg',
        distanceUnit: 'km'
    };

    for (const [key, value] of Object.entries(defaults)) {
        const existing = await getSetting(key);
        if (!existing) {
            await setSetting(key, value);
        }
    }
}

// ============================================
// DATA EXPORT/IMPORT
// ============================================

/**
 * Export all data as JSON
 */
export async function exportAllData() {
    const data = {
        workouts: await getAllWorkouts(),
        exercises: await getAllData('exercises'),
        routines: await getAllRoutines(),
        bodyMetrics: await getAllBodyMetrics(),
        photos: await getAllProgressPhotos(),
        personalRecords: await getAllPersonalRecords(),
        settings: await getAllSettings(),
        exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 * WARNING: This will clear all existing data
 */
export async function importData(jsonData) {
    const data = JSON.parse(jsonData);

    // Clear all stores
    await clearStore('workouts');
    await clearStore('exercises');
    await clearStore('routines');
    await clearStore('bodyMetrics');
    await clearStore('photos');
    await clearStore('personalRecords');
    await clearStore('settings');

    // Import data
    for (const workout of data.workouts || []) {
        await addData('workouts', workout);
    }
    for (const exercise of data.exercises || []) {
        await addData('exercises', exercise);
    }
    for (const routine of data.routines || []) {
        await addData('routines', routine);
    }
    for (const metrics of data.bodyMetrics || []) {
        await addData('bodyMetrics', metrics);
    }
    for (const photo of data.photos || []) {
        await addData('photos', photo);
    }
    for (const pr of data.personalRecords || []) {
        await addData('personalRecords', pr);
    }

    // Import settings
    if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
            await setSetting(key, value);
        }
    }

    console.log('✅ Datos importados correctamente');
}
