#!/bin/bash

# Проверяем наличие отчета
if [ ! -f "allure-report/index.html" ]; then
  echo "Отчет не найден. Пытаемся сгенерировать..."
  
  # Если есть только результаты, но нет отчета
  if [ -d "allure-results" ] && [ "$(ls -A allure-results)" ]; then
    npx allure generate allure-results -o allure-report --clean
  else
    echo "Ошибка: директория allure-results пуста или не существует."
    echo "Запустите тесты в Docker сначала."
    exit 1
  fi
fi

# Устанавливаем правильные права
chmod -R 755 allure-report

# Открываем отчет
npx allure open allure-report