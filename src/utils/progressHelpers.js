/**
 * Progress Helpers - Utility functions for progress calculations
 */

/**
 * Calculate total volume lifted (weight × reps) from workouts
 * @param {Array} exercises - Array of exercise objects
 * @returns {number} Total volume in kg
 */
export function calculateTotalVolume(exercises) {
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
 * Get workout frequency in the last N days
 * @param {Array} workouts - Array of workout objects
 * @param {number} days - Number of days to look back
 * @returns {number} Number of workouts
 */
export function getWorkoutFrequency(workouts, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
    }).length;
}

/**
 * Get historical performance data for a specific exercise
 * @param {string} exerciseName - Name of the exercise
 * @param {Array} exercises - All exercises from all workouts
 * @param {Array} workouts - All workouts (for dates)
 * @returns {Array} Array of {date, maxWeight, totalVolume, sets}
 */
export function getExercisePerformance(exerciseName, exercises, workouts) {
    const workoutDateMap = {};
    workouts.forEach(w => {
        workoutDateMap[w.id] = w.date;
    });

    const exerciseData = exercises
        .filter(ex => ex.name === exerciseName && ex.type === 'strength')
        .map(ex => {
            const maxWeight = ex.sets && ex.sets.length > 0
                ? Math.max(...ex.sets.map(s => s.weight || 0))
                : 0;

            const totalVolume = ex.sets
                ? ex.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0)
                : 0;

            return {
                date: workoutDateMap[ex.workoutId] || new Date().toISOString().split('T')[0],
                maxWeight,
                totalVolume,
                sets: ex.sets || []
            };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return exerciseData;
}

/**
 * Calculate estimated one-rep max using Epley formula
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} Estimated 1RM
 */
export function calculateOneRepMax(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

/**
 * Group body metrics by date for Chart.js
 * @param {Array} metrics - Array of body metrics
 * @returns {Object} {labels: [], weights: [], bmis: [], bodyFats: []}
 */
export function groupMetricsByDate(metrics) {
    const sorted = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        labels: sorted.map(m => formatDateShort(m.date)),
        weights: sorted.map(m => m.weight || 0),
        bmis: sorted.map(m => m.bmi || 0),
        bodyFats: sorted.map(m => m.bodyFat || 0)
    };
}

/**
 * Calculate weight change from first to latest metric
 * @param {Array} metrics - Array of body metrics (sorted newest first)
 * @returns {Object} {change, percentage, direction}
 */
export function calculateWeightChange(metrics) {
    if (metrics.length < 2) {
        return { change: 0, percentage: 0, direction: 'none' };
    }

    const latest = metrics[0].weight;
    const oldest = metrics[metrics.length - 1].weight;
    const change = latest - oldest;
    const percentage = oldest > 0 ? ((change / oldest) * 100) : 0;

    return {
        change: Math.abs(change).toFixed(1),
        percentage: Math.abs(percentage).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'none'
    };
}

/**
 * Get top exercises by total volume
 * @param {Array} exercises - All exercises
 * @param {number} limit - Number of top exercises to return
 * @returns {Array} Array of {name, volume}
 */
export function getTopExercisesByVolume(exercises, limit = 5) {
    const volumeMap = {};

    exercises.forEach(ex => {
        if (ex.type === 'strength' && ex.sets) {
            const volume = ex.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
            volumeMap[ex.name] = (volumeMap[ex.name] || 0) + volume;
        }
    });

    return Object.entries(volumeMap)
        .map(([name, volume]) => ({ name, volume }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);
}

/**
 * Get unique exercise names from exercise history
 * @param {Array} exercises - All exercises
 * @returns {Array} Array of unique exercise names
 */
export function getUniqueExerciseNames(exercises) {
    const names = new Set();
    exercises.forEach(ex => {
        if (ex.name && ex.type === 'strength') {
            names.add(ex.name);
        }
    });
    return Array.from(names).sort();
}

/**
 * Get workout data for the last N days
 * @param {Array} workouts - All workouts
 * @param {number} days - Number of days
 * @returns {Object} {labels: [], counts: []}
 */
export function getWorkoutTrend(workouts, days = 7) {
    const labels = [];
    const counts = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        labels.push(formatDateShort(dateStr));
        counts.push(workouts.filter(w => w.date === dateStr).length);
    }

    return { labels, counts };
}

/**
 * Calculate BMI
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value
 */
export function calculateBMI(weight, height) {
    if (!weight || !height || height === 0) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} Category name
 */
export function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
}

/**
 * Format date to short format (DD/MM)
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDateShort(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
}

/**
 * Format volume number with K suffix for thousands
 * @param {number} volume - Volume number
 * @returns {string} Formatted volume
 */
export function formatVolume(volume) {
    if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
}
