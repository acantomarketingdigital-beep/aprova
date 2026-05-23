# APROVA

Projeto com frontend Next.js em `aprova-web`, API NestJS em `aprova-api` e um app mobile em `aprova-app`.

## Deploy na Vercel

Para publicar o frontend, importe o repositorio na Vercel e configure:

- Root Directory: `aprova-web`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Environment Variable: `NEXT_PUBLIC_API_URL` com a URL publica da API, por exemplo `https://sua-api.com/api/v1`

O arquivo `docker-compose.yml` e apenas para desenvolvimento local. A Vercel nao sobe Postgres/Redis via Docker Compose; use um banco hospedado e configure as variaveis da API no ambiente onde ela for publicada.

## Desenvolvimento local

```bash
docker compose up -d
cd aprova-api
npm install
npm run start:dev
```

Em outro terminal:

```bash
cd aprova-web
npm install
npm run dev
```
