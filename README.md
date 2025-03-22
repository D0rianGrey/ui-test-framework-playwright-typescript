# Фреймворк автоматизированного UI-тестирования

Фреймворк для автоматизированного тестирования пользовательского интерфейса, построенный на основе TypeScript, Playwright и других современных технологий.

## Технологический стек

* **Язык программирования**: TypeScript
* **Фреймворк для UI-тестирования**: Playwright
* **Система контроля версий**: GitHub
* **CI/CD**: GitHub Actions
* **Система отчетности**: Allure Reports
* **Среда выполнения тестов**: Kubernetes

## Установка и настройка

### Предварительные требования

* Node.js (рекомендуется версия 16+)
* npm или yarn
* Git

### Установка

1. Клонировать репозиторий:

```bash
git clone https://github.com/D0rianGrey/ui-test-framework-playwright-typescript.git
cd ui-test-framework-playwright-typescript
```

2. Установить зависимости:

```bash
npm install
```

3. Установить браузеры для Playwright:

```bash
npx playwright install
```

## Структура проекта

```
ui-test-framework-playwright-typescript/
├── src/
│   ├── config/            # Конфигурации для разных окружений
│   ├── fixtures/          # Фикстуры для тестов
│   ├── pages/             # Page Objects
│   ├── tests/             # Тестовые файлы
│   └── utils/             # Вспомогательные утилиты
├── playwright.config.ts   # Конфигурация Playwright
├── package.json           # Зависимости проекта
└── tsconfig.json          # Конфигурация TypeScript
```

## Запуск тестов

### Базовые команды

```bash
# Запуск всех тестов
npm test
# или
npx playwright test

# Запуск тестов с открытым браузером
npm run test:headed
# или
npx playwright test --headed

# Запуск в интерактивном режиме UI
npm run test:ui
# или
npx playwright test --ui

# Просмотр отчета
npm run report
# или
npx playwright show-report
```

### Запуск конкретных тестов

```bash
# Запуск тестов из конкретного файла
npx playwright test src/tests/login.spec.ts

# Запуск конкретного теста (по названию)
npx playwright test -g "Успешная авторизация"
```

### Фильтрация тестов

```bash
# Запуск тестов с определенным тегом
npx playwright test --grep @smoke

# Запуск тестов, исключая определенный тег
npx playwright test --grep-invert @slow

# Запуск тестов только для определенного браузера
npx playwright test --project=Chrome
```

### Параллелизация

```bash
# Запуск с указанным количеством параллельных воркеров
npx playwright test --workers=5

# Запуск всех тестов параллельно
npx playwright test --fully-parallel

# Запуск тестов последовательно
npx playwright test --workers=1
```

### Настройка отчетов

```bash
# Генерация HTML-отчета
npx playwright test --reporter=html

# Отображение результатов в виде точек
npx playwright test --reporter=dot

# Отображение результатов в виде списка
npx playwright test --reporter=list
```

### Отладка

```bash
# Запуск в режиме отладки
npx playwright test --debug

# Запись трассировки для всех тестов
npx playwright test --trace on

# Запись видео для всех тестов
npx playwright test --video on

# Запуск с расширенной отладочной информацией
PWDEBUG=1 npx playwright test
```

### Повторные попытки и таймауты

```bash
# Повторять неудачные тесты до 3 раз
npx playwright test --retries=3

# Установка общего таймаута (в миллисекундах)
npx playwright test --timeout=60000
```

### Среда тестирования

```bash
# Запуск тестов в определенной среде
TEST_ENV=prod npx playwright test
```

### Комбинирование параметров

```bash
# Запуск smoke-тестов в Chrome с видимым браузером
npx playwright test --grep @smoke --project=Chrome --headed

# Запуск тестов без UI с 3 повторами и HTML-отчетом
npx playwright test --retries=3 --reporter=html
```

## Создание тестов

### Базовый пример теста

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('Базовый тест авторизации', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory.html/);
});
```

### Использование тегов

```typescript
test('Тест для дымового тестирования', async ({ page }) => {
  test.info().annotations.push({ type: 'tag', description: 'smoke' });
  // код теста...
});
```

### Использование фикстур

```typescript
import { test } from '../fixtures/auth.fixture';

test('Тест с авторизацией', async ({ page, standardUser }) => {
  // standardUser - объект с данными авторизованного пользователя
  // код теста для авторизованного пользователя...
});
```

## Настройка GitHub Actions

В процессе разработки. Будет добавлена конфигурация для CI/CD через GitHub Actions.

## Интеграция с Allure Reports

В процессе разработки. Будет добавлена интеграция с Allure Reports для более детальной отчетности.

## Запуск в Kubernetes

В процессе разработки. Будет добавлена конфигурация для запуска тестов в Kubernetes.

## Примечания

* Используйте `logger` из `src/utils/Logger.ts` для логирования в тестах
* Следуйте паттерну Page Object для структурирования взаимодействия с веб-страницами
* Используйте фикстуры для повторно используемой функциональности
* Добавляйте теги к тестам для удобной фильтрации
