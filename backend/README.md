# 🏦 Bank App: Backend

REST API for the Bank App, built with **Spring Boot**. Customers register, log in, open accounts, move money and view statements. Each customer can only access their own data.

**Hosted on:** Render · **Database:** TiDB Cloud (MySQL-compatible)

## ✨ Features

- **Auth:** register, login and logout with stateless JWT. Passwords are hashed with BCrypt, and logged-out tokens are revoked.
- **Accounts:** open savings or current accounts, rename them, and set status to `ACTIVE`, `INACTIVE` or `CLOSED`.
- **Transactions:** deposit, withdraw and transfer. Each operation runs in a single database transaction and is recorded as a debit or credit entry.
- **Statements:** paginated, sortable and filterable by date range.

## 🛠 Tech Stack

Java 21 · Spring Boot · Spring Security · Spring Data JPA (Hibernate) · MySQL · JWT (jjwt) · ModelMapper · Maven · Docker

## 🔌 API Overview

All endpoints except `/api/auth/**` need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a customer |
| POST | `/api/auth/login` | Log in and get a JWT |
| POST | `/api/auth/logout` | Revoke the current token |
| PUT / DELETE | `/api/customers/{customerId}` | Update or delete profile |
| POST / GET | `/api/customers/{customerId}/accounts` | Open or list accounts |
| PUT | `/api/accounts/{accountNumber}` | Rename an account |
| PUT | `/api/accounts/{accountNumber}/status/{status}` | Change account status |
| POST | `/api/account/{accountNumber}/deposit` | Deposit money |
| POST | `/api/account/{accountNumber}/withdraw` | Withdraw money |
| POST | `/api/account/transfer` | Transfer between accounts |
| GET | `/api/account/{accountNumber}/statements` | Get a statement |

Sample request bodies are in [`RequestBody.txt`](./RequestBody.txt).

## ⚙️ Run Locally

1. Install **Java 21** and **MySQL**, then create an empty database named `bank`.
2. Set these environment variables:

   | Variable | Example |
      |---|---|
   | `DB_URL` | `jdbc:mysql://localhost:3306/bank` |
   | `DB_USERNAME` | `root` |
   | `DB_PASSWORD` | your database password |
   | `JWT_SECRET` | a random string of 32+ characters |

3. Start the app:

   ```bash
   ./mvnw spring-boot:run
   ```

The API runs on `http://localhost:8080`. Tokens expire after 1 hour.

> **Note:** CORS currently allows only the Netlify site. To use the frontend locally, add `http://localhost:5173` to the allowed origins in `SecurityConfig.java`.

## ☁️ Deployment

The included `Dockerfile` builds the app and runs it on port `8080`. On Render, add the four environment variables above and point `DB_URL` to your TiDB Cloud database.

## 📁 Structure

```
src/main/java/com/application/bank/
├── controller/   REST endpoints
├── service/      business logic
├── repository/   database access
├── model/        entities
├── payload/      request and response DTOs
├── security/     JWT and Spring Security
└── exceptions/   global error handling
```