# Docker Setup для Shopping List Client

## Описание

Этот проект использует multi-stage Docker build для создания оптимизированного production образа.

## Структура

- **Dockerfile** - Multi-stage build (Node.js для сборки + nginx для production)
- **nginx.conf** - Конфигурация nginx для SPA приложения
- **.dockerignore** - Исключения для Docker build context
- **docker-compose.yml** - Для локального тестирования

## Сборка образа

### Базовая сборка

```bash
docker build -t shopping-list-client:latest .
```

### Сборка с build arguments (если нужны переменные окружения на этапе сборки)

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_KEYCLOAK_URL=https://keycloak.example.com \
  -t shopping-list-client:latest .
```

## Запуск контейнера

### Простой запуск

```bash
docker run -d -p 8080:80 --name shopping-list-client shopping-list-client:latest
```

Приложение будет доступно по адресу: http://localhost:8080

### Запуск с docker-compose

```bash
docker-compose up -d
```

## Переменные окружения

Если ваше приложение использует переменные окружения на этапе сборки (VITE_*), их нужно передать через `--build-arg`:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t shopping-list-client:latest .
```

**Важно**: Vite переменные окружения встраиваются в код на этапе сборки, поэтому их нужно указывать при сборке образа, а не при запуске контейнера.

## Production рекомендации

1. **Используйте конкретные теги версий** вместо `latest`:
   ```bash
   docker build -t shopping-list-client:v1.0.0 .
   ```

2. **Настройте reverse proxy** (nginx/ingress) для:
   - SSL/TLS терминации
   - Проксирования API запросов к backend
   - Сжатия ответов

3. **Health checks** уже настроены в Dockerfile и docker-compose.yml

4. **Для Kubernetes** используйте ConfigMap/Secrets для переменных окружения, если они нужны на runtime

## Troubleshooting

### Проверка логов

```bash
docker logs shopping-list-client
```

### Проверка health check

```bash
curl http://localhost:8080/health
```

### Вход в контейнер

```bash
docker exec -it shopping-list-client sh
```
