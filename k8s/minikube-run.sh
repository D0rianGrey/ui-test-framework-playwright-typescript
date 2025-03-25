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
          echo "Версия npx: \$(npx --version || echo 'npx не найден')"
          echo "Поиск файла конфигурации:"
          find / -name "playwright.k8s.config.ts" 2>/dev/null || echo "Файл конфигурации не найден"
          echo "PATH: \$PATH"
          echo "=============================="
          
          echo "=== Запуск тестов ==="
          npm test -- --config=playwright.k8s.config.ts
          
          echo "=== Проверка папки с результатами тестов ==="
          ls -la allure-results || echo "Папка allure-results не найдена"
          
          echo "=== Генерация отчета Allure ==="
          if [ -d "allure-results" ] && [ "\$(ls -A allure-results 2>/dev/null)" ]; then
            allure generate allure-results -o allure-report --clean
            echo "Отчет Allure сгенерирован:"
            ls -la allure-report || echo "Папка allure-report не найдена"
          else
            echo "Папка allure-results пуста или не существует"
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
    warn "Job не был успешно завершен. Проверьте наличие ошибок:"
    kubectl describe job ui-test-job
    kubectl describe pod $POD_NAME
fi

# Получение имени Pod (снова, на случай если раньше его не было)
POD_NAME=$(kubectl get pods -l job-name=ui-test-job -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

# Проверка наличия Pod
if [ -z "$POD_NAME" ]; then
    error "Pod не найден! Не удается получить отчет."
    exit 1
fi

# Создание директории для отчета, если она не существует
mkdir -p allure-report-k8s

# Копирование отчета Allure из Pod
log "Копирование отчета Allure из Pod..."
kubectl cp "$POD_NAME:/app/allure-report" "./allure-report-k8s" || true
if [ $? -ne 0 ]; then
    warn "Не удалось скопировать отчет Allure. Проверьте существует ли он в контейнере."
    # Дополнительная диагностика
    log "Проверка содержимого pod'а..."
    kubectl exec -it $POD_NAME -- ls -la /app || true
    kubectl exec -it $POD_NAME -- ls -la /app/allure-results || true
    kubectl exec -it $POD_NAME -- ls -la /app/allure-report || true
fi

# Проверка, что отчет скопирован успешно
if [ -d "./allure-report-k8s" ] && [ "$(ls -A ./allure-report-k8s 2>/dev/null)" ]; then
    log "Отчет Allure успешно скопирован в ./allure-report-k8s"
else
    warn "Директория отчета пуста. Попытка копирования через явный tar-метод..."
    # Альтернативный способ копирования через tar
    kubectl exec -it $POD_NAME -- bash -c "tar -cf - /app/allure-report" | tar -xf - -C ./allure-report-k8s --strip-components=2 || true
    
    # Если и это не помогло, пробуем скопировать результаты тестов и сгенерировать отчет локально
    if [ ! "$(ls -A ./allure-report-k8s 2>/dev/null)" ]; then
        log "Попытка локальной генерации отчета Allure..."
        mkdir -p temp-allure-results
        kubectl cp "$POD_NAME:/app/allure-results" "./temp-allure-results" || true
        
        if [ -d "./temp-allure-results" ] && [ "$(ls -A ./temp-allure-results 2>/dev/null)" ]; then
            log "Генерация отчета из скопированных результатов..."
            allure generate ./temp-allure-results -o ./allure-report-k8s --clean || true
            rm -rf ./temp-allure-results
        fi
    fi
fi

log "=== Сводка ==="
log "Тесты выполнены в окружении: ${TEST_ENV}"
log "Pod: $POD_NAME"
log "Отчет Allure: ./allure-report-k8s"
log "Для просмотра логов: kubectl logs $POD_NAME"
log "Для удаления Job: kubectl delete job ui-test-job"