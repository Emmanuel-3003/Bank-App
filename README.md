# Bank API

A REST API for a simple banking system, built with Spring Boot. Customers register, log in, open accounts, move money, and view statements. Each customer can only access their own data.

## Features

- **Auth:** register, login and logout with JWT (stateless). Passwords are hashed with BCrypt, and logged-out tokens are revoked.
- **Accounts:** open savings or current accounts, rename them, and change their status (`ACTIVE`, `INACTIVE`, `CLOSED`).
- **Transactions:** deposit, withdraw and transfer. Every movement is recorded as a debit or credit entry with a running balance, and each operation runs in a single database transaction.
- **Statements:** paginated, sortable, and filterable by date range, with opening balance and credit/debit totals.

## Tech stack

Java 21 · Spring Boot · Spring Security · Spring Data JPA (Hibernate) · MySQL · JWT (jjwt) · ModelMapper · Maven

## API overview

All endpoints except `/api/auth/**` need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a customer with a password |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/auth/logout` | Revoke the current token |
| PUT / DELETE | `/api/customers/{customerId}` | Update or delete your profile |
| POST | `/api/customers/{customerId}/accounts` | Open an account |
| GET | `/api/customers/{customerId}/accounts` | List your accounts (paginated) |
| PUT | `/api/accounts/{accountNumber}` | Rename an account |
| PUT | `/api/accounts/{accountNumber}/status/{status}` | Change account status |
| POST | `/api/account/{accountNumber}/deposit` | Deposit money |
| POST | `/api/account/{accountNumber}/withdraw` | Withdraw money |
| POST | `/api/account/transfer` | Transfer between accounts |
| GET | `/api/account/{accountNumber}/statements` | Statement (`fromDate`, `toDate`, `pageNumber`, `pageSize`, `sortBy`, `sortOrder`) |

## Run locally

1. Install Java 21 and MySQL, then create an empty database named `bank`.
2. Set these environment variables:

   | Variable | Example |
      |---|---|
   | `DB_URL` | `jdbc:mysql://localhost:3306/bank` |
   | `DB_USERNAME` | `root` |
   | `DB_PASSWORD` | your MySQL password |
   | `JWT_SECRET` | a random string of 32+ characters |

3. Start the app: `./mvnw spring-boot:run`

The API runs on `http://localhost:8080`. Tokens expire after 1 hour (`jwt.expiration-ms`).

## Roadmap

- Automated tests
- Role-based access (admin)
- Refresh tokens