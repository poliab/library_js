import { DivComponent } from '../../common/div-component.js';

export class Search extends DivComponent {
    constructor(appState) {
        super();
        this.appState = appState;
    }

    /**
     * Обробляє запит на пошук при натисканні Enter
     * @param {KeyboardEvent} event 
     */
    #onKeyDown = (event) => {
        if (event.key === 'Enter') {
            const query = event.target.value.trim();
            if (query !== '') {
                this.appState.searchQuery = query;
            }
        }
    }

    render() {
        this.element.classList.add('search');
        
        this.element.innerHTML = `
            <h2 class="search__title">Пошук книг</h2>
            ${this.appState.searchResults 
                ? `<p class="search__result-count">Знайдено книг: ${this.appState.searchResults.numFound}</p>` 
                : ''}
        `;
        
        return this.element;
    }
} 

