# Library System Backend

NestJS backend for a library management system with Prisma, PostgreSQL, Redis, JWT authentication, caching, rate limiting, and Swagger documentation.

## Architecture

- `src/core`: shared providers such as Prisma, caching, Redis lock service, and global exception filter
- `src/modules/auth`: authentication and authorization with JWT access and refresh tokens
- `src/modules/users`: user profile, admin listing, and borrowed books
- `src/modules/books`: book management, borrowing and returning with Redis-based locking and caching
- `src/modules/authors`: author management with caching
- `prisma`: Prisma schema and seed script

The application follows a service-repository pattern and uses DTOs with validation for all request bodies.

## Setup without Docker

1. Install Node.js 20 or later and PostgreSQL and Redis
2. Copy `.env.example` to `.env` and adjust values
3. Install dependencies

```bash
cd server
npm install
```

4. Run Prisma migrations and seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Start the application

```bash
npm run start:dev
```

The API is available at `http://localhost:3000/api/v1` and Swagger UI at `http://localhost:3000/api-docs`.

## Setup with Docker

1. Ensure Docker and Docker Compose are installed
2. From the `server` directory, build and start the stack

```bash
docker compose up --build
```

The NestJS app, PostgreSQL, and Redis services will start together. Prisma migrations and seed are run automatically.

## Database and Prisma

- Schema is defined in `prisma/schema.prisma`
- Seed data is defined in `prisma/seed.ts`

Common commands:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio
```

## Authentication and Authorization

- Users can sign up and log in via `/api/v1/auth/signup` and `/api/v1/auth/login`
- Access tokens are returned in the response and stored in an HTTP-only cookie
- Refresh tokens are returned in the response body and used with `/api/v1/auth/refresh`
- Logout is handled via `/api/v1/auth/logout`
- Role-based access control is enforced using a JWT strategy and roles guard

### Roles

- Roles are stored on the `User.role` column (`USER` or `ADMIN`) as defined in `prisma/schema.prisma`.
- Normal signups (`POST /auth/signup`) always create users with role `USER`.
- `ADMIN` users are created via the seed script or by updating the `role` column directly in the database.
- The JWT access token payload contains `{ sub, email, role }`, and `RolesGuard` checks the `role` field:
  - `USER`:
    - Can access `/api/v1/users/me`
    - Can borrow/return books: `/api/v1/books/:id/borrow`, `/api/v1/books/:id/return`
  - `ADMIN`:
    - Can do everything a `USER` can
    - Can list users and see their borrowed books
    - Can manage authors and books (create/update/delete, admin-only reads)

### JWT and Cookies

- Access token
  - Signed with `JWT_ACCESS_SECRET`
  - Lifetime controlled by `JWT_ACCESS_EXPIRES_IN` (e.g. `15m`, `1h`, `3600`)
  - Returned in the JSON response and also set in an HTTP-only cookie (`accessToken`)
- Refresh token
  - Signed with `JWT_REFRESH_SECRET`
  - Lifetime controlled by `JWT_REFRESH_EXPIRES_IN` (e.g. `7d`)
  - Only returned in the JSON response (not stored in a cookie)
- The auth cookie is configured with `httpOnly`, `secure: true`, and `sameSite: 'strict'`:
  - Browsers will not send it over plain `http://` in many setups.
  - For tools like Postman/Swagger, it is recommended to use the `Authorization: Bearer <accessToken>` header instead of relying on the cookie.

## Key Endpoints

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me`
- `GET /api/v1/users` (admin)
- `GET /api/v1/users/:id/borrowed` (admin)
- `POST /api/v1/books` (admin)
- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id` (admin)
- `DELETE /api/v1/books/:id` (admin)
- `POST /api/v1/books/:id/borrow` (user)
- `POST /api/v1/books/:id/return` (user)
- `POST /api/v1/authors` (admin)
- `GET /api/v1/authors`
- `PUT /api/v1/authors/:id` (admin)
- `DELETE /api/v1/authors/:id` (admin)

## Rate Limiting and Caching

- Rate limiting is enabled globally with stricter limits on authentication endpoints
- Redis is used for distributed throttling storage
- Redis-backed caching is used on read endpoints for books and authors via the shared `RedisService`
- Cache invalidation is triggered on create, update, and delete operations
- Cache TTL is configurable via the `REDIS_CACHE_TTL_SECONDS` environment variable (default 3600 seconds)

## Environment Variables (Auth & Redis)

Relevant variables for auth and caching (see `.env.example` for full list):

- `JWT_ACCESS_SECRET` – secret used to sign access tokens
- `JWT_REFRESH_SECRET` – secret used to sign refresh tokens
- `JWT_ACCESS_EXPIRES_IN` – access token lifetime (e.g. `15m`, `1h`, `3600`)
- `JWT_REFRESH_EXPIRES_IN` – refresh token lifetime (e.g. `7d`)
- `REDIS_URL` – Redis connection URL (e.g. `redis://localhost:6379`)
- `REDIS_CACHE_TTL_SECONDS` – default TTL for cached authors/books responses in Redis
