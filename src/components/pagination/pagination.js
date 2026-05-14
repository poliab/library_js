import { DivComponent } from '../../common/div-component.js';

export class Pagination extends DivComponent {
    constructor(appState) {
        super();
        this.appState = appState;
    }

    #goToPrevPage = (event) => {
        event.preventDefault();
        if (this.appState.currentPage > 1) {
            // Уменьшаем номер текущей страницы
            this.appState.currentPage--;
            console.log(`Going to previous page: ${this.appState.currentPage}`);
            
            // Вызываем onChange для перерисовки
            if (this.appState.onChange) {
                this.appState.onChange();
            }
        }
    }

    #goToNextPage = (event) => {
        event.preventDefault();
        console.log(`Attempting to go to next page from ${this.appState.currentPage}/${this.appState.totalPages}`);
        if (this.appState.currentPage < this.appState.totalPages) {
            // Увеличиваем номер текущей страницы
            this.appState.currentPage++;
            console.log(`Going to next page: ${this.appState.currentPage}`);
            
            // Вызываем onChange для перерисовки
            if (this.appState.onChange) {
                this.appState.onChange();
            }
        }
    }

    render() {
        this.element.classList.add('pagination');
        this.element.innerHTML = '';
        
        // Не показываем пагинацию, если страница всего одна
        if (this.appState.totalPages <= 1) {
            return this.element;
        }
        
        console.log(`[PAGINATION RENDER] currentPage: ${this.appState.currentPage}, totalPages: ${this.appState.totalPages}`);
        
        this.element.innerHTML = `
            <button class="pagination__prev ${this.appState.currentPage === 1 ? 'pagination__button--disabled' : ''}">
                ← Попередня
            </button>
            <div class="pagination__info">
                Сторінка ${this.appState.currentPage} з ${this.appState.totalPages}
            </div>
            <button class="pagination__next ${this.appState.currentPage === this.appState.totalPages ? 'pagination__button--disabled' : ''}">
                Наступна →
            </button>
        `;
        
        // Добавляем обработчики событий
        const prevButton = this.element.querySelector('.pagination__prev');
        const nextButton = this.element.querySelector('.pagination__next');
        
        if (prevButton && this.appState.currentPage > 1) {
            prevButton.addEventListener('click', this.#goToPrevPage);
        }
        
        if (nextButton && this.appState.currentPage < this.appState.totalPages) {
            nextButton.addEventListener('click', this.#goToNextPage);
        }
        
        return this.element;
    }
}