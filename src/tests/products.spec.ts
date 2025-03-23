import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { config } from '../config/environment';

test.describe('Тесты для работы с продуктами', () => {
    // Используем beforeEach для авторизации перед каждым тестом
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const { username, password } = config.credentials.standardUser;
        await loginPage.login(username, password);
        // Проверяем, что мы успешно авторизовались и перешли на страницу с продуктами
        await expect(page).toHaveURL(/inventory.html/);
    });

    test('Добавление продукта в корзину', async ({ page }) => {
        const productsPage = new ProductsPage(page);

        // Изначально корзина должна быть пуста
        expect(await productsPage.getCartItemCount()).toBe(0);

        // Добавляем первый продукт в корзину
        await productsPage.addProductToCart(0);

        // Проверяем, что в корзине 1 товар
        expect(await productsPage.getCartItemCount()).toBe(1);
    });

    test('Добавление и удаление продукта из корзины', async ({ page }) => {
        const productsPage = new ProductsPage(page);

        // Добавляем продукт в корзину
        await productsPage.addProductToCart(0);
        expect(await productsPage.getCartItemCount()).toBe(1);

        // Удаляем продукт из корзины
        await productsPage.removeProductFromCart(0);
        expect(await productsPage.getCartItemCount()).toBe(0);
    });

    test('Добавление нескольких продуктов в корзину и проверка в корзине', async ({ page }) => {
        const productsPage = new ProductsPage(page);
        const cartPage = new CartPage(page);

        // Получаем список продуктов
        const productsList = await productsPage.getProductsList('asc');

        // Добавляем первые два продукта в корзину
        const product1 = 'Sauce Labs Backpack';
        const product2 = 'Sauce Labs Bike Light';
        
        await productsPage.addProductToCartByName(product1);
        await productsPage.addProductToCartByName(product2);

        // Проверяем, что в корзине 2 товара
        expect(await productsPage.getCartItemCount()).toBe(2);

        // Переходим на страницу корзины
        await productsPage.goToCart();

        // Проверяем количество товаров в корзине
        expect(await cartPage.getCartItemCount()).toBe(2);

        // Проверяем наименования товаров в корзине
        const cartItems = await cartPage.getCartItemNames();
        expect(cartItems).toContain(product1);
        expect(cartItems).toContain(product2);
    });

    test('Сортировка продуктов', async ({ page }) => {
        const productsPage = new ProductsPage(page);

        // Получаем исходный список продуктов
        const initialProductsList = await productsPage.getProductsList();

        // Сортируем по имени от Z до A
        await productsPage.sortProducts('za');

        // Получаем отсортированный список
        const sortedProductsList = await productsPage.getProductsList();

        // Проверяем, что списки отличаются
        expect(sortedProductsList).not.toEqual(initialProductsList);

        // Проверяем, что список действительно отсортирован от Z до A
        const manualSortedList = [...initialProductsList].sort().reverse();
        expect(sortedProductsList).toEqual(manualSortedList);
    });
});