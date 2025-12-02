/**
 * Avance Fitness - Data Models (Firestore Version)
 * 
 * CRUD operations using Firebase Firestore and Storage
 */

import { db, auth, storage } from '../firebase/services';
import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    uploadString,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

// Helper to get user-specific collection reference
const getUserCollection = (collectionName) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return collection(db, 'users', user.uid, collectionName);
};

// Helper to convert Firestore doc to object with ID
const docToObj = (doc) => ({ id: doc.id, ...doc.data() });

// ============================================
// WORKOUT OPERATIONS
// ============================================

export async function createWorkout(workout) {
    const workoutData = {
        date: workout.date || new Date().toISOString().split('T')[0],
        time: workout.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: workout.type,
        duration: workout.duration || 0,
        notes: workout.notes || '',
        createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(getUserCollection('workouts'), workoutData);
    return docRef.id;
}

export async function getWorkout(id) {
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, 'users', user.uid, 'workouts', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToObj(docSnap) : null;
}

export async function getAllWorkouts() {
    try {
        const q = query(getUserCollection('workouts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToObj);
    } catch (error) {
        console.error("Error getting workouts:", error);
        return [];
    }
}

export async function getWorkoutsByDateRange(startDate, endDate) {
    const q = query(
        getUserCollection('workouts'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function getWorkoutsByType(type) {
    const q = query(getUserCollection('workouts'), where('type', '==', type), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function updateWorkout(workout) {
    const { id, ...data } = workout;
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'workouts', id);
    await updateDoc(docRef, data);
    return id;
}

export async function deleteWorkout(id) {
    console.log('🔥 deleteWorkout called for ID:', id);
    const user = auth.currentUser;
    if (!user) {
        console.error('❌ No authenticated user found in deleteWorkout');
        throw new Error('User not authenticated');
    }

    try {
        // Delete associated exercises first
        console.log('🔍 Fetching associated exercises...');
        const exercises = await getExercisesByWorkout(id);
        console.log(`Found ${exercises.length} exercises to delete`);

        const batch = writeBatch(db);

        exercises.forEach(ex => {
            const exRef = doc(db, 'users', user.uid, 'exercises', ex.id);
            batch.delete(exRef);
        });

        // Delete workout
        console.log('🗑️ Deleting workout doc...');
        const workoutRef = doc(db, 'users', user.uid, 'workouts', id);
        batch.delete(workoutRef);

        console.log('💾 Committing batch...');
        await batch.commit();
        console.log('✅ deleteWorkout completed successfully');
    } catch (error) {
        console.error('❌ Error in deleteWorkout:', error);
        throw error;
    }
}

// ============================================
// EXERCISE OPERATIONS
// ============================================

export async function addExercise(exercise) {
    const exerciseData = {
        workoutId: exercise.workoutId,
        name: exercise.name,
        type: exercise.type,
        sets: exercise.sets || [],
        duration: exercise.duration || 0,
        speed: exercise.speed || 0,
        incline: exercise.incline || 0,
        distance: exercise.distance || 0,
        createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(getUserCollection('exercises'), exerciseData);
    return docRef.id;
}

export async function getExercisesByWorkout(workoutId) {
    const q = query(getUserCollection('exercises'), where('workoutId', '==', workoutId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function getAllExerciseNames() {
    const q = query(getUserCollection('exercises'));
    const querySnapshot = await getDocs(q);
    const exercises = querySnapshot.docs.map(docToObj);
    const uniqueNames = [...new Set(exercises.map(e => e.name))];
    return uniqueNames.sort();
}

export async function getAllExercises() {
    const q = query(getUserCollection('exercises'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function updateExercise(exercise) {
    const { id, ...data } = exercise;
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'exercises', id);
    await updateDoc(docRef, data);
    return id;
}

export async function deleteExercise(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'exercises', id);
    await deleteDoc(docRef);
}

// ============================================
// ROUTINE OPERATIONS
// ============================================

export async function createRoutine(routine) {
    const routineData = {
        name: routine.name,
        description: routine.description || '',
        exercises: routine.exercises || [],
        createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(getUserCollection('routines'), routineData);
    return docRef.id;
}

export async function getRoutine(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'routines', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToObj(docSnap) : null;
}

export async function getAllRoutines() {
    const q = query(getUserCollection('routines'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function updateRoutine(routine) {
    const { id, ...data } = routine;
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'routines', id);
    await updateDoc(docRef, data);
    return id;
}

export async function deleteRoutine(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'routines', id);
    await deleteDoc(docRef);
}

export async function startWorkoutFromRoutine(routineId) {
    const routine = await getRoutine(routineId);
    if (!routine) throw new Error('Routine not found');

    const workoutId = await createWorkout({
        type: 'Rutina: ' + routine.name,
        duration: 0,
        notes: `Iniciado desde rutina: ${routine.name}`
    });

    // Batch add exercises? Firestore batch limit is 500, should be fine.
    const batch = writeBatch(db);
    const user = auth.currentUser;

    for (const exercise of routine.exercises) {
        const newExRef = doc(collection(db, 'users', user.uid, 'exercises'));
        batch.set(newExRef, {
            workoutId,
            ...exercise,
            createdAt: new Date().toISOString()
        });
    }

    await batch.commit();
    return workoutId;
}

// ============================================
// BODY METRICS OPERATIONS
// ============================================

export async function addBodyMetrics(metrics) {
    const metricsData = {
        date: metrics.date || new Date().toISOString().split('T')[0],
        weight: metrics.weight || 0,
        bmi: metrics.bmi || 0,
        bodyFat: metrics.bodyFat || 0,
        measurements: metrics.measurements || {
            chest: 0, waist: 0, arms: 0, legs: 0
        },
        createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(getUserCollection('bodyMetrics'), metricsData);
    return docRef.id;
}

export async function getAllBodyMetrics() {
    const q = query(getUserCollection('bodyMetrics'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function getLatestBodyMetrics() {
    const q = query(getUserCollection('bodyMetrics'), orderBy('date', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : docToObj(querySnapshot.docs[0]);
}

export async function updateBodyMetrics(metrics) {
    const { id, ...data } = metrics;
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'bodyMetrics', id);
    await updateDoc(docRef, data);
    return id;
}

export async function deleteBodyMetrics(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'bodyMetrics', id);
    await deleteDoc(docRef);
}

// ============================================
// PHOTO OPERATIONS (With Firebase Storage)
// ============================================

export async function addProgressPhoto(photo) {
    const user = auth.currentUser;
    let imageUrl = photo.imageData;

    // If imageData is base64, upload to Storage
    if (photo.imageData && photo.imageData.startsWith('data:image')) {
        const timestamp = Date.now();
        const storageRef = ref(storage, `users/${user.uid}/photos/${timestamp}.jpg`);
        await uploadString(storageRef, photo.imageData, 'data_url');
        imageUrl = await getDownloadURL(storageRef);
    }

    const photoData = {
        date: photo.date || new Date().toISOString().split('T')[0],
        imageUrl: imageUrl, // Store URL instead of base64
        notes: photo.notes || '',
        createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(getUserCollection('photos'), photoData);
    return docRef.id;
}

export async function getAllProgressPhotos() {
    const q = query(getUserCollection('photos'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function getProgressPhoto(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'photos', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToObj(docSnap) : null;
}

export async function deleteProgressPhoto(id) {
    const user = auth.currentUser;
    const photo = await getProgressPhoto(id);

    if (photo && photo.imageUrl && photo.imageUrl.includes('firebasestorage')) {
        // Try to delete from storage
        try {
            // Extract path from URL or just store path in DB? 
            // For now, let's assume we can just delete the doc, 
            // but ideally we should delete the file too.
            // A better way is to store storagePath in the doc.
            // Parsing URL is brittle.
            const storageRef = ref(storage, photo.imageUrl);
            await deleteObject(storageRef).catch(err => console.warn('Could not delete file from storage', err));
        } catch (e) {
            console.warn('Error deleting photo file:', e);
        }
    }

    const docRef = doc(db, 'users', user.uid, 'photos', id);
    await deleteDoc(docRef);
}

// ============================================
// PERSONAL RECORDS OPERATIONS
// ============================================

export async function addPersonalRecord(pr) {
    const prData = {
        exerciseName: pr.exerciseName,
        type: pr.type,
        value: pr.value,
        date: pr.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(getUserCollection('personalRecords'), prData);
    return docRef.id;
}

export async function getAllPersonalRecords() {
    const q = query(getUserCollection('personalRecords'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function getPersonalRecordsByExercise(exerciseName) {
    const q = query(getUserCollection('personalRecords'), where('exerciseName', '==', exerciseName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObj);
}

export async function checkAndUpdatePR(exerciseName, type, value) {
    const existingPRs = await getPersonalRecordsByExercise(exerciseName);
    const samePRs = existingPRs.filter(pr => pr.type === type);

    if (samePRs.length === 0) {
        await addPersonalRecord({ exerciseName, type, value });
        return { isNewPR: true, improvement: value };
    }

    const maxPR = Math.max(...samePRs.map(pr => pr.value));
    if (value > maxPR) {
        await addPersonalRecord({ exerciseName, type, value });
        return { isNewPR: true, improvement: value - maxPR };
    }

    return { isNewPR: false };
}

export async function deletePersonalRecord(id) {
    const user = auth.currentUser;
    const docRef = doc(db, 'users', user.uid, 'personalRecords', id);
    await deleteDoc(docRef);
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

export async function getSetting(key) {
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, 'users', user.uid, 'settings', key);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().value : null;
}

export async function setSetting(key, value) {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', key);
    await updateDoc(docRef, { value }).catch(async (err) => {
        // If document doesn't exist, set it (updateDoc fails if not exists)
        // Or use setDoc with merge: true
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, { value });
    });
}

export async function getAllSettings() {
    const q = query(getUserCollection('settings'));
    const querySnapshot = await getDocs(q);
    const settings = {};
    querySnapshot.forEach(doc => {
        settings[doc.id] = doc.data().value;
    });
    return settings;
}

export async function initializeDefaultSettings() {
    const defaults = {
        theme: 'light',
        units: 'metric',
        weightUnit: 'kg',
        distanceUnit: 'km'
    };

    const currentSettings = await getAllSettings();
    for (const [key, value] of Object.entries(defaults)) {
        if (currentSettings[key] === undefined) {
            await setSetting(key, value);
        }
    }
}
