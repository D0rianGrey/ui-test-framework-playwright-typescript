import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './src/tests',
    timeout: 30000,
    reporter: [
        ['html'],
        ['allure-playwright']
    ],
    use: {
        browserName: 'chromium',
        headless: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' }
        }
    ],
    // Не останавливаться при ошибках
    maxFailures: 0
};

export default config;