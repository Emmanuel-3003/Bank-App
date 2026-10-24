# 🏦 Bank App: Frontend

The web interface for the Bank App, built with **React** and **Vite**.

🔗 **Live:** [emmanuel-bank-app.netlify.app](https://emmanuel-bank-app.netlify.app/) · **Hosted on:** Netlify

## ✨ Features

- Register, log in and log out
- Dashboard with all your accounts and a quick form to open a new one
- Account page to **deposit**, **withdraw** and **transfer** money
- Transaction statements with filters and **PDF download**
- Close an account, and view your profile
- Protected pages: you must be logged in to see your data

## 🛠 Tech Stack

React 19 · Vite · Tailwind CSS · React Router · Axios · jsPDF

## ⚙️ Run Locally

1. Install **Node.js** (v20 or newer).
2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`.

### API URL

By default the app talks to the hosted backend on Render. To use your own backend, create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

> The backend must allow your frontend's origin in its CORS settings (see the backend README).

## 📜 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Check the code with ESLint |

## ☁️ Deployment (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- `public/_redirects` sends every route to `index.html` so page refreshes work with React Router.

## 📁 Structure

```
src/
├── api/          Axios calls to the backend
├── components/   reusable UI pieces
├── context/      login state
├── pages/        Login, Register, Dashboard, AccountDetail, MyProfile
└── utils/        helpers
```