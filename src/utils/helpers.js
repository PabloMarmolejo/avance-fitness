/**
 * Avance Fitness - Helper Utilities
 * 
 * Utility functions for calculations, formatting, and validation
 */

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date to local string
 * @param {string|Date} date 
 * @returns {string} formatted date
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date to short string (DD/MM/YYYY)
 */
export function formatDateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
}

/**
 * Format time (HH:MM)
 */
export function formatTime(time) {
    if (!time) return '';
    return time.substring(0, 5);
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime() {
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Get date X days ago
 */
export function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

/**
 * Format duration (minutes to HH:MM)
 */
export function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    return `${hours}h ${mins}min`;
}

// ============================================
// BMI CALCULATIONS
// ============================================

/**
 * Calculate BMI
 * @param {number} weight - in kg
 * @param {number} height - in cm
 * @returns {number} BMI value
 */
export function calculateBMI(weight, height) {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
}

/**
 * Get BMI color for UI
 */
export function getBMIColor(bmi) {
    if (bmi < 18.5) return '#f59e0b'; // warning
    if (bmi < 25) return '#10b981'; // success
    if (bmi < 30) return '#f59e0b'; // warning
    return '#ef4444'; // error
}

// ============================================
// IMAGE COMPRESSION
// ============================================

/**
 * Compress image to base64
 * @param {File} file - Image file
 * @param {number} maxWidth - Max width in pixels
 * @param {number} quality - Quality 0-1
 * @returns {Promise<string>} base64 string
 */
export async function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if needed
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Get image size in KB from base64
 */
export function getBase64Size(base64) {
    const stringLength = base64.length - 'data:image/png;base64,'.length;
    const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
    return (sizeInBytes / 1024).toFixed(2);
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate workout form
 */
export function validateWorkout(workout) {
    const errors = [];

    if (!workout.type || workout.type.trim() === '') {
        errors.push('El tipo de entrenamiento es requerido');
    }

    if (!workout.date) {
        errors.push('La fecha es requerida');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate exercise
 */
export function validateExercise(exercise) {
    const errors = [];

    if (!exercise.name || exercise.name.trim() === '') {
        errors.push('El nombre del ejercicio es requerido');
    }

    if (!exercise.type) {
        errors.push('El tipo de ejercicio es requerido');
    }

    if (exercise.type === 'strength' && (!exercise.sets || exercise.sets.length === 0)) {
        errors.push('Debes agregar al menos un set');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate routine
 */
export function validateRoutine(routine) {
    const errors = [];

    if (!routine.name || routine.name.trim() === '') {
        errors.push('El nombre de la rutina es requerido');
    }

    if (!routine.exercises || routine.exercises.length === 0) {
        errors.push('Debes agregar al menos un ejercicio');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// ============================================
// PERSONAL RECORDS DETECTION
// ============================================

/**
 * Detect PRs from workout exercises
 * @param {Array} exercises - Array of exercise objects
 * @returns {Array} Array of PR objects
 */
export function detectPRsFromExercises(exercises) {
    const prs = [];

    for (const exercise of exercises) {
        if (exercise.type === 'strength' && exercise.sets && exercise.sets.length > 0) {
            // Find max weight
            const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
            if (maxWeight > 0) {
                prs.push({
                    exerciseName: exercise.name,
                    type: 'weight',
                    value: maxWeight
                });
            }

            // Find max reps
            const maxReps = Math.max(...exercise.sets.map(s => s.reps || 0));
            if (maxReps > 0) {
                prs.push({
                    exerciseName: exercise.name,
                    type: 'reps',
                    value: maxReps
                });
            }
        }

        if (exercise.type === 'cardio') {
            // Distance PR
            if (exercise.distance > 0) {
                prs.push({
                    exerciseName: exercise.name,
                    type: 'distance',
                    value: exercise.distance
                });
            }

            // Speed PR
            if (exercise.speed > 0) {
                prs.push({
                    exerciseName: exercise.name,
                    type: 'speed',
                    value: exercise.speed
                });
            }
        }
    }

    return prs;
}

// ============================================
// STATISTICS CALCULATIONS
// ============================================

/**
 * Calculate total volume (weight × reps) for exercises
 */
export function calculateVolume(exercises) {
    let totalVolume = 0;

    for (const exercise of exercises) {
        if (exercise.type === 'strength' && exercise.sets) {
            for (const set of exercise.sets) {
                totalVolume += (set.weight || 0) * (set.reps || 0);
            }
        }
    }

    return totalVolume;
}

/**
 * Calculate workout frequency (workouts per week)
 */
export function calculateFrequency(workouts, days = 7) {
    const startDate = getDaysAgo(days);
    const recentWorkouts = workouts.filter(w => w.date >= startDate);
    return recentWorkouts.length;
}

/**
 * Calculate current streak (consecutive days with workouts)
 */
export function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;

    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const uniqueDates = [...new Set(sortedWorkouts.map(w => w.date))];

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of uniqueDates) {
        const workoutDate = new Date(dateStr);
        workoutDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
            streak++;
            currentDate = workoutDate;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Get workout distribution by type
 */
export function getWorkoutDistribution(workouts) {
    const distribution = {};

    for (const workout of workouts) {
        const type = workout.type;
        distribution[type] = (distribution[type] || 0) + 1;
    }

    return distribution;
}

/**
 * Calculate average duration
 */
export function calculateAverageDuration(workouts) {
    if (workouts.length === 0) return 0;
    const total = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    return Math.round(total / workouts.length);
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format number with unit
 */
export function formatWeight(value, unit = 'kg') {
    return `${value} ${unit}`;
}

export function formatDistance(value, unit = 'km') {
    return `${value} ${unit}`;
}

export function formatSpeed(value, unit = 'km/h') {
    return `${value} ${unit}`;
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

/**
 * Save to localStorage
 */
export function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Get from localStorage
 */
export function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove from localStorage
 */
export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ============================================
// DEBOUNCE
// ============================================

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in ms
 */
export function showToast(message, type = 'success', duration = 3000) {
    console.log('🍞 showToast called:', message, type);
    const icon = type === 'success' ? '✅' : '❌';
    const toastHTML = `
        <div class="toast toast-${type}">
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);
    const toast = document.body.lastElementChild;
    console.log('🍞 Toast element created:', toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}
