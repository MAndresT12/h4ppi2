# H4ppi2 — laboratorio (pnpm)

Reconstrucción de H4ppi para estudiar el backend. Fase actual: **solo `api-gateway`**.

## Flujo de construcción (este laboratorio)

1. `api-gateway` (REST + Mongo) — ahora
2. `chat-service` (Socket.IO + Redis) — después
3. Dockerizar los servicios Node — al final

Mongo en Docker ahora no contradice el punto 3: es **infra**, no el empaquetado de nuestra API.

## Arranque

```bash
# desde h4ppi2/
docker compose up mongo -d
pnpm install
cp services/api-gateway/.env.example services/api-gateway/.env
pnpm dev:api
```

Otra terminal:

```bash
pnpm seed
```

Health: http://localhost:3000/health
