import { Page, Locator, expect, test } from '@playwright/test';
import { logger } from '../utils/Logger';

export class BasePage {
    readonly page: Page;
    readonly url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async navigate(): Promise<void> {
        return test.step(`Переход на страницу: ${this.url}`, async () => {
            logger.info(`Переход на страницу: ${this.url}`);
            await this.page.goto(this.url);
        });
    }

    async getElement(selector: string): Promise<Locator> {
        return test.step(`Получение элемента: ${selector}`, async () => {
            logger.debug(`Получение элемента: ${selector}`);
            return this.page.locator(selector);
        });
    }

    async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
        return test.step(`Ожидание элемента: ${selector}`, async () => {
            logger.debug(`Ожидание элемента: ${selector}, таймаут: ${timeout}мс`);
            const element = this.page.locator(selector);
            await element.waitFor({ state: 'visible', timeout });
            return element;
        });
    }

    async clickElement(selector: string): Promise<void> {
        return test.step(`Клик по элементу: ${selector}`, async () => {
            logger.info(`Клик по элементу: ${selector}`);
            const element = await this.waitForElement(selector);
            await element.click();
        });
    }

    async fillInput(selector: string, text: string): Promise<void> {
        return test.step(`Заполнение поля ${selector}`, async () => {
            logger.info(`Заполнение поля ${selector} значением: ${text}`);
            const element = await this.waitForElement(selector);
            await element.fill(text);
        });
    }

    async getText(selector: string): Promise<string> {
        return test.step(`Получение текста элемента: ${selector}`, async () => {
            logger.debug(`Получение текста элемента: ${selector}`);
            const element = await this.waitForElement(selector);
            return element.innerText();
        });
    }

    async isElementVisible(selector: string): Promise<boolean> {
        return test.step(`Проверка видимости элемента: ${selector}`, async () => {
            logger.debug(`Проверка видимости элемента: ${selector}`);
            const element = this.page.locator(selector);
            return element.isVisible();
        });
    }

    async expectElementToBeVisible(selector: string): Promise<void> {
        return test.step(`Проверка, что элемент виден: ${selector}`, async () => {
            logger.info(`Проверка, что элемент виден: ${selector}`);
            const element = this.page.locator(selector);
            await expect(element).toBeVisible();
        });
    }

    async takeScreenshot(name: string): Promise<string> {
        return test.step(`Создание скриншота: ${name}`, async () => {
            logger.info(`Создание скриншота: ${name}`);
            const path = `./screenshots/${name}_${Date.now()}.png`;
            await this.page.screenshot({ path });
            return path;
        });
    }

    async selectOption(selector: string, value: string): Promise<void> {
        return test.step(`Выбор опции '${value}' в селекторе ${selector}`, async () => {
            logger.info(`Выбор опции '${value}' в селекторе ${selector}`);
            const element = await this.waitForElement(selector);
            await element.selectOption(value);
        });
    }

    async getAttribute(selector: string, attributeName: string): Promise<string | null> {
        return test.step(`Получение атрибута '${attributeName}' у элемента ${selector}`, async () => {
            logger.debug(`Получение атрибута '${attributeName}' у элемента ${selector}`);
            const element = await this.waitForElement(selector);
            return element.getAttribute(attributeName);
        });
    }

    async count(selector: string): Promise<number> {
        return test.step(`Подсчет элементов по селектору ${selector}`, async () => {
            logger.debug(`Подсчет элементов по селектору ${selector}`);
            const elements = this.page.locator(selector);
            return elements.count();
        });
    }

    async waitForPageLoad(timeout = 30000): Promise<void> {
        return test.step(`Ожидание загрузки страницы`, async () => {
            logger.debug(`Ожидание загрузки страницы, таймаут: ${timeout}мс`);
            await this.page.waitForLoadState('load', { timeout });
            await this.page.waitForLoadState('domcontentloaded', { timeout });
            await this.page.waitForLoadState('networkidle', { timeout });
        });
    }

    async pressKey(key: string): Promise<void> {
        return test.step(`Нажатие клавиши: ${key}`, async () => {
            logger.info(`Нажатие клавиши: ${key}`);
            await this.page.keyboard.press(key);
        });
    }

    async hover(selector: string): Promise<void> {
        return test.step(`Наведение на элемент: ${selector}`, async () => {
            logger.info(`Наведение на элемент: ${selector}`);
            const element = await this.waitForElement(selector);
            await element.hover();
        });
    }

    async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
        return test.step(`Перетаскивание с ${sourceSelector} на ${targetSelector}`, async () => {
            logger.info(`Перетаскивание с ${sourceSelector} на ${targetSelector}`);
            const sourceElement = await this.waitForElement(sourceSelector);
            const targetElement = await this.waitForElement(targetSelector);

            await sourceElement.dragTo(targetElement);
        });
    }
}