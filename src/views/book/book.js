import { View } from '../../common/view.js';
import { Header } from '../../components/header/header.js';
import { Footer } from '../../components/footer/footer.js';

export class BookView extends View {
    constructor(appState) {
        super(appState);
        this.appState = appState;
        this.header = new Header(this.appState);
        this.bookData = null;
        this.editions = [];
        this.translatedDescription = '';
        this.isTranslating = false;
        this.showOriginal = false; 
        this.originalDescription = '';
        
        // Сохраняем оригинальный обработчик, если он есть
        this.originalOnChange = this.appState.onChange;
        
        // Создаем функцию-обертку для вызова оригинального обработчика
        this.appState.onChange = () => {
            // Сначала вызываем оригинальный обработчик (маршрутизацию)
            if (this.originalOnChange) {
                this.originalOnChange();
            }
            
            // Затем обновляем наше представление, если мы все еще активны
            if (this.appState.page === 'book') {
                this.render();
            }
        };
        
        this.footer = new Footer();
        this.loadBook();
    }
    
    /**
     * Восстанавливаем оригинальный обработчик при удалении представления
     */
    destroy() {
        if (this.originalOnChange) {
            this.appState.onChange = this.originalOnChange;
        }
    }
    
    /**
     * Завантажує інформацію про книгу за ключем
     */
    async loadBook() {
        const bookKey = localStorage.getItem('selectedBookKey');
        if (!bookKey) {
            this.appState.page = 'main';
            return;
        }
        
        try {
            const savedTranslation = localStorage.getItem(`translation_${bookKey}`);
            if (savedTranslation) {
                this.translatedDescription = savedTranslation;
            }
            
            const savedOriginal = localStorage.getItem(`original_${bookKey}`);
            if (savedOriginal) {
                this.originalDescription = savedOriginal;
            }
            
            const response = await fetch(`https://openlibrary.org${bookKey}.json`);
            if (!response.ok) {
                throw new Error('Не вдалося завантажити інформацію про книгу');
            }
            
            this.bookData = await response.json();
            
            if (this.bookData.description && !this.originalDescription) {
                this.originalDescription = typeof this.bookData.description === 'object' 
                    ? this.bookData.description.value 
                    : this.bookData.description;
                    
                localStorage.setItem(`original_${bookKey}`, this.originalDescription);
            }
            
            if (this.bookData.authors) {
                await this.loadAuthors();
            }
            
            await this.loadEditions();
            
            this.render();
        } catch (error) {
            console.error('Помилка під час завантаження книги:', error);
        }
    }
    
    /**
     * Завантажує інформацію про авторів
     */
    async loadAuthors() {
        const authorPromises = this.bookData.authors.map(async author => {
            try {
                const authorKey = typeof author === 'object' ? author.author.key : author.key;
                const response = await fetch(`https://openlibrary.org${authorKey}.json`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Помилка під час завантаження інформації про автора:', error);
                return null;
            }
        });
        
        const authors = await Promise.all(authorPromises);
        this.bookData.authorDetails = authors.filter(author => author !== null);
    }
    
    /**
     * Завантажує інформацію про видання книги
     */
    async loadEditions() {
        try {
            const workKey = this.bookData.key;
            const response = await fetch(`https://openlibrary.org${workKey}/editions.json?limit=5`);
            
            if (response.ok) {
                const data = await response.json();
                this.editions = data.entries || [];
            }
        } catch (error) {
            console.error('Помилка під час завантаження видань:', error);
        }
    }
    
    /**
     * Відкриває Google Translate для перекладу опису
     */
    openTranslate = () => {
        if (!this.bookData || !this.bookData.description) return;
        
        const description = typeof this.bookData.description === 'object' 
            ? this.bookData.description.value 
            : this.bookData.description;
            
        const encodedText = encodeURIComponent(description);
        window.open(`https://translate.google.com/?sl=en&tl=uk&text=${encodedText}&op=translate`, '_blank');
    }
    
    /**
     * Перекладає опис книги або перемикає між оригіналом і перекладом
     */
    translateDescription = async () => {
        if (!this.bookData || !this.bookData.description) return;
        
        if (this.translatedDescription) {
            this.showOriginal = !this.showOriginal;
            this.render(); 
            return;
        }
        
        this.isTranslating = true;
        this.render(); 
        
        try {
            const description = typeof this.bookData.description === 'object' 
                ? this.bookData.description.value 
                : this.bookData.description;
            
            this.originalDescription = description;
            localStorage.setItem(`original_${this.bookData.key}`, this.originalDescription);
            
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=uk&dt=t&q=${encodeURIComponent(description)}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data[0]) {
                    this.translatedDescription = data[0].map(item => item[0]).join('');
                    
                    localStorage.setItem(`translation_${this.bookData.key}`, this.translatedDescription);
                } else {
                    throw new Error('Некоректний формат відповіді від API');
                }
            } else {
                throw new Error('Помилка запиту до API перекладу');
            }
        } catch (error) {
            console.error('Помилка перекладу:', error);
            
            this.translatedDescription = `
            --- Автоматичний переклад недоступний. Використовуйте кнопку "Відкрити в Google Translate" для перекладу. ---
            
            ${this.originalDescription}
            `;
            
            if (this.bookData.key) {
                localStorage.setItem(`translation_${this.bookData.key}`, this.translatedDescription);
            }
            
            alert('На жаль, не вдалося автоматично перекласти опис. Спробуйте використати Google Translate.');
        } finally {
            this.isTranslating = false;
            this.showOriginal = false; 
            this.render(); 
        }
    }
    
    /**
     * Додає книгу в обране
     */
    addToFavorites = () => {
        const isInFavorites = this.appState.favorites.some(book => book.key === this.bookData.key);
        
        if (!isInFavorites) {
            const bookToAdd = {
                key: this.bookData.key,
                title: this.bookData.title,
                cover_i: this.bookData.covers ? this.bookData.covers[0] : null,
                author_name: this.bookData.authorDetails ? 
                    this.bookData.authorDetails.map(author => author.name) : []
            };
            
            this.appState.favorites.push(bookToAdd);
            localStorage.setItem('favorites', JSON.stringify(this.appState.favorites));
            
            const addButton = this.element.querySelector('.book-add-favorite');
            if (addButton) {
                addButton.textContent = 'Видалити з улюблених';
                addButton.classList.add('in-favorites');
            }
        } else {
            this.appState.favorites = this.appState.favorites.filter(book => book.key !== this.bookData.key);
            localStorage.setItem('favorites', JSON.stringify(this.appState.favorites));
            
            const addButton = this.element.querySelector('.book-add-favorite');
            if (addButton) {
                addButton.textContent = 'Додати до улюблених';
                addButton.classList.remove('in-favorites');
            }
        }
        
        this.header.render();
    }
    
    /**
     * Повертає на головну сторінку
     */
    backToMain = () => {
        this.appState.page = 'main';
    }
    
    render() {
        this.element.innerHTML = '';
        this.element.append(this.header.render());
        
        const backButton = document.createElement('button');
        backButton.classList.add('back-button');
        backButton.textContent = '← Повернутися на головну';
        backButton.addEventListener('click', this.backToMain);
        this.element.append(backButton);
        
        if (!this.bookData) {
            const loading = document.createElement('div');
            loading.classList.add('loading');
            loading.textContent = 'Завантаження інформації про книгу...';
            this.element.append(loading);
            return this.element;
        }
        
        const bookContainer = document.createElement('div');
        bookContainer.classList.add('book-container');
        
        const isInFavorites = this.appState.favorites.some(book => book.key === this.bookData.key);
        
        const coverUrl = this.bookData.covers && this.bookData.covers.length > 0 
            ? `https://covers.openlibrary.org/b/id/${this.bookData.covers[0]}-L.jpg`
            : 'https://via.placeholder.com/250x350?text=Немає+обкладинки';
        
        const descriptionToShow = this.translatedDescription && !this.showOriginal
            ? this.translatedDescription
            : (this.originalDescription || (typeof this.bookData.description === 'object' 
                ? this.bookData.description.value 
                : this.bookData.description));
        
        const translateButtonText = this.isTranslating 
            ? 'Перекладаємо...' 
            : (this.translatedDescription 
                ? (this.showOriginal ? 'Показати переклад' : 'Вернутися до оригіналу') 
                : 'Перекласти автоматично');
            
        bookContainer.innerHTML = `
            <div class="book-header">
                <h1 class="book-title">${this.bookData.title}</h1>
                <button class="book-add-favorite ${isInFavorites ? 'in-favorites' : ''}">
                    ${isInFavorites ? 'Видалити з улюблених' : 'Додати до улюблених'}
                </button>
            </div>
            
            <div class="book-content">
                <div class="book-cover">
                    <img src="${coverUrl}" alt="${this.bookData.title}" class="book-cover-img">
                </div>
                
                <div class="book-details">
                    <div class="book-info-section">
                        <div class="book-description-header">
                            <h2>Інформація про книгу</h2>
                            ${this.bookData.description ? `
                                <div class="book-translate-buttons">
                                    <button class="translate-button translate-api ${this.isTranslating ? 'loading' : ''}" ${this.isTranslating ? 'disabled' : ''}>
                                        ${translateButtonText}
                                    </button>
                                    <button class="translate-button translate-google">
                                        Відкрити в Google Translate
                                    </button>
                                </div>` : ''
                            }
                        </div>
                        ${this.bookData.description ? 
                            `<div class="book-description-container">
                                <p class="book-description">${descriptionToShow}</p>
                                ${this.translatedDescription && !this.showOriginal ? 
                                    `<p class="translation-notice">Переклад здійснено автоматично</p>` : ''}
                            </div>` : 
                            '<p class="book-description">Опис відсутній</p>'
                        }
                    </div>
                    
                    <div class="book-info-section">
                        <h2>Автори</h2>
                        ${this.bookData.authorDetails && this.bookData.authorDetails.length > 0 ? 
                            `<ul class="authors-list">
                                ${this.bookData.authorDetails.map(author => 
                                    `<li>${author.name}</li>`).join('')}
                            </ul>` : 
                            '<p>Інформація про авторів відсутня</p>'}
                    </div>
                    
                    <div class="book-info-section">
                        <h2>Видання</h2>
                        ${this.editions && this.editions.length > 0 ? 
                            `<ul class="editions-list">
                                ${this.editions.map(edition => 
                                    `<li>
                                        <strong>${edition.title}</strong>
                                        ${edition.publish_date ? ` (${edition.publish_date})` : ''}
                                        ${edition.isbn_13 ? `<br>ISBN-13: ${edition.isbn_13.join(', ')}` : ''}
                                        ${edition.isbn_10 ? `<br>ISBN-10: ${edition.isbn_10.join(', ')}` : ''}
                                    </li>`).join('')}
                            </ul>` : 
                            '<p>Інформація про видання відсутня</p>'}
                    </div>
                </div>
            </div>
        `;
        
        this.element.append(bookContainer);
        this.element.append(this.footer.render());
        
        const addToFavoritesButton = this.element.querySelector('.book-add-favorite');
        if (addToFavoritesButton) {
            addToFavoritesButton.addEventListener('click', this.addToFavorites);
        }
        
        const translateApiButton = this.element.querySelector('.translate-api');
        if (translateApiButton) {
            translateApiButton.addEventListener('click', this.translateDescription);
        }
        
        const translateGoogleButton = this.element.querySelector('.translate-google');
        if (translateGoogleButton) {
            translateGoogleButton.addEventListener('click', this.openTranslate);
        }
        
        return this.element;
    }
}