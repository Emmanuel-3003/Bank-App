<h1 align="center">🏦 Bank App</h1>

<p align="center">
  A full-stack banking application where customers can register, open accounts,<br>
  move money and download statements, securely.
</p>

<p align="center">
  <a href="https://emmanuel-bank-app.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-Open_App-38B2AC?style=for-the-badge&logo=netlify&logoColor=white" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
</p>

## ✨ What It Does

- 🔐 **Secure login:** register, log in and log out with JWT authentication
- 🏧 **Accounts:** open savings or current accounts and manage their status
- 💸 **Money movement:** deposit, withdraw and transfer between accounts
- 📄 **Statements:** filter by date, sort, paginate and download as PDF
- 🛡️ **Privacy:** every customer can only see their own data

## 🧱 How It's Built

| Part | Technology | Hosted On |
|---|---|---|
| **Frontend** | React, Vite, Tailwind CSS | Netlify |
| **Backend** | Spring Boot, Spring Security, JPA | Render |
| **Database** | MySQL-compatible | TiDB Cloud |

```
React app (Netlify)  ──►  Spring Boot REST API (Render)  ──►  TiDB Cloud (MySQL)
```

## 📁 Project Structure

```
bank/
├── backend/    Spring Boot REST API
└── frontend/   React web app
```

Each folder has its own README with setup steps:
[Backend](./backend/README.md) · [Frontend](./frontend/README.md)

## 🚀 Quick Start

1. Start the **backend** (see `backend/README.md`)
2. Start the **frontend** (see `frontend/README.md`)
3. Open `http://localhost:5173`

## 👨‍💻 Author

**Emmanuel Gabriel** · [GitHub](https://github.com/Emmanuel-3003) · [LinkedIn](https://www.linkedin.com/in/emmanuel-gabriel3003)
