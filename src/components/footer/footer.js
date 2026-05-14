import { DivComponent } from '../../common/div-component.js';

export class Footer extends DivComponent {
    constructor() {
        super();
    }

    render() {
        this.element = document.createElement('footer');
        this.element.classList.add('footer');
        this.element.innerHTML = `
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Контактна інформація</h3>
                    <p>Email: contact@booklibrary.com</p>
                    <p>Телефон: +380 123 456 789</p>
                </div>
                <div class="footer-section">
                    <h3>Соціальні мережі</h3>
                    <p>
                        <a href="https://facebook.com" target="_blank">Facebook</a> | 
                        <a href="https://twitter.com" target="_blank">Twitter</a> | 
                        <a href="https://instagram.com" target="_blank">Instagram</a>
                    </p>
                </div>
                <div class="footer-section">
                    <h3>Про нас</h3>
                    <p>Онлайн бібліотека - ваш найкращий ресурс для пошуку книг.</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Онлайн Бібліотека. Всі права захищені.</p>
            </div>
        `;
        
        return this.element;
    }
} 