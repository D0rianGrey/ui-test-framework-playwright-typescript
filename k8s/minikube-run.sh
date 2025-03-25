apiVersion: batch/v1
kind: Job
metadata:
  name: ui-test-job
spec:
  template:
    spec:
      containers:
      - name: test-runner
        image: ui-test-framework:latest
        imagePullPolicy: Never
        command: ["/bin/bash", "-c"]
        args: 
        - |
          echo "=== Отладочная информация ==="
          echo "Рабочая директория: $(pwd)"
          echo "Список файлов в директории:"
          ls -la
          echo "Версия Node.js: $(node -v)"
          echo "Версия npm: $(npm -v)"
          echo "PATH: $PATH"
          echo "=============================="
          
          # Запуск тестов только с репортером Allure, без автозапуска HTML репортера
          echo "=== Запуск тестов ==="
          TEST_ENV=local npx playwright test --config=playwright.k8s.config.ts --reporter=list,allure-playwright
          TEST_STATUS=$?
          
          echo "=== Результаты тестов ==="
          ls -la ./allure-results || echo "Директория allure-results не найдена"
          
          echo "=== Генерация отчета Allure ==="
          if [ -d "./allure-results" ] && [ "$(ls -A ./allure-results 2>/dev/null)" ]; then
            echo "Генерация отчета из результатов..."
            allure generate ./allure-results -o ./allure-report --clean
            echo "Содержимое отчета:"
            ls -la ./allure-report || echo "Ошибка: отчет не создан"
          else
            echo "Предупреждение: папка allure-results пуста или не существует!"
            mkdir -p ./allure-results
            echo '{"name":"dummy"}' > ./allure-results/dummy.json
            echo "Создание минимального отчета..."
            allure generate ./allure-results -o ./allure-report --clean
          fi
          
          # Создаем архив отчета для упрощения копирования
          cd /app
          tar -czf allure-report.tar.gz allure-report/
          echo "Архив отчета создан: /app/allure-report.tar.gz"
          
          echo "=== Завершено со статусом: $TEST_STATUS ==="
          exit $TEST_STATUS
        env:
        - name: DEBUG
          value: "pw:api"
        - name: TEST_ENV
          value: "local"
        - name: DISPLAY
          value: ":99"
        - name: CI
          value: "true"  # Устанавливаем CI=true, чтобы избежать запуска интерактивных отчетов
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: results-volume
          mountPath: /app/allure-results
        - name: reports-volume
          mountPath: /app/allure-report
      volumes:
      - name: results-volume
        emptyDir: {}
      - name: reports-volume
        emptyDir: {}
      restartPolicy: Never
  backoffLimit: 3