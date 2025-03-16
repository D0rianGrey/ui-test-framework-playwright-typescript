import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../config/environment';

test.describe('Авторизация в SauceDemo', () => {
  test('Успешная авторизация с правильными учетными данными', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { username, password } = config.credentials.standardUser;
    
    await loginPage.login(username, password);
    
    // Проверяем, что после успешного входа мы перешли на страницу продуктов
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('Неуспешная авторизация с заблокированным пользователем', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const { username, password } = config.credentials.lockedUser;
    
    await loginPage.login(username, password);
    
    // Проверяем, что отображается сообщение об ошибке
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Epic sadface: Sorry, this user has been locked out');
  });
});