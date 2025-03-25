#!/bin/bash

# Получение имени Pod
POD_NAME=$(kubectl get pods -l job-name=ui-test-job -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$POD_NAME" ]; then
    echo "Pod не найден! Проверьте, запущен ли Job."
    exit 1
fi

echo "==== Диагностика проблемы с отчетом Allure ===="
echo "Pod: $POD_NAME"

# Проверка структуры контейнера
echo "1. Проверка структуры директорий в контейнере..."
kubectl exec -it $POD_NAME -- ls -la /app
echo "Содержимое директории allure-results:"
kubectl exec -it $POD_NAME -- ls -la /app/allure-results || echo "Директория не существует"
echo "Содержимое директории allure-report:"
kubectl exec -it $POD_NAME -- ls -la /app/allure-report || echo "Директория не существует"

# Проверка наличия результатов тестов
echo "2. Проверка наличия результатов тестов..."
kubectl exec -it $POD_NAME -- find /app -name "*.json" | grep -i allure

# Попытка генерации отчета в контейнере
echo "3. Попытка генерации отчета в контейнере..."
kubectl exec -it $POD_NAME -- bash -c "cd /app && allure generate allure-results -o allure-report --clean" || echo "Ошибка генерации отчета"

# Создание директории для временных результатов
echo "4. Копирование результатов тестов локально..."
rm -rf temp-allure-results
mkdir -p temp-allure-results
kubectl cp $POD_NAME:/app/allure-results ./temp-allure-results || echo "Ошибка копирования результатов"

# Проверка скопированных результатов
echo "Проверка скопированных результатов тестов:"
ls -la ./temp-allure-results

# Генерация отчета локально
echo "5. Генерация отчета локально..."
if [ -d "./temp-allure-results" ] && [ "$(ls -A ./temp-allure-results 2>/dev/null)" ]; then
    rm -rf allure-report-k8s
    allure generate ./temp-allure-results -o ./allure-report-k8s --clean
    echo "Отчет сгенерирован в ./allure-report-k8s:"
    ls -la ./allure-report-k8s
else
    echo "Директория с результатами пуста или не существует."
fi

echo "==== Диагностика завершена ===="
echo "Для открытия отчета выполните: allure open ./allure-report-k8s"