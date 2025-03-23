import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/environment';

export class ProductsPage extends BasePage {
    // Селекторы элементов
    private readonly productsList = '.inventory_item';
    private readonly productTitle = '.inventory_item_name';
    private readonly productPrice = '.inventory_item_price';
    private readonly addToCartButton = 'button[data-test^="add-to-cart"]';
    private readonly removeButton = 'button[data-test^="remove"]';
    private readonly shoppingCartBadge = '.shopping_cart_badge';
    private readonly shoppingCartLink = '.shopping_cart_link';
    private readonly productSort = '.product_sort_container';


    private readonly productCard = "div[data-test='inventory-item']"

    constructor(page: Page) {
        super(page, `${config.baseUrl}/inventory.html`);
    }

    /**
     * Получает список всех продуктов
     */
    async getProductsList(sortOrder?: 'asc' | 'desc'): Promise<string[]> {
        const products = this.page.locator(this.productTitle);
        const productNames = await products.allTextContents();

        if (!sortOrder) return productNames;

        if (sortOrder === 'asc') {
            return productNames.sort();
        } else {
            return productNames.sort().reverse();
        }
    }

    /**
     * Добавляет продукт в корзину по индексу
     */
    async addProductToCart(index: number): Promise<void> {
        const buttons = this.page.locator(this.addToCartButton);
        const count = await buttons.count();

        if (index >= 0 && index < count) {
            await buttons.nth(index).click();
        } else {
            throw new Error(`Индекс ${index} вне диапазона. Доступно ${count} продуктов.`);
        }
    }

    /**
     * Добавляет продукт в корзину по имени
     */
    async addProductToCartByName(name: string): Promise<void> {
        const productCards = this.page.locator(this.productCard);
        const count = await productCards.count();
        for (let i = 0; i < count; i++) {
            const title = await productCards.nth(i).locator(this.productTitle).textContent();
            if (title == name) {
                await productCards.nth(i).locator(this.addToCartButton).click();
                return;
            }
        }
        throw new Error(`Продукт с названием "${name}" не найден.`);
    }

    /**
     * Удаляет продукт из корзины по индексу
     */
    async removeProductFromCart(index: number): Promise<void> {
        const buttons = this.page.locator(this.removeButton);
        const count = await buttons.count();

        if (index >= 0 && index < count) {
            await buttons.nth(index).click();
        } else {
            throw new Error(`Индекс ${index} вне диапазона. Доступно ${count} продуктов для удаления.`);
        }
    }

    /**
     * Получает количество товаров в корзине
     */
    async getCartItemCount(): Promise<number> {
        try {
            const badge = this.page.locator(this.shoppingCartBadge);
            if (await badge.isVisible()) {
                const text = await badge.textContent();
                return text ? parseInt(text) : 0;
            }
            return 0;
        } catch {
            return 0;
        }
    }

    /**
     * Переходит на страницу корзины
     */
    async goToCart(): Promise<void> {
        await this.clickElement(this.shoppingCartLink);
    }

    /**
     * Сортирует продукты
     * @param option - опция сортировки: 'az', 'za', 'lohi', 'hilo'
     */
    async sortProducts(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
        await this.page.selectOption(this.productSort, option);
    }
}