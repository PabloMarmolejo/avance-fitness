/**
 * Avance Fitness - IndexedDB Database Configuration
 * 
 * This module handles all IndexedDB operations for the app.
 * Stores: workouts, exercises, routines, bodyMetrics, photos, personalRecords, settings
 */

const DB_NAME = 'AvanceFitnessDB';
const DB_VERSION = 1;

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ Error al abrir IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB inicializada correctamente');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log('🔄 Actualizando esquema de base de datos...');

            // Store: workouts
            if (!db.objectStoreNames.contains('workouts')) {
                const workoutStore = db.createObjectStore('workouts', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                workoutStore.createIndex('date', 'date', { unique: false });
                workoutStore.createIndex('type', 'type', { unique: false });
                console.log('✅ Store "workouts" creada');
            }

            // Store: exercises (linked to workouts)
            if (!db.objectStoreNames.contains('exercises')) {
                const exerciseStore = db.createObjectStore('exercises', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                exerciseStore.createIndex('workoutId', 'workoutId', { unique: false });
                exerciseStore.createIndex('name', 'name', { unique: false });
                console.log('✅ Store "exercises" creada');
            }

            // Store: routines
            if (!db.objectStoreNames.contains('routines')) {
                const routineStore = db.createObjectStore('routines', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                routineStore.createIndex('name', 'name', { unique: false });
                console.log('✅ Store "routines" creada');
            }

            // Store: bodyMetrics
            if (!db.objectStoreNames.contains('bodyMetrics')) {
                const metricsStore = db.createObjectStore('bodyMetrics', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                metricsStore.createIndex('date', 'date', { unique: false });
                console.log('✅ Store "bodyMetrics" creada');
            }

            // Store: photos
            if (!db.objectStoreNames.contains('photos')) {
                const photoStore = db.createObjectStore('photos', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                photoStore.createIndex('date', 'date', { unique: false });
                console.log('✅ Store "photos" creada');
            }

            // Store: personalRecords
            if (!db.objectStoreNames.contains('personalRecords')) {
                const prStore = db.createObjectStore('personalRecords', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                prStore.createIndex('exerciseName', 'exerciseName', { unique: false });
                prStore.createIndex('date', 'date', { unique: false });
                console.log('✅ Store "personalRecords" creada');
            }

            // Store: settings
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
                console.log('✅ Store "settings" creada');
            }

            console.log('✅ Esquema de base de datos actualizado');
        };
    });
}

/**
 * Get the database instance
 * @returns {Promise<IDBDatabase>}
 */
export async function getDB() {
    if (!db) {
        await initDB();
    }
    return db;
}

/**
 * Generic function to add data to a store
 * @param {string} storeName 
 * @param {object} data 
 * @returns {Promise<number>}
 */
export async function addData(storeName, data) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generic function to get data by ID
 * @param {string} storeName 
 * @param {number} id 
 * @returns {Promise<object>}
 */
export async function getData(storeName, id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generic function to get all data from a store
 * @param {string} storeName 
 * @returns {Promise<Array>}
 */
export async function getAllData(storeName) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generic function to update data
 * @param {string} storeName 
 * @param {object} data 
 * @returns {Promise<number>}
 */
export async function updateData(storeName, data) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generic function to delete data by ID
 * @param {string} storeName 
 * @param {number} id 
 * @returns {Promise<void>}
 */
export async function deleteData(storeName, id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get data by index
 * @param {string} storeName 
 * @param {string} indexName 
 * @param {any} value 
 * @returns {Promise<Array>}
 */
export async function getByIndex(storeName, indexName, value) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear all data from a store
 * @param {string} storeName 
 * @returns {Promise<void>}
 */
export async function clearStore(storeName) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete the entire database (for testing or reset)
 * @returns {Promise<void>}
 */
export async function deleteDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            db = null;
            console.log('✅ Base de datos eliminada');
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}
