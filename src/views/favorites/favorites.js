import { View } from '../../common/view.js';
import { Header } from '../../components/header/header.js';
import { CardList } from '../../components/card/card-list.js';
import { Pagination } from '../../components/pagination/pagination.js';
import { Footer } from '../../components/footer/footer.js';

export class FavoritesView extends View {
    constructor(appState) {
        super(appState);
        this.appState = appState;
        
        this.header = new Header(this.appState);
        this.pagination = new Pagination(this.appState);
        
        this.appState.favoritesViewInstance = this;
        
        this.setTotalPages();
        
        if (this.appState.currentPage > this.appState.totalPages) {
            this.appState.currentPage = 1;
        }
        
        // Сохраняем оригинальный обработчик, если он есть
        this.originalOnChange = this.appState.onChange;
        
        // Теперь используем свой внутренний метод для обновления представления
        this.renderView = this.render.bind(this);
        
        // Создаем функцию-обертку для вызова оригинального обработчика
        this.appState.onChange = () => {
            // Сначала вызываем оригинальный обработчик (маршрутизацию)
            if (this.originalOnChange) {
                this.originalOnChange();
            }
            
            // Затем обновляем наше представление, если мы все еще активны
            if (this.appState.page === 'favorites') {
                // Обновляем информацию о пагинации перед отрисовкой
                this.updatePagination();
                this.renderView();
            }
        };
        
        this.footer = new Footer();
    }
    
    /**
     * Встановлює загальну кількість сторінок для обраного
     */
    setTotalPages() {
        const itemsPerPage = 20;
        const totalItems = this.appState.favorites.length;
        
        // Правильно устанавливаем totalPages только для страницы избранного
        this.appState.favoritesPageState.totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        this.appState.totalPages = this.appState.favoritesPageState.totalPages;
        
        console.log(`Favorites - Total items: ${totalItems}, Total pages: ${this.appState.totalPages}, Current page: ${this.appState.currentPage}`);
    }
    
    /**
     * Оновлює стан пагінації для обраного
     */
    updatePagination() {
        // Обновляем количество страниц
        this.setTotalPages();
        
        // Текущая страница может не существовать, если число избранных книг уменьшилось
        const currentPage = parseInt(this.appState.currentPage) || 1;
        const totalPages = parseInt(this.appState.totalPages) || 1;
        
        console.log(`Favorites updatePagination: currentPage=${currentPage}, totalPages=${totalPages}`);
        
        // Если текущая страница больше общего количества страниц, корректируем ее
        if (currentPage > totalPages) {
            console.log(`Favorites: Current page ${currentPage} exceeds total pages ${totalPages}, correcting to ${Math.max(1, totalPages)}`);
            this.appState.currentPage = Math.max(1, totalPages);
            this.appState.favoritesPageState.currentPage = this.appState.currentPage;
        }
    }
    
    /**
     * Отримує список обраних книг для поточної сторінки
     * @returns {Array} Масив книг для поточної сторінки
     */
    getFavoritesForCurrentPage() {
        const itemsPerPage = 20;
        const currentPage = this.appState.currentPage || 1;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        console.log(`Favorites: Getting books for page ${currentPage}, startIndex: ${startIndex}, endIndex: ${endIndex}, total books: ${this.appState.favorites.length}`);
        
        return this.appState.favorites.slice(startIndex, endIndex);
    }
    
    /**
     * Повернення на головну сторінку
     */
    backToMain = () => {
        this.appState.page = 'main';
    }
    
    /**
     * Восстанавливаем оригинальный обработчик при удалении представления
     */
    destroy() {
        if (this.originalOnChange) {
            this.appState.onChange = this.originalOnChange;
        }
    }
    
    render() {
        this.element.innerHTML = '';
        this.element.append(this.header.render());
        
        const backButton = document.createElement('button');
        backButton.classList.add('back-button');
        backButton.textContent = '← Повернутися на головну';
        backButton.addEventListener('click', this.backToMain);
        this.element.append(backButton);
        
        const title = document.createElement('h2');
        title.textContent = 'Улюблені книги';
        title.classList.add('favorites-title');
        this.element.append(title);
        
        this.updatePagination();
        
        const favoritesForPage = this.getFavoritesForCurrentPage();
        const cardList = new CardList(favoritesForPage, this.appState);
        this.element.append(cardList.render());
        
        if (this.appState.totalPages > 1) {
            this.element.append(this.pagination.render());
        }
        
        this.element.append(this.footer.render());
        
        return this.element;
    }
}