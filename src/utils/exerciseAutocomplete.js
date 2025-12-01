/**
 * Exercise Autocomplete Helper
 * 
 * Provides autocomplete functionality for exercise name inputs
 */

import { searchExercises } from '../db/exerciseLibraryModels.js';
import { debounce } from '../utils/helpers.js';

/**
 * Setup autocomplete on an exercise name input
 * @param {HTMLInputElement} input - The input element
 * @param {Function} onSelect - Callback when an exercise is selected
 */
export function setupExerciseAutocomplete(input, onSelect) {
    if (!input) return;

    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'exercise-autocomplete';
    autocompleteContainer.style.display = 'none';

    // Insert after input
    input.parentNode.insertBefore(autocompleteContainer, input.nextSibling);

    let currentSuggestions = [];
    let selectedIndex = -1;

    // Debounced search function
    const performSearch = debounce(async (query) => {
        if (query.length < 2) {
            hideAutocomplete();
            return;
        }

        const results = await searchExercises(query);
        currentSuggestions = results.slice(0, 8); // Limit to 8 suggestions

        if (currentSuggestions.length > 0) {
            showSuggestions(currentSuggestions, query);
        } else {
            showNoResults(query);
        }
    }, 200);

    // Input event listener
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        selectedIndex = -1;
        performSearch(query);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        const items = autocompleteContainer.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !autocompleteContainer.contains(e.target)) {
            hideAutocomplete();
        }
    });

    function showSuggestions(suggestions, query) {
        autocompleteContainer.innerHTML = suggestions.map((exercise, index) => `
      <div class="autocomplete-item" data-index="${index}">
        <div class="autocomplete-item-content">
          <div class="autocomplete-name">
            ${highlightMatch(exercise.name, query)}
          </div>
          <div class="autocomplete-meta">
            <span class="autocomplete-category">${exercise.category}</span>
            <span class="autocomplete-difficulty">${exercise.difficulty}</span>
          </div>
        </div>
      </div>
    `).join('');

        // Add click handlers
        autocompleteContainer.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const selected = suggestions[index];
                input.value = selected.name;
                if (onSelect) {
                    onSelect(selected);
                }
                hideAutocomplete();
            });
        });

        autocompleteContainer.style.display = 'block';
    }

    function showNoResults(query) {
        autocompleteContainer.innerHTML = `
      <div class="autocomplete-no-results">
        <div>No se encontró "${query}"</div>
        <small>Presiona Enter para usar este nombre</small>
      </div>
    `;
        autocompleteContainer.style.display = 'block';
    }

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function hideAutocomplete() {
        autocompleteContainer.style.display = 'none';
        selectedIndex = -1;
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Return cleanup function
    return () => {
        autocompleteContainer.remove();
    };
}
