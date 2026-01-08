# Руководство по деплою Shopping List Client

## Подготовка к деплою

### ✅ Выполненные шаги

1. **Docker поддержка**
   - ✅ Создан `Dockerfile` с multi-stage build
   - ✅ Создан `.dockerignore`
   - ✅ Создан `nginx.conf` для SPA
   - ✅ Создан `docker-compose.yml` для локального тестирования

2. **Kubernetes манифесты**
   - ✅ `deployment.yaml` - Deployment с health checks
   - ✅ `service.yaml` - ClusterIP Service
   - ✅ `ingress.yaml` - Ingress для внешнего доступа
   - ✅ `configmap.yaml` - ConfigMap для конфигурации
   - ✅ `hpa.yaml` - HorizontalPodAutoscaler
   - ✅ `pdb.yaml` - PodDisruptionBudget
   - ✅ `kustomization.yaml` - Kustomize конфигурация
   - ✅ Production overlay для production окружения

3. **Мета-теги и конфигурация**
   - ✅ Обновлен `index.html` с правильными SEO тегами
   - ✅ Обновлен `manifest.json` для PWA
   - ✅ Обновлен `package.json`
   - ✅ Обновлен `robots.txt`

## Быстрый старт

### 1. Сборка Docker образа

```bash
cd ShoppingList.Client.Browser
docker build -t shopping-list-client:latest .
```

### 2. Тестирование локально

```bash
docker-compose up -d
# Приложение доступно на http://localhost:8080
```

### 3. Публикация в registry

```bash
# Тегирование
docker tag shopping-list-client:latest registry.example.com/shopping-list-client:v1.0.0

# Публикация
docker push registry.example.com/shopping-list-client:v1.0.0
```

### 4. Деплой в Kubernetes

```bash
# Обновить image в deployment.yaml
# Применить манифесты
kubectl apply -k k8s/

# Или для production
kubectl apply -k k8s/overlays/production/
```

## Перед деплоем

### Обязательно обновить:

1. **ingress.yaml**:
   - Замените `shopping-list.example.com` на ваш домен
   - Настройте TLS секреты

2. **deployment.yaml**:
   - Обновите `image` на путь к вашему registry
   - Настройте ресурсы под ваши требования

3. **Переменные окружения**:
   - Если нужны build-time переменные (VITE_*), используйте `--build-arg` при сборке Docker образа
   - Если нужны runtime переменные, используйте ConfigMap/Secrets

## Структура файлов

```
ShoppingList.Client.Browser/
├── Dockerfile              # Multi-stage Docker build
├── .dockerignore           # Исключения для Docker
├── nginx.conf              # Конфигурация nginx
├── docker-compose.yml      # Локальное тестирование
├── DOCKER.md               # Документация по Docker
├── k8s/                    # Kubernetes манифесты
│   ├── deployment.yaml     # Deployment
│   ├── service.yaml        # Service
│   ├── ingress.yaml        # Ingress
│   ├── configmap.yaml      # ConfigMap
│   ├── hpa.yaml            # HorizontalPodAutoscaler
│   ├── pdb.yaml            # PodDisruptionBudget
│   ├── kustomization.yaml  # Kustomize базовая конфигурация
│   ├── README.md           # Документация по Kubernetes
│   ├── base/               # Базовая конфигурация для Kustomize
│   └── overlays/           # Overlays для разных окружений
│       └── production/     # Production конфигурация
└── DEPLOYMENT.md           # Этот файл
```

## Следующие шаги

1. Настроить CI/CD pipeline для автоматической сборки и деплоя
2. Настроить мониторинг (Prometheus/Grafana)
3. Настроить логирование (ELK/Loki)
4. Настроить backup стратегию (если нужно)
5. Настроить сетевые политики (NetworkPolicy)

## Полезные команды

```bash
# Проверка статуса
kubectl get pods -l app=shopping-list-client
kubectl get svc shopping-list-client
kubectl get ingress shopping-list-client

# Логи
kubectl logs -l app=shopping-list-client --tail=100 -f

# Описание ресурса
kubectl describe deployment shopping-list-client

# Масштабирование
kubectl scale deployment shopping-list-client --replicas=3

# Откат (если используется rollout)
kubectl rollout undo deployment/shopping-list-client
```
