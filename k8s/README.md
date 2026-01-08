# Kubernetes манифесты для Shopping List Client

## Структура

### Основные манифесты
- **deployment.yaml** - Deployment для приложения
- **service.yaml** - Service для внутреннего доступа
- **ingress.yaml** - Ingress для внешнего доступа
- **configmap.yaml** - ConfigMap для конфигурации
- **hpa.yaml** - HorizontalPodAutoscaler для автоматического масштабирования
- **pdb.yaml** - PodDisruptionBudget для высокой доступности
- **kustomization.yaml** - Kustomize конфигурация

### Overlays (для разных окружений)
- **overlays/production/** - Production конфигурация с увеличенными ресурсами и TLS

## Быстрый старт

### 1. Сборка и публикация Docker образа

```bash
# Сборка образа
docker build -t shopping-list-client:latest .

# Тегирование для registry (замените на ваш registry)
docker tag shopping-list-client:latest registry.example.com/shopping-list-client:v1.0.0

# Публикация в registry
docker push registry.example.com/shopping-list-client:v1.0.0
```

### 2. Обновление манифестов

Перед применением обновите:

- **ingress.yaml**: Замените `shopping-list.example.com` на ваш домен
- **deployment.yaml**: Обновите `image` на ваш registry путь
- **ingress.yaml**: Раскомментируйте и настройте TLS секреты

### 3. Применение манифестов

#### Вариант 1: С помощью kubectl

```bash
# Применить все манифесты
kubectl apply -f k8s/

# Или по отдельности
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/hpa.yaml
```

#### Вариант 2: С помощью Kustomize

```bash
# Применить базовую конфигурацию
kubectl apply -k k8s/

# Для production overlay
kubectl apply -k k8s/overlays/production/
```

#### Вариант 3: По отдельности (для отладки)

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/pdb.yaml
```

### 4. Проверка статуса

```bash
# Проверить поды
kubectl get pods -l app=shopping-list-client

# Проверить сервисы
kubectl get svc shopping-list-client

# Проверить ingress
kubectl get ingress shopping-list-client

# Проверить логи
kubectl logs -l app=shopping-list-client --tail=100

# Проверить HPA
kubectl get hpa shopping-list-client-hpa
```

## Настройка

### Переменные окружения на этапе сборки

Если нужны переменные окружения на этапе сборки (VITE_*), используйте build args в Dockerfile:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t shopping-list-client:latest .
```

### Runtime переменные окружения

Для runtime переменных используйте ConfigMap или Secrets:

```yaml
# В deployment.yaml
env:
- name: API_URL
  valueFrom:
    configMapKeyRef:
      name: shopping-list-client-config
      key: api-url
```

### TLS сертификаты

Для HTTPS настройте TLS секреты:

```bash
# Создать TLS секрет
kubectl create secret tls shopping-list-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem
```

Затем раскомментируйте секцию `tls` в `ingress.yaml`.

### Использование Cert-Manager (рекомендуется)

```yaml
# Добавьте аннотации в ingress.yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

## Масштабирование

HPA автоматически масштабирует поды на основе:
- CPU утилизации (целевое значение: 70%)
- Memory утилизации (целевое значение: 80%)
- Минимум: 2 реплики
- Максимум: 5 реплик

Настройки можно изменить в `hpa.yaml`.

## Мониторинг

### Health checks

Приложение имеет встроенные health checks:
- Liveness probe: `/health` каждые 30 секунд
- Readiness probe: `/health` каждые 10 секунд

### Метрики

Для мониторинга можно использовать:
- Prometheus для сбора метрик
- Grafana для визуализации
- Настроить ServiceMonitor для Prometheus Operator

## Troubleshooting

### Поды не запускаются

```bash
# Проверить события
kubectl describe pod -l app=shopping-list-client

# Проверить логи
kubectl logs -l app=shopping-list-client
```

### Ingress не работает

```bash
# Проверить ingress controller
kubectl get pods -n ingress-nginx

# Проверить ingress
kubectl describe ingress shopping-list-client
```

### Проблемы с DNS

Убедитесь, что DNS запись указывает на IP вашего ingress controller:

```bash
# Получить IP ingress controller
kubectl get svc -n ingress-nginx
```

## Production рекомендации

1. **Используйте конкретные версии образов** вместо `latest`
2. **Настройте ResourceQuota** для namespace
3. **Настройте NetworkPolicy** для безопасности
4. **Используйте PodDisruptionBudget** для высокой доступности
5. **Настройте мониторинг и алертинг**
6. **Регулярно обновляйте образы** с исправлениями безопасности
