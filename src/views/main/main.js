import { View } from '../../common/view.js';
import { Header } from '../../components/header/header.js';
import { Search } from '../../components/search/search.js';
import { CardList } from '../../components/card/card-list.js';
import { Pagination } from '../../components/pagination/pagination.js';
import { Footer } from '../../components/footer/footer.js';

export class MainView extends View {
    constructor(appState) {
        super();
        this.appState = appState;
        this.header = new Header(appState);
        this.footer = new Footer();
        this.pagination = null;
        this.data = null;
        
        // Создаем кэш для хранения книг по страницам
        this.booksCache = {};
        
        this.appState.onChange = this.appState.onChange || (() => {});
        // Сохраняем оригинальный onChange
        const originalOnChange = this.appState.onChange;
        
        // Переопределяем onChange для MainView
        this.appState.onChange = () => {
            if (this.appState.page === 'main') {
                this.onMainChange();
            }
            // Вызываем оригинальный обработчик
            originalOnChange();
        };
        
        // Инициируем первую загрузку
        this.onMainChange();
    }
    
    /**
     * Спрацьовує при зміні стану програми на главной странице
     */
    onMainChange = () => {
        const { searchQuery, currentPage } = this.appState;
        console.log(`MainView onMainChange: searchQuery=${searchQuery}, page=${currentPage}`);
        
        // Формируем ключ для кэша
        const cacheKey = `${searchQuery || 'fantasy'}_page${currentPage}`;
        
        // Проверяем, есть ли данные в кэше
        if (this.booksCache[cacheKey]) {
            console.log(`Using cached data for ${cacheKey}`);
            this.data = this.booksCache[cacheKey];
            this.render();
        } else {
            // Загружаем данные с сервера
            this.loadBooks(searchQuery || 'fantasy', currentPage);
        }
    }
    
    /**
     * Завантажує книги за пошуковим запитом
     */
    loadBooks(query, page = 1) {
        console.log(`Loading books for query: ${query}, page: ${page}`);
        
        // Показываем индикатор загрузки
        this.data = null;
        this.render();
        
        const offset = (page - 1) * 20;
        
        fetch(`https://openlibrary.org/search.json?q=${query}&offset=${offset}&limit=20`)
            .then(response => response.json())
            .then(data => {
                console.log(`Loaded ${data.docs?.length || 0} books for query=${query}, page=${page}`);
                
                // Сохраняем данные
                this.data = data;
                
                // Сохраняем в кэш
                const cacheKey = `${query}_page${page}`;
                this.booksCache[cacheKey] = data;
                
                // Обновляем общее число страниц
                const totalItems = data.numFound || 0;
                this.appState.totalPages = Math.ceil(totalItems / 20) || 1;
                
                // Рендерим с новыми данными
                this.render();
            })
            .catch(error => {
                console.error('Error loading books:', error);
                this.data = { docs: [] };
                this.appState.totalPages = 1;
                this.render();
            });
    }
    
    render() {
        console.log(`MainView render: currentPage=${this.appState.currentPage}`);
        
        this.element.innerHTML = '';
        this.element.append(this.header.render());
        
        // Показываем индикатор загрузки или данные
        if (!this.data) {
            const loading = document.createElement('div');
            loading.classList.add('loading-message');
            loading.textContent = 'Загрузка книг...';
            this.element.append(loading);
        } 
        else if (this.data.docs && this.data.docs.length > 0) {
            const cardList = new CardList(this.data.docs, this.appState);
            this.element.append(cardList.render());
        } 
        else {
            const noBooks = document.createElement('div');
            noBooks.classList.add('no-books-message');
            noBooks.textContent = 'Книги не найдены';
            this.element.append(noBooks);
        }
        
        // Обновляем пагинацию
        this.pagination = new Pagination(this.appState);
        this.element.append(this.pagination.render());
        
        // Добавляем футер
        this.element.append(this.footer.render());
        
        return this.element;
    }
}