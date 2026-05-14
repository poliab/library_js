/**
 * Базовий клас для всіх компонентів
 */
export class DivComponent {
    constructor() {
        this.element = document.createElement('div');
    }

    /**
     * Повертає HTML-елемент
     * @returns {HTMLDivElement}
     */
    render() {
        return this.element;
    }

    /**
     * Видаляє компонент
     */
    destroy() {
        this.element.remove();
    }
} 