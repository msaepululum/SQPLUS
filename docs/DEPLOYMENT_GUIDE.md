# Deployment Guide — SQ+

## Arsitektur Deploy

```
[Browser] → [Next.js Frontend] → [Laravel API] → [PostgreSQL]
[Mobile]  ──────────────────────↗
```

## Prasyarat

- Node.js ≥ 20
- PHP ≥ 8.2 + Composer
- PostgreSQL ≥ 14
- Redis (cache & queue, opsional fase 1)

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

### Backend (`backend/.env`)

```env
APP_NAME=SQPlus
APP_URL=https://api.example.com
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sqplus
DB_USERNAME=
DB_PASSWORD=
```

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (setelah Laravel diinisialisasi)
cd backend && composer install && php artisan migrate && php artisan serve
```

## Production Build

```bash
# Frontend
cd frontend && npm run build && npm start

# Backend
cd backend && composer install --optimize-autoloader --no-dev
php artisan config:cache && php artisan route:cache && php artisan migrate --force
```

## Rekomendasi Infrastruktur

| Komponen | Opsi |
|----------|------|
| Frontend | Vercel / Nginx static |
| Backend | Docker + PHP-FPM / Laravel Forge |
| Database | Managed PostgreSQL |
| File storage | S3-compatible |
| Queue | Redis + Laravel Horizon |

## CI/CD (rencana)

1. Lint & test pada PR
2. Build frontend artifact
3. Deploy backend via container
4. Run migrations terkontrol

## Monitoring

- Health: `GET /api/health`
- Log terpusat (ELK / CloudWatch)
- Audit trail internal via `AuditTrailService`
