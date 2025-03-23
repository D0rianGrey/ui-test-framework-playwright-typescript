import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { config } from '../config/environment';
import { AllureReporter } from '../utils/AllureReporter';

test.describe('Демонстрация интеграции с Allure', () => {

    test('Подробный отчет о тесте авторизации', async ({ page }) => {
        // Добавляем метаданные для отчета
        AllureReporter.setFeature('Авторизация');
        AllureReporter.setSeverity('critical');
        AllureReporter.addTag('smoke');
        AllureReporter.setDescription('Тест проверяет процесс авторизации стандартного пользователя');

        // Создаем объект страницы логина
        const loginPage = new LoginPage(page);

        // Выполняем авторизацию
        await test.step('Авторизация пользователя', async () => {
            const { username, password } = config.credentials.standardUser;
            await loginPage.login(username, password);
        });

        // Проверяем успешность авторизации
        await test.step('Проверка успешности авторизации', async () => {
            await expect(page).toHaveURL(/inventory.html/);

            // Прикрепляем URL как текст
            AllureReporter.attachText('URL после авторизации', page.url());
        });

        // Получаем список продуктов
        await test.step('Получение списка продуктов', async () => {
            const productsPage = new ProductsPage(page);
            const productsList = await productsPage.getProductsList();

            // Прикрепляем список продуктов как JSON
            AllureReporter.attachJson('Список продуктов', productsList);

            // Проверяем наличие продуктов
            expect(productsList.length).toBeGreaterThan(0);
        });
    });

    test('Тест с различными статусами шагов', async ({ page }) => {
        AllureReporter.setFeature('Авторизация');
        AllureReporter.setSeverity('normal');

        try {
            // Успешный шаг
            await test.step('Открываем страницу авторизации', async () => {
                await page.goto(config.baseUrl);

                // Проверяем URL страницы
                expect(page.url()).toContain('saucedemo.com');
            });

            // Генерируем ошибку для демонстрации
            await test.step('Проверка с возможной ошибкой', async () => {
                if (Math.random() > 0.5) {
                    throw new Error('Демонстрационная ошибка для Allure');
                }
            });

        } catch (error) {
            // Логируем ошибку
            AllureReporter.attachText('Ошибка в тесте', String(error));

            throw error; // Пробрасываем ошибку дальше для правильного отображения в отчете
        }
    });
});