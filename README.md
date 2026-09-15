# Bank Management System

A Spring Boot REST API for a simple banking application — customer onboarding, account management, and double-entry transaction processing (deposits, withdrawals, and transfers).

## Features

- **Customer management** — create, update, delete customers; paginated & sorted customer listing
- **Account management** — open accounts linked to a customer, auto-generated account number, enum-based account type (`SAVINGS`/`CURRENT`) and status (`ACTIVE`/`INACTIVE`/`CLOSED`), paginated account listing per customer
- **Transactions** — deposit, withdraw, and transfer between accounts, implemented as double-entry bookkeeping (every transfer creates a linked `DEBIT` and `CREDIT` row, each with a balance snapshot)
- **Validation & error handling** — centralized exception handling for not-found resources, business-rule violations, and request validation failures
- **Transactional integrity** — balance updates and transaction records are wrapped in `@Transactional` boundaries, so a partial failure can't leave money "in limbo" between accounts

## Tech Stack

- Java 21, Spring Boot
- Spring Data JPA + Hibernate
- MySQL
- ModelMapper (entity ↔ DTO mapping)
- Jakarta Bean Validation

## Project Structure

```
com.application.bank
├── controller     REST endpoints
├── service        Business logic
├── repository     Spring Data JPA repositories
├── model           JPA entities + enums
├── payload        Request/response DTOs
├── exceptions     Custom exceptions + global handler
└── config          Constants and shared config
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/customers` | Create a customer |
| `GET` | `/api/customers` | List customers (paginated, sortable) |
| `PUT` | `/api/customers/{customerId}` | Update customer details |
| `DELETE` | `/api/customers/{customerId}` | Delete a customer |
| `POST` | `/api/customers/{customerId}/accounts` | Open a new account for a customer |
| `GET` | `/api/customers/{customerId}/accounts` | List a customer's accounts (paginated, sortable) |
| `PUT` | `/api/accounts/{accountNumber}` | Update account details |
| `PUT` | `/api/accounts/{accountNumber}/status/{status}` | Change account status (`ACTIVE` / `INACTIVE` / `CLOSED`) |
| `POST` | `/api/account/{accountNumber}/deposit` | Deposit money into an account |
| `POST` | `/api/account/{accountNumber}/withdraw` | Withdraw money from an account |
| `POST` | `/api/account/transfer` | Transfer money between two accounts |

## Getting Started

### Prerequisites
- Java 21
- Maven
- MySQL running locally (or accessible via a connection URL)

### Configuration

Database credentials are read from environment variables — nothing is hardcoded in the repo:

| Variable | Example |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/bank` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | *(your MySQL password)* |

Set these in your IDE's run configuration, or export them in your shell before running.

### Run

```bash
./mvnw spring-boot:run
```

The app starts on `http://localhost:8080`.

> **Note:** `spring.jpa.hibernate.ddl-auto` is currently set to `update` for local development, so schema changes apply automatically without wiping existing data on restart.

## Sample Request

**Open an account:**
```
POST /api/customers/1/accounts
```
```json
{
  "accountName": "Rahul Savings",
  "accountType": "TYPE_SAVINGS"
}
```

**Transfer money:**
```
POST /api/account/transfer
```
```json
{
  "fromAccountNumber": "AC000001",
  "toAccountNumber": "AC000002",
  "amount": 500,
  "trxnNote": "Rent split"
}
```

## Author

Emmanuel Gabriel
