#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка статуса Minikube
if ! minikube status > /dev/null 2>&1; then
    log "Minikube не запущен. Запускаем..."
    minikube start
    if [ $? -ne 0 ]; then
        error "Не удалось запустить Minikube. Прерываем выполнение."
        exit 1
    fi
fi

# Настройка Docker для использования Minikube's Docker daemon
log "Настройка Docker для использования Minikube..."
eval $(minikube docker-env)
if [ $? -ne 0 ]; then
    error "Не удалось настроить Docker. Прерываем выполнение."
    exit 1
fi

# Сборка образа
log "Сборка Docker-образа..."
docker build -t ui-test-framework:latest .
if [ $? -ne 0 ]; then
    error "Не удалось собрать Docker-образ. Прерываем выполнение."
    exit 1
fi

# Параметры запуска
TEST_ENV=${1:-local}
SINGLE_TEST=${2:-""}

log "Окружение для тестов: ${TEST_ENV}"

# Применение ConfigMap
log "Создание ConfigMap..."
kubectl create configmap test-framework-config \
  --from-literal=TEST_ENV=${TEST_ENV} \
  --from-literal=HEADLESS=true \
  --from-literal=DEBUG_LOGS=true \
  --dry-run=client -o yaml | kubectl apply -f -

# Создание временного Job манифеста с улучшенной отладкой
cat > k8s/debug-job.yaml << EOF
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
          echo "Рабочая директория: \$(pwd)"
          echo "Список файлов в директории:"
          ls -la
          echo "Версия Node.js: \$(node -v)"
          echo "Версия npm: \$(npm -v)"
          echo "Версия npx: \$(npx --version)"
          echo "Поиск файла конфигурации:"
          find / -name "playwright.k8s.config.ts" 2>/dev/null || echo "Файл конфигурации не найден"
          echo "PATH: \$PATH"
          echo "=============================="
          
          if [ -f "./playwright.k8s.config.ts" ]; then
            echo "Запуск тестов с локальным конфигом..."
            /usr/local/bin/xvfb-run-safe npx playwright test --config=./playwright.k8s.config.ts
          else
            echo "Поиск конфига в других местах..."
            CONFIG_PATH=\$(find / -name "playwright.k8s.config.ts" 2>/dev/null | head -1)
            if [ -n "\$CONFIG_PATH" ]; then
              echo "Найден конфиг: \$CONFIG_PATH"
              /usr/local/bin/xvfb-run-safe npx playwright test --config="\$CONFIG_PATH"
            else
              echo "Конфиг не найден, пробуем запуск без указания конфига..."
              /usr/local/bin/xvfb-run-safe npx playwright test
            fi
          fi
        env:
        - name: DEBUG
          value: "pw:api"
        - name: TEST_ENV
          value: "${TEST_ENV}"
        - name: DISPLAY
          value: ":99"
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
EOF

# Удаление предыдущего Job, если он существует
log "Удаление предыдущего Job..."
kubectl delete job ui-test-job --ignore-not-found

# Запуск Job
log "Запуск тестового Job с расширенной отладкой..."
kubectl apply -f k8s/debug-job.yaml
if [ $? -ne 0 ]; then
    error "Не удалось создать Job. Прерываем выполнение."
    exit 1
fi

# Получение логов в реальном времени
log "Запуск выполнен. Ожидание создания Pod..."
sleep 5

# Получение имени Pod
POD_NAME=$(kubectl get pods -l job-name=ui-test-job -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

# Если Pod создан, выводим логи в реальном времени
if [ -n "$POD_NAME" ]; then
    log "Pod создан: $POD_NAME"
    log "Логи выполнения тестов (Ctrl+C для остановки просмотра логов, тесты продолжат выполняться):"
    kubectl logs -f $POD_NAME || true
else
    warn "Pod еще не создан или имеет проблемы. Проверьте статус командой: kubectl get pods"
fi

# Ждем завершения Job
log "Ожидание завершения тестов..."
kubectl wait --for=condition=complete job/ui-test-job --timeout=30m || true

# Проверка статуса Job
JOB_STATUS=$(kubectl get job ui-test-job -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}' 2>/dev/null)
if [ "$JOB_STATUS" == "True" ]; then
    log "Job успешно завершен!"
else
    warn "Job не был успешно завершен. Проверьте наличие