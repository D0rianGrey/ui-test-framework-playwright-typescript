// playwright.k8s.config.ts - для запуска в Kubernetes
import { PlaywrightTestConfig } from '@playwright/test';

// Получаем номер шарда и общее количество шардов из переменных окружения для параллельного запуска
const testShard = process.env.TEST_SHARD ? parseInt(process.env.TEST_SHARD) : undefined;
const totalShards = process.env.TEST_SHARDS_TOTAL ? parseInt(process.env.TEST_SHARDS_TOTAL) : undefined;

const config: PlaywrightTestConfig = {
    testDir: './src/tests',
    timeout: 60000,  // Увеличенный таймаут для Kubernetes
    reporter: [
        ['html'],
        ['list'],
        ['allure-playwright', {
            detail: true,
            outputFolder: 'allure-results',
            suiteTitle: false
        }]
    ],
    use: {
        browserName: 'chromium',
        headless: true,
        launchOptions: {
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--disable-gpu'
            ]
        },
        // Дополнительные настройки для стабильной работы в Kubernetes
        navigationTimeout: 45000,
        actionTimeout: 30000,
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' }
        }
    ],
    // Настройка шардирования для параллельного запуска в кластере
    shard: testShard && totalShards ? {
        current: testShard,
        total: totalShards
    } : undefined,
    // Защита от падения тестов из-за временных ошибок
    retries: process.env.CI ? 1 : 0,
    workers: 1, // Один воркер на шард в Kubernetes
    maxFailures: 0 // Не останавливаться при ошибках
};

export default config;