// playwright.docker.config.ts - для запуска в обычном Docker
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './src/tests',
    timeout: 30000,
    reporter: [
        ['html'],
        ['list'],
        ['allure-playwright']
    ],
    use: {
        browserName: 'chromium',
        headless: true, // Всегда headless в Docker
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        video: 'on-first-retry'
    },
    projects: [
        {
            name: 'Chrome',
            use: { browserName: 'chromium' }
        }
    ]
};

export default config;