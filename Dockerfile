FROM mcr.microsoft.com/playwright:latest

# Установка Java для Allure
RUN apt-get update && apt-get install -y openjdk-11-jre curl unzip

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

# Устанавливаем Playwright браузеры
RUN npx playwright install --with-deps chromium

# Запускаем тесты по умолчанию
CMD ["npx", "playwright", "test"]