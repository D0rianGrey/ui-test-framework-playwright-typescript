import { test } from '@playwright/test';
import path from 'path';

/**
 * Вспомогательный класс для работы с отчетами Allure
 */
export class AllureReporter {
  /**
   * Добавляет тег для теста
   */
  static addTag(tag: string): void {
    test.info().annotations.push({ type: 'tag', description: tag });
  }

  /**
   * Устанавливает серьезность теста
   */
  static setSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    test.info().annotations.push({ type: 'severity', description: severity });
  }

  /**
   * Устанавливает фичу/модуль для теста
   */
  static setFeature(feature: string): void {
    test.info().annotations.push({ type: 'feature', description: feature });
  }

  /**
   * Добавляет описание для теста
   */
  static setDescription(description: string): void {
    test.info().annotations.push({ type: 'description', description });
  }

  /**
   * Прикрепляет текстовое содержимое к отчету
   */
  static attachText(name: string, content: string): void {
    test.info().attachments.push({
      name,
      contentType: 'text/plain',
      body: Buffer.from(content)
    });
  }

  /**
   * Прикрепляет HTML-содержимое к отчету
   */
  static attachHtml(name: string, content: string): void {
    test.info().attachments.push({
      name,
      contentType: 'text/html',
      body: Buffer.from(content)
    });
  }

  /**
   * Прикрепляет JSON-содержимое к отчету
   */
  static attachJson(name: string, content: any): void {
    test.info().attachments.push({
      name,
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(content, null, 2))
    });
  }
}