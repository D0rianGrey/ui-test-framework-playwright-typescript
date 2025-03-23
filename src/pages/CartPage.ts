import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/environment';

export class CartPage extends BasePage {
  // Селекторы элементов
  private readonly cartItems = '.cart_item';
  private readonly itemName = '.inventory_item_name';
  private readonly itemPrice = '.inventory_item_price';
  private readonly removeButton = 'button[data-test^="remove"]';
  private readonly checkoutButton = '#checkout';
  private readonly continueShoppingButton = '#continue-shopping';

  constructor(page: Page) {
    super(page, `${config.baseUrl}/cart.html`);
  }

  /**
   * Получает список наименований товаров в корзине
   */
  async getCartItemNames(): Promise<string[]> {
    const itemNames = this.page.locator(this.itemName);
    return await itemNames.allTextContents();
  }

  /**
   * Получает количество товаров в корзине
   */
  async getCartItemCount(): Promise<number> {
    const items = this.page.locator(this.cartItems);
    return await items.count();
  }

  /**
   * Удаляет товар из корзины по индексу
   */
  async removeItemByIndex(index: number): Promise<void> {
    const removeButtons = this.page.locator(this.removeButton);
    const count = await removeButtons.count();
    
    if (index >= 0 && index < count) {
      await removeButtons.nth(index).click();
    } else {
      throw new Error(`Индекс ${index} вне диапазона. В корзине ${count} товаров.`);
    }
  }

  /**
   * Удаляет товар из корзины по имени
   */
  async removeItemByName(name: string): Promise<void> {
    const itemNames = this.page.locator(this.itemName);
    const count = await itemNames.count();
    
    for (let i = 0; i < count; i++) {
      const itemName = await itemNames.nth(i).textContent();
      if (itemName?.includes(name)) {
        await this.removeItemByIndex(i);
        return;
      }
    }
    
    throw new Error(`Товар с названием "${name}" не найден в корзине.`);
  }

  /**
   * Переходит к оформлению заказа
   */
  async checkout(): Promise<void> {
    await this.clickElement(this.checkoutButton);
  }

  /**
   * Продолжает покупки (возвращается к списку товаров)
   */
  async continueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
  }
}