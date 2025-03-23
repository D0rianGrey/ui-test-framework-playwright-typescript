import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { logger } from '../utils/Logger';

test.describe('Тесты для работы с продуктами с использованием фикстур', () => {
  
  test('Добавление продукта в корзину', async ({ page, standardUser }) => {
    logger.info(`Выполняем тест как ${standardUser.username}`);
    const productsPage = new ProductsPage(page);
    
    // Изначально корзина должна быть пуста
    expect(await productsPage.getCartItemCount()).toBe(0);
    
    // Добавляем первый продукт в корзину
    logger.info('Добавляем продукт в корзину');
    await productsPage.addProductToCart(0);
    
    // Проверяем, что в корзине 1 товар
    expect(await productsPage.getCartItemCount()).toBe(1);
  });

  test('Просмотр корзины после добавления товаров', async ({ page, standardUser }) => {
    logger.info(`Выполняем тест как ${standardUser.username}`);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    
    // Добавляем несколько товаров в корзину
    logger.info('Добавляем два продукта в корзину');
    await productsPage.addProductToCart(0);
    await productsPage.addProductToCart(1);
    
    // Переходим в корзину
    logger.info('Переходим в корзину');
    await productsPage.goToCart();
    
    // Проверяем количество товаров
    const itemCount = await cartPage.getCartItemCount();
    logger.info(`В корзине ${itemCount} товаров`);
    expect(itemCount).toBe(2);
  });
});