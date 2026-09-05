# Bank Management System

A backend REST API for a simple banking application, built with Spring Boot. 
Supports customer onboarding and account management — creating customers, 
opening accounts linked to a customer, and updating account status 
(ACTIVE / INACTIVE / CLOSED).

## Tech Stack
- Java, Spring Boot
- Spring Data JPA + Hibernate
- MySQL
- ModelMapper (DTO ↔ Entity mapping)
- Jakarta Bean Validation

## Features
- Customer CRUD (create, update, delete)
- Account creation linked to a customer, with auto-generated account number
- Account status management via a single generic status-update endpoint
- Centralized exception handling with custom exceptions (`APIException`, `ResourceNotFoundException`)
