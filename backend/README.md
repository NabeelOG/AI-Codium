# JWT Authentication API in Go

A simple JWT-based authentication API built with Go, Gin, GORM, and PostgreSQL.

## Features

- User signup with password hashing (bcrypt)
- User login with JWT generation
- Auth middleware for protected routes
- JWT stored in an `Authorization` HTTP-only cookie
- PostgreSQL persistence with GORM

## Tech Stack

- Go
- Gin (`github.com/gin-gonic/gin`)
- GORM (`gorm.io/gorm`)
- PostgreSQL driver (`gorm.io/driver/postgres`)
- JWT (`github.com/golang-jwt/jwt/v5`)
- dotenv (`github.com/joho/godotenv`)

## Prerequisites

- Go `1.25.0`
- PostgreSQL running locally (or accessible via DSN)

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB=host=localhost user=admin password=secret dbname=mydb port=5432 sslmode=disable
SECRET=replace-with-your-jwt-secret
```

### Notes

- `PORT` exists in `.env`, but the current code uses `r.Run()` with no port argument, so it listens on `:8080`.
- `DB` is the Postgres DSN used by GORM.
- `SECRET` is used to sign and validate JWTs.

## Setup & Run

```bash
go mod tidy
go run .
```

The API starts with Gin default server (`r.Run()`), which listens on `:8080` unless changed in code.

## API Endpoints

Base URL:

```text
http://localhost:8080
```

### 1) Health Check

- **Method:** `GET`
- **Path:** `/ping`
- **Auth:** No

#### Response (200)

```json
{
  "message": "pong"
}
```

---

### 2) Sign Up

- **Method:** `POST`
- **Path:** `/signup`
- **Auth:** No
- **Body (JSON):**

```json
{
  "Email": "user@example.com",
  "Password": "strong-password"
}
```

#### Success Response (200)

```json
{}
```

#### Error Response (400)

```json
{
  "error": "Failed to read body"
}
```

or

```json
{
  "error": "Failed to hash password"
}
```

or

```json
{
  "error": "Failed to create user"
}
```

---

### 3) Login

- **Method:** `POST`
- **Path:** `/login`
- **Auth:** No
- **Body (JSON):**

```json
{
  "Email": "user@example.com",
  "Password": "strong-password"
}
```

#### Success Response (200)

```json
{}
```

Also sets cookie:

- `Authorization=<jwt-token>`
- HttpOnly: `true`
- SameSite: `Lax`
- Max-Age: `2592000` seconds (`30 days`)

#### Error Response (400)

```json
{
  "error": "Invalid email or password"
}
```

or

```json
{
  "error": "Failed to create token"
}
```

---

### 4) Validate (Protected)

- **Method:** `GET`
- **Path:** `/validate`
- **Auth:** Yes (requires `Authorization` cookie with valid JWT)

#### Success Response (200)

Returns the authenticated user object in `message`.

#### Error Response (401)

Unauthorized when cookie is missing/invalid/expired or user no longer exists.

## Postman Guide

### Import / Create Requests

Create a new collection (example name: **JWT in Go**) and add these requests:

1. `GET {{baseUrl}}/ping`
2. `POST {{baseUrl}}/signup`
3. `POST {{baseUrl}}/login`
4. `GET {{baseUrl}}/validate`

Set collection variable:

- `baseUrl = http://localhost:8080`

### Request Bodies in Postman

For `/signup` and `/login`:

- Select **Body** → **raw** → **JSON**
- Use:

```json
{
  "Email": "user@example.com",
  "Password": "strong-password"
}
```

### Authentication Flow in Postman

1. Call `POST /signup` once to create user.
2. Call `POST /login` with same credentials.
3. Confirm `Authorization` cookie is stored (Postman Cookies).
4. Call `GET /validate`.

If cookie is present and valid, `/validate` returns `200` with user data.

## Project Structure

```text
.
├── controllers/
│   └── usersController.go
├── initializers/
│   ├── connectToDb.go
│   ├── loadEnvVariables.go
│   └── syncDatabase.go
├── middleware/
│   └── requireAuth.go
├── models/
│   └── userModel.go
├── main.go
├── go.mod
└── .env
```
