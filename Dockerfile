FROM mcr.microsoft.com/playwright:latest

# Установка дополнительных зависимостей для headless режима
RUN apt-get update && apt-get install -y \
    xvfb \
    openjdk-11-jre \
    curl \
    unzip \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libu2f-udev \
    libvulkan1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2

# Установка Allure
RUN curl -o allure-commandline.zip -Ls https://repo.maven.apache.org/maven2/io/qameta/allure/allure-commandline/2.23.1/allure-commandline-2.23.1.zip \
    && unzip allure-commandline.zip -d /opt/ \
    && rm allure-commandline.zip \
    && ln -s /opt/allure-2.23.1/bin/allure /usr/bin/allure

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем Playwright браузеры без зависимостей
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npx playwright install chromium

# Создание скрипта-обертки для запуска тестов через xvfb
RUN echo '#!/bin/bash\nxvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" "$@"' > /usr/local/bin/xvfb-run-safe \
    && chmod +x /usr/local/bin/xvfb-run-safe

ENTRYPOINT ["/usr/local/bin/xvfb-run-safe"]
CMD ["npm", "test"]

# # Запускаем тесты по умолчанию
# CMD ["npx", "playwright", "test"]