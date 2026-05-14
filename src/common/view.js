/**
 * Базовий клас для всіх подань (сторінок)
 */
export class View {
    constructor(appState) {
        this.appState = appState;
        this.element = document.createElement('div');
        this.element.classList.add('container');
    }

    /**
     * Повертає HTML-елемент
     * @returns {HTMLDivElement}
     */
    render() {
        return this.element;
    }

    /**
     * Видаляє представлення
     */
    destroy() {
        this.element.remove();
    }
} 