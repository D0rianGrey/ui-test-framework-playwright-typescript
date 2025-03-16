import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    readonly page: Page;
    readonly url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async navigate(): Promise<void> {
        await this.page.goto(this.url);
    }

    async getElement(selector: string): Promise<Locator> {
        return this.page.locator(selector);
    }

    async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout });
        return element;
    }

    async clickElement(selector: string): Promise<void> {
        const element = await this.waitForElement(selector);
        await element.click();
    }

    async fillInput(selector: string, text: string): Promise<void> {
        const element = await this.waitForElement(selector);
        await element.fill(text);
    }

    async getText(selector: string): Promise<string> {
        const element = await this.waitForElement(selector);
        return element.innerText();
    }

    async isElementVisible(selector: string): Promise<boolean> {
        const element = this.page.locator(selector);
        return element.isVisible();
    }

    async expectElementToBeVisible(selector: string): Promise<void> {
        const element = this.page.locator(selector);
        await expect(element).toBeVisible();
    }
}