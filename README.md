# ts_server

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?logo=vitest&logoColor=white)
![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

A small TypeScript API server for Chirpy, a microblog-style backend built with Express, Drizzle ORM, and PostgreSQL.

## Main features

- User signup, login, and profile updates
- JWT access tokens plus refresh token rotation flow
- Chirp creation, listing, filtering by author, lookup by id, and deletion
- Admin endpoints for health checks, metrics, and local reset workflows
- API key protected webhook to upgrade users to Chirpy Red
- Two testing styles: fast unit tests with Vitest and traceable request scenarios in `http_api_tests/`

## Stack

- TypeScript
- Express 5
- Drizzle ORM
- PostgreSQL
- Argon2 for password hashing
- JSON Web Tokens for auth
- Vitest for unit testing

## How to run

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
PORT=8080
PLATFORM=dev
DB_URL=postgres://postgres:postgres@localhost:5432/chirpy
SECRET_JWT_SIGN=replace-me
POLKA_API_KEY=replace-me
```

### 3. Generate and apply migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:8080`.

### 5. Run automated tests

```bash
npm test
```

## `http_api_tests/`: traceable API scenarios

This repo also keeps API checks as `.http` files. Instead of hiding request flows inside scripts, each scenario stays readable, replayable, and easy to review in an IDE HTTP client.

Why this is useful:

- Each file documents a real workflow end to end
- Named requests and variables make auth flows easy to follow
- The files double as lightweight manual tests and living API examples
- Regressions are easier to trace because the request history is explicit

Files in this directory:

- `chirpts_all_requests.http`: broad smoke run covering admin, user, auth, and chirp endpoints
- `post_a_chirp.http`: focused chirp creation flow with both bad-token and good-token cases
- `grant_and_revoke_user_refresh_token.http`: full refresh token lifecycle from login to revoke
- `update_user_test.http`: user update behavior with valid, missing, and invalid auth
- `delete_single_chirp.http`: deletion rules, including ownership checks
- `get_chirps_by_author.http`: author-based filtering for the chirp feed
- `webhook_with_APIKey.http`: API key validation and Chirpy Red upgrade webhook flow

## Limitations

- `npm run dev` builds once and starts the server, but it does not watch for file changes
- Database migrations are generated locally and are not currently committed in this repo
- Most API scenario coverage in `http_api_tests/` is manual or IDE-driven rather than CI-enforced
- The API is intentionally small: there is no pagination, rate limiting, or advanced observability yet

## Roadmap

- Add committed migrations or a smoother first-run bootstrap flow
- Expand automated coverage with integration tests for the main HTTP paths
- Add pagination, richer filtering, and more production-oriented API validation
- Introduce linting, watch mode, and CI checks for faster feedback
