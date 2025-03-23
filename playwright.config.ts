import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

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
        headless: false,
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