import { MainView } from './views/main/main.js';
import { FavoritesView } from './views/favorites/favorites.js';
import { BookView } from './views/book/book.js';

class AppState {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.searchQuery = '';
        this.searchResults = null;
        
        // Отдельные состояния пагинации для разных страниц
        this.mainPageState = {
            currentPage: 1,
            totalPages: 1
        };
        
        this.favoritesPageState = {
            currentPage: 1,
            totalPages: 1
        };
        
        // Общие переменные для совместимости
        this.currentPage = 1;
        this.totalPages = 1;
        
        this._page = localStorage.getItem('app_page') || 'main';
        this.onChange = null;
        this.needsReload = false;
    }

    set page(value) {
        // Сохраняем текущее состояние пагинации перед сменой страницы
        this.saveCurrentPaginationState();
        
        this._page = value;
        localStorage.setItem('app_page', value);
        
        // Восстанавливаем состояние пагинации для новой страницы
        this.restorePaginationState();
        
        if (this.onChange) {
            this.onChange();
        }
    }

    get page() {
        return this._page;
    }
    
    // Сохраняет состояние пагинации текущей страницы
    saveCurrentPaginationState() {
        if (this._page === 'main') {
            this.mainPageState.currentPage = this.currentPage;
            this.mainPageState.totalPages = this.totalPages;
            console.log(`Saving main page state: ${this.currentPage}/${this.totalPages}`);
        } else if (this._page === 'favorites') {
            this.favoritesPageState.currentPage = this.currentPage;
            this.favoritesPageState.totalPages = this.totalPages;
            console.log(`Saving favorites page state: ${this.currentPage}/${this.totalPages}`);
        }
    }
    
    // Восстанавливает состояние пагинации для текущей страницы
    restorePaginationState() {
        if (this._page === 'main') {
            this.currentPage = this.mainPageState.currentPage;
            this.totalPages = this.mainPageState.totalPages;
            console.log(`Restoring main page state: ${this.currentPage}/${this.totalPages}`);
        } else if (this._page === 'favorites') {
            this.currentPage = this.favoritesPageState.currentPage;
            this.totalPages = this.favoritesPageState.totalPages;
            console.log(`Restoring favorites page state: ${this.currentPage}/${this.totalPages}`);
        }
    }
}

class App {
    constructor() {
        this.appState = new AppState();
        this.mainView = null;
        this.favoritesView = null;
        this.bookView = null;
        this.currentView = null;
        
        this.appState.onChange = this.route.bind(this);
        
        document.addEventListener('app:navigate', this.handleNavigate.bind(this));
    }
    
    /**
     * Обробляє подію навігації
     */
    handleNavigate(event) {
        if (event.detail && event.detail.page) {
            this.appState.page = event.detail.page;
            this.route();
        }
    }
    
    /**
     * Запускає програму
     */
    start() {
        this.route();
    }
    
    /**
     * Маршрутизація програми
     */
    route() {
        const root = document.getElementById('root');
        root.innerHTML = '';
        
        // Уничтожаем текущее представление, если оно существует
        if (this.currentView && typeof this.currentView.destroy === 'function') {
            this.currentView.destroy();
        }
        
        console.log(`Routing to page: ${this.appState.page}, currentPage: ${this.appState.currentPage}, totalPages: ${this.appState.totalPages}`);
        
        if (this.appState.page === 'main') {
            if (!this.mainView) {
                this.mainView = new MainView(this.appState);
            }
            root.append(this.mainView.render());
            this.currentView = this.mainView;
        } else if (this.appState.page === 'favorites') {
            if (!this.favoritesView) {
                this.favoritesView = new FavoritesView(this.appState);
            }
            root.append(this.favoritesView.render());
            this.currentView = this.favoritesView;
        } else if (this.appState.page === 'book') {
            if (!this.bookView) {
                this.bookView = new BookView(this.appState);
            }
            root.append(this.bookView.render());
            this.currentView = this.bookView;
        }
    }

    fetchBooks() {
        const offset = (this.appState.currentPage - 1) * 20;
        const query = this.appState.searchQuery || 'fantasy';
        fetch(`https://openlibrary.org/search.json?q=${query}&offset=${offset}&limit=20`)
            .then(response => response.json())
            .then(data => {
                this.appState.searchResults = data.docs;
                this.appState.mainPageResults = data.docs; // Сохраняем отдельно
                this.appState.totalPages = Math.ceil(data.numFound / 20);
                this.appState.mainTotalPages = this.appState.totalPages; // Сохраняем отдельно
                this.appState.onChange();
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start();
});