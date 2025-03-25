#!/bin/bash

# Установите свои значения
DOCKER_REGISTRY="your-registry.com"
IMAGE_NAME="ui-test-framework"
IMAGE_TAG="latest"

# Сборка Docker-образа
docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .

# Отправка образа в реестр
docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}