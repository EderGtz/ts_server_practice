# Chirpy RESTful API Backend

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?logo=vitest&logoColor=white)
![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

A robust, type-safe REST API server for a microblogging platform. This service handles user management, secure authentication, and content delivery through a modern Express and PostgreSQL stack[cite: 4, 7]. 

## System Architecture & Features

- **Authentication & Security:** Implements robust user credential protection using Argon2 password hashing and stateless session management via JWTs[cite: 2]. Includes a complete refresh token rotation flow[cite: 2].
- **Data Persistence:** Type-safe SQL querying, schema management, and migrations utilizing Drizzle ORM with a PostgreSQL database[cite: 6, 7].
- **Event-Driven Webhooks:** Features protected endpoints that validate external API keys to process system events, such as account tier upgrades[cite: 5].
- **Centralized Error Handling:** Extends generic Express errors into custom, object-oriented AppError classes (e.g., `UserNotAuthenticatedError`, `UserForbiddenError`) for predictable and uniform API responses[cite: 8].
- **Observability:** Custom middleware implementation for request duration tracking and non-success response logging[cite: 4].
- **Testing Strategy:** Employs Vitest for fast, isolated unit testing of core utilities[cite: 1], complemented by `.http` files for traceable, end-to-end API scenario testing.

## Stack

- TypeScript & Express 5
- Drizzle ORM & PostgreSQL
- Argon2 (Cryptography)
- JSON Web Tokens (Auth)
- Vitest (Testing)

## How to run

### 1. Install dependencies

```bash
npm install

```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=8080
PLATFORM=dev
DB_URL=postgres://postgres:postgres@localhost:5432/chirpy
SECRET_JWT_SIGN=your-secure-secret
POLKA_API_KEY=your-webhook-api-key

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

## Traceable API Scenarios (`http_api_tests/`)

To ensure reliability without hiding request flows inside complex scripts, integration checks are maintained as `.http` files. Each scenario stays readable, replayable, and easy to review natively in an IDE HTTP client.

* `chirpts_all_requests.http`: Broad smoke run covering admin, user, auth, and chirp endpoints.
* `grant_and_revoke_user_refresh_token.http`: Full refresh token lifecycle validation.
* `update_user_test.http`: Role-based access control and token validation checks.
* `delete_single_chirp.http`: Deletion business rules, including strict ownership verification.
* `webhook_with_APIKey.http`: Simulates external platform events utilizing authorization headers.
