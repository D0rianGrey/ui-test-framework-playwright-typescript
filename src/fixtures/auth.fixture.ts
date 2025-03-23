import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../config/environment';
import { logger } from '../utils/Logger';

// Интерфейс для пользовательских данных
interface UserData {
  username: string;
  password: string;
}

// Расширяем базовую фикстуру, добавляя логин как стандартный пользователь
export const test = base.extend({
  standardUser: async ({ page }, use) => {
    logger.info('Авторизуемся как стандартный пользователь');
    const loginPage = new LoginPage(page);
    const { username, password } = config.credentials.standardUser;
    await loginPage.login(username, password);
    
    // Передаем данные пользователя для использования в тесте
    await use({ username, password });
    
    logger.info('Завершаем авторизацию стандартного пользователя');
  }
});

// Фикстура для авторизации с любым пользователем
export async function loginAsUser(page: any, userData: UserData): Promise<void> {
  logger.info(`Авторизуемся как пользователь ${userData.username}`);
  const loginPage = new LoginPage(page);
  await loginPage.login(userData.username, userData.password);
}

// Экспортируем также базовый тест для совместимости
export { expect } from '@playwright/test';