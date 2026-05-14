import { DivComponent } from '../../common/div-component.js';
import { Card } from './card.js';

export class CardList extends DivComponent {
    constructor(books, appState) {
        super();
        this.books = books;
        this.appState = appState;
    }

    render() {
        this.element.classList.add('card-list');
        
        if (this.books.length === 0) {
            this.element.innerHTML = `
                <div class="card-list__empty">
                    Книги не знайдено
                </div>
            `;
            return this.element;
        }
        
        this.element.innerHTML = '';
        
        for (const book of this.books) {
            const card = new Card(book, this.appState);
            this.element.append(card.render());
        }
        
        return this.element;
    }
} 