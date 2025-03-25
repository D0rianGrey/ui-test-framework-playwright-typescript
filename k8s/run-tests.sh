#!/bin/bash

# Параметры
NAMESPACE="default"
TEST_ENV=${1:-local}  # По умолчанию local

# Обновляем ConfigMap
kubectl create configmap test-framework-config \
  --from-literal=TEST_ENV=${TEST_ENV} \
  --from-literal=HEADLESS=true \
  --from-literal=DEBUG_LOGS=false \
  -n ${NAMESPACE} \
  --dry-run=client -o yaml | kubectl apply -f -

# Запускаем Job
kubectl apply -f k8s/job.yaml -n ${NAMESPACE}

# Ждем завершения Job
echo "Waiting for job to complete..."
kubectl wait --for=condition=complete job/ui-test-job -n ${NAMESPACE} --timeout=30m

# Получаем результаты
POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l job-name=ui-test-job -o jsonpath='{.items[0].metadata.name}')
kubectl cp ${NAMESPACE}/${POD_NAME}:/app/allure-report ./allure-report-k8s

echo "Tests completed. Allure report is available in ./allure-report-k8s"