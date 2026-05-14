import { DivComponent } from '../../common/div-component.js';

export class Header extends DivComponent {
    constructor(appState) {
        super();
        this.appState = appState;
    }

    /**
     * Обробляє пошук під час натискання Enter або кліку на іконку
     * @param {Event} event 
     */
    #searchBooks = (event) => {
        if (event.type === 'click' || event.key === 'Enter') {
            const searchQuery = this.element.querySelector('.header__search-input').value.trim();
            if (searchQuery !== '') {
                this.appState.searchQuery = searchQuery;
                this.appState.currentPage = 1; // Сбрасываем на первую страницу при новом поиске
                if (this.appState.onChange) {
                    this.appState.onChange(); // Вызываем обновление представления
                }
            }
        }
    }

    /**
     * Переходить на сторінку обраного
     */
    #goToFavorites = (event) => {
        event.preventDefault();
        this.appState.page = 'favorites';
        if (this.appState.onChange) {
            this.appState.onChange();
        }
    }

    #goToMain = (event) => {
        event.preventDefault();
        this.appState.page = 'main';
        if (this.appState.onChange) {
            this.appState.onChange();
        }
    }

    render() {
        this.element.classList.add('header');
        this.element.innerHTML = `
            <div class="header__logo">
                <a href="#" class="logo-link">
                    <img src="./static/logo.svg" alt="Logo" class="header__logo-img">
                </a>
            </div>
            <div class="header__search-wrapper">
                <img src="./static/search.svg" alt="Search" class="header__search-icon">
                <input 
                    type="text" 
                    class="header__search-input" 
                    placeholder="Пошук книг за назвою книги або ім'ям автора..." 
                    value="${this.appState.searchQuery || ''}"
                >
            </div>
            <button class="header__favorites-button">
                <img src="./static/favorites.svg" alt="Favorites" class="header__favorites-icon">
                Улюблені (${this.appState.favorites.length})
            </button>
        `;

        this.element.querySelector('.header__search-input').addEventListener('keydown', this.#searchBooks);
        this.element.querySelector('.header__search-icon').addEventListener('click', this.#searchBooks);
        this.element.querySelector('.header__favorites-button').addEventListener('click', this.#goToFavorites);
        this.element.querySelector('.logo-link').addEventListener('click', this.#goToMain);

        return this.element;
    }
}