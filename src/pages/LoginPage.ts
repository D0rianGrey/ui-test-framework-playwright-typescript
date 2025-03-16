import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Селекторы элементов
  private readonly usernameInput = '#user-name';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly errorMessage = '.error-message-container';

  constructor(page: Page) {
    // Передаем URL страницы логина
    super(page, 'https://www.saucedemo.com/');
  }

  /**
   * Выполняет вход в систему с указанными учетными данными
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigate();
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.loginButton);
  }

  /**
   * Проверяет, отображается ли сообщение об ошибке
   */
  async isErrorDisplayed(): Promise<boolean> {
    return this.isElementVisible(this.errorMessage);
  }

  /**
   * Получает текст сообщения об ошибке
   */
  async getErrorText(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}