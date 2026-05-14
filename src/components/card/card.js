import { DivComponent } from '../../common/div-component.js';

export class Card extends DivComponent {
    constructor(book, appState) {
        super();
        this.book = book;
        this.appState = appState;
    }

    /**
     * Перевіряє, чи знаходиться книга в обраному
     * @returns {boolean}
     */
    #isBookInFavorites() {
        return this.appState.favorites.some(b => b.key === this.book.key);
    }

    /**
     * Оброблювач кліка по кнопці додавання в обране
     * @param {Event} event 
     */
    #onFavoriteClick = (event) => {
        event.preventDefault();
        event.stopPropagation(); 
        
        if (this.#isBookInFavorites()) {
            // Удаляем книгу из избранного
            this.appState.favorites = this.appState.favorites.filter(
                b => b.key !== this.book.key
            );
            
            console.log(`Removed book from favorites: ${this.book.title}, remaining: ${this.appState.favorites.length}`);
            
            // Сохраняем обновленное состояние в localStorage
            localStorage.setItem('favorites', JSON.stringify(this.appState.favorites));
            
            // Если мы на странице избранного, удаляем карточку из DOM
            if (this.appState.page === 'favorites') {
                // Удаляем элемент из DOM
                console.log('Removing card from DOM on favorites page');
                this.element.remove();
                
                // Проверяем общее количество карточек
                const cardList = document.querySelector('.card-list');
                
                console.log(`Card list after removal: ${cardList ? cardList.children.length : 'not found'} cards`);
                
                // Если нет больше карточек, показываем сообщение
                if (cardList && cardList.children.length === 0) {
                    console.log('No more cards, showing empty message');
                    
                    cardList.innerHTML = `
                        <div class="card-list__empty">
                            Книги не знайдено
                        </div>
                    `;
                    
                    // Обновляем пагинацию
                    if (this.appState.favoritesViewInstance) {
                        console.log('Updating pagination after all cards removed');
                        this.appState.favoritesViewInstance.updatePagination();
                        
                        // Принудительно обновляем всё представление для корректного отображения
                        if (this.appState.onChange) {
                            this.appState.onChange();
                        }
                    }
                    
                    return;
                }
            }
        } else {
            // Добавляем книгу в избранное
            this.appState.favorites.push(this.book);
            console.log(`Added book to favorites: ${this.book.title}, total: ${this.appState.favorites.length}`);
            localStorage.setItem('favorites', JSON.stringify(this.appState.favorites));
        }
        
        // Обновляем текст кнопки, если карточка ещё в DOM
        if (document.body.contains(this.element)) {
            this.element.querySelector('.book-card__favorite').textContent = 
                this.#isBookInFavorites() ? '★ Видалити з улюблених' : '★ Додати до улюблених';
        }
            
        // Обновляем счётчик в шапке
        const favoritesButton = document.querySelector('.header__favorites-button');
        if (favoritesButton) {
            favoritesButton.innerHTML = `
                <img src="./static/favorites.svg" alt="Favorites" class="header__favorites-icon">
                Улюблені (${this.appState.favorites.length})
            `;
        }
    }
    
    /**
     * Обробник кліка по картці для переходу на сторінку з детальною інформацією
     */
    #onCardClick = (event) => {
        const bookKey = this.book.key;
        
        localStorage.setItem('selectedBookKey', bookKey);
        
        localStorage.setItem('app_page', 'book');
        window.location.reload();
    }

    render() {
        this.element.classList.add('book-card');
        const coverUrl = this.book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${this.book.cover_i}-M.jpg`
            : 'https://via.placeholder.com/150x200?text=Немає+обкладинки';
        
        const isFavorite = this.#isBookInFavorites();
        
        this.element.innerHTML = `
            <img class="book-card__image" src="${coverUrl}" alt="${this.book.title || 'Книга'}" />
            <h3 class="book-card__title">${this.book.title || 'Назва невідома'}</h3>
            <p class="book-card__author">${this.book.author_name?.join(', ') || 'Автор невідомий'}</p>
            <button class="book-card__favorite">
                ${isFavorite ? '★ Видалити з улюблених' : '★ Додати до улюблених'}
            </button>
        `;

        this.element.querySelector('.book-card__favorite').addEventListener('click', this.#onFavoriteClick);
        
        this.element.addEventListener('click', this.#onCardClick);
        
        this.element.classList.add('book-card--clickable');
        
        return this.element;
    }
} 