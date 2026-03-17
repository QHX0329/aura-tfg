# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**AI/LLM:**
- Claude API (Anthropic) - Shopping assistant for user queries
  - SDK/Client: `anthropic>=0.30,<1.0`
  - Auth: `ANTHROPIC_API_KEY` env var
  - Config: `ANTHROPIC_MODEL` env var (default: claude-sonnet-4-20250514)
  - Implementation: Proxy endpoint in backend (apps.assistant module)
  - Rate limiting: User-level throttle 1000/hour (REST_FRAMEWORK throttle config)

**Maps & Geolocation:**
- Google Maps API - Address geocoding, place search, static maps
  - SDK/Client: No direct SDK (HTTP requests via axios/requests)
  - Auth: `GOOGLE_MAPS_API_KEY` env var
  - Used by: Frontend address input, store location lookup
  - Fallback: OSRM available as alternative

- OSRM (Open Source Routing Machine) - Route calculation and distance matrix
  - SDK/Client: HTTP REST API
  - Endpoint: `OSRM_BASE_URL` env var (default: https://router.project-osrm.org)
  - Used by: Route optimization algorithm (apps.optimizer), distance calculations
  - Protocol: JSON REST, no authentication required for public instance

**Scraping:**
- Scrapy-based spiders for supermarket price scraping
  - Files: `scraping/bargain_scraping/spiders/` (mercadona.py, carrefour.py, lidl.py, dia.py, alcampo.py)
  - Playwright integration for JavaScript-heavy sites
  - User agent: Configurable via `SCRAPING_USER_AGENT` env var
  - Concurrent requests: `SCRAPING_CONCURRENT_REQUESTS` env var (default: 4)
  - Download delay: `SCRAPING_DOWNLOAD_DELAY` env var (default: 2 seconds)

## Data Storage

**Databases:**
- PostgreSQL 16 with PostGIS 3.4
  - Connection: `DATABASE_URL` env var (format: `postgis://user:password@host:port/dbname`)
  - Client: psycopg[binary] 3.2.x
  - ORM: Django ORM with PostGIS support via `django.contrib.gis`
  - Features:
    - Geospatial queries (distance, proximity searches)
    - GDAL/GEOS libraries for spatial operations
    - Migrations: Django migrations system with PostGIS extension

- Redis 7-alpine
  - Connection: `REDIS_URL` env var (default: redis://localhost:6379/0)
  - Client: redis 5.0.x
  - Usage: Celery message broker, result backend, optional caching
  - Container: Included in docker-compose.yml with healthcheck

**File Storage:**
- Local filesystem only (development and production)
  - Static files: `backend/staticfiles/` (served by Nginx in production)
  - Media files: `backend/media/` (uploaded files, OCR results)
  - Docker volumes: `static_files`, `media_files` (docker-compose.yml)
  - WhiteNoise (production) - Compresses and serves static files efficiently

**Caching:**
- Redis (optional, can extend with Django cache framework)
- Session storage: Django default (database-backed)

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Implementation: djangorestframework-simplejwt
  - Token endpoints: `/api/auth/token/` (obtain), `/api/auth/token/refresh/` (refresh)
  - Token rotation: `ROTATE_REFRESH_TOKENS = True` in SIMPLE_JWT config
  - Blacklist: `BLACKLIST_AFTER_ROTATION = True` (requires token_blacklist app)
  - Access token lifetime: `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` env var (default: 60)
  - Refresh token lifetime: `JWT_REFRESH_TOKEN_LIFETIME_DAYS` env var (default: 7)
  - Header format: `Authorization: Bearer <token>`

**Frontend Token Storage:**
- expo-secure-store 55.0.8 - Secure credential storage on native platforms

**User Model:**
- Custom User model: `apps.users.User`
- Fields: Standard Django User fields + custom extensions
- Authentication: Email/username + password

## Monitoring & Observability

**Error Tracking:**
- Sentry - Application error and performance monitoring
  - SDK: sentry-sdk[django] 2.8.x
  - DSN: `SENTRY_DSN` env var (optional, integrations only active if set)
  - Integrations: Django, Celery, Logging
  - Environment: `SENTRY_ENVIRONMENT` env var (default: production)
  - Release: `SENTRY_RELEASE` env var
  - Sampling:
    - Traces: `SENTRY_TRACES_SAMPLE_RATE` (default: 0.1 = 10%)
    - Profiles: `SENTRY_PROFILES_SAMPLE_RATE` (default: 0.0 = disabled)
  - PII: `send_default_pii = False` (no user data sent)

**Logs:**
- Structured logging with structlog 24.0.x
  - Format: JSON (production) or console (development)
  - Level: Configurable via `LOG_LEVEL` env var (default: INFO)
  - JSON format toggle: `LOG_JSON_FORMAT` env var (default: false in dev)
  - Processors: Context merging, logger name, log level, ISO timestamps
  - Handlers: Console stream for all environments
  - Django and apps loggers: Separate handlers with configurable levels

## CI/CD & Deployment

**Hosting:**
- Render (staging/preview deployments)
- AWS (planned production target)
- Docker Compose (local development and production-like environments)

**CI Pipeline:**
- GitHub Actions (workflows in `.github/workflows/`)
  - `ci-backend.yml` - Backend tests and linting
  - `ci-frontend.yml` - Frontend tests and linting
  - `deploy-staging.yml` - Pending implementation

**Web Server:**
- Nginx 1.27-alpine (production reverse proxy)
  - Config: `nginx/nginx.conf`
  - Port mapping: 80 (HTTP), 443 (HTTPS with TLS)
  - Static files: Served from `static_files` volume
  - Media files: Served from `media_files` volume

**Application Server:**
- Gunicorn 22.0.x (WSGI server in production)
  - Command: `gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60`
  - Workers: 3 (configurable for scaling)
  - Timeout: 60 seconds

## Environment Configuration

**Required env vars:**
- Core Django:
  - `DJANGO_SETTINGS_MODULE` (dev/test/prod)
  - `SECRET_KEY` (production-grade random string)
  - `DEBUG` (true/false)
  - `ALLOWED_HOSTS` (comma-separated)

- Database:
  - `DATABASE_URL` (postgis://user:pass@host:port/db)
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (for docker-compose)
  - `GDAL_LIBRARY_PATH`, `GEOS_LIBRARY_PATH` (Windows PostGIS only)

- Redis:
  - `REDIS_URL` (redis://host:port/db)

- External APIs:
  - `ANTHROPIC_API_KEY` (required for assistant)
  - `GOOGLE_MAPS_API_KEY` (required for address geocoding)
  - `OSRM_BASE_URL` (optional, defaults to public instance)

- Email:
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`
  - `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
  - `EMAIL_BACKEND` (default: Django SMTP)

- Sentry:
  - `SENTRY_DSN` (optional)
  - `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`
  - `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`

- Scraping:
  - `SCRAPING_USER_AGENT` (default: BargAIn-Bot/1.0)
  - `SCRAPING_CONCURRENT_REQUESTS` (default: 4)
  - `SCRAPING_DOWNLOAD_DELAY` (default: 2 seconds)

- JWT:
  - `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` (default: 60)
  - `JWT_REFRESH_TOKEN_LIFETIME_DAYS` (default: 7)

- Logging:
  - `LOG_LEVEL` (default: INFO)
  - `LOG_JSON_FORMAT` (default: false)

**Secrets location:**
- `.env` file (git-ignored, required at runtime)
- `.env.example` - Template with all required keys (tracked in git)
- Docker Compose - Secrets passed via `env_file: - .env`
- No hardcoded secrets in codebase

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Email notifications (configured via `EMAIL_BACKEND`)
- Sentry error reporting (if DSN configured)
- No explicit webhook calls to third-party services

## Celery Tasks & Scheduling

**Periodic Tasks (django-celery-beat):**
- `expire-stale-prices-hourly` - Marks prices older than threshold (hourly at minute 0)
- `scrape-mercadona-daily` - Runs mercadona spider daily at 06:00
- `scrape-carrefour-daily` - Runs carrefour spider daily at 06:30
- Task execution: `celery -A config worker` (4 concurrent workers)
- Scheduling: DatabaseScheduler (persisted in Django ORM)

**Broker Configuration:**
- Message broker: Redis (CELERY_BROKER_URL)
- Result backend: Redis (CELERY_RESULT_BACKEND)
- Serialization: JSON format
- Timezone: Europe/Madrid (TIME_ZONE setting)

---

*Integration audit: 2026-03-16*
