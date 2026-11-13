# MERN Stack Notes Application with Secure Authentication

A full-stack notes app for organizing ideas with categories and JWT-authenticated, user-scoped Notes CRUD.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20%7C%2022.12%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9-880000)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

## Features

- Account signup and login using bcrypt password hashing and JWTs, with frontend login/sign-out.
- Authenticated category API for creating, listing, updating, and deleting shared categories; the current UI supports listing, adding, and deleting.
- JWT-protected Notes API with per-user scoping and create, list, update, and delete operations.
- React dashboard for listing and managing notes, with optional category assignment and loading/error feedback.

## Tech Stack

- **Frontend:** React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios
- **Backend:** Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcrypt
- **Database:** MongoDB
- **Package manager:** npm (separate frontend and backend packages)

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+) and npm
- MongoDB running locally, or a MongoDB connection URI

### 1. Get the code and install dependencies

```sh
git clone <repository-url>
cd <repository-directory>

cd backend
npm install

cd ../notes-app
npm install
```

### 2. Configure the backend

From the repository root, copy the example environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

On macOS or Linux:

```sh
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set a unique, strong `JWT_SECRET`. Keep `.env` private; it is ignored by Git. Configure `MONGO_URI` if MongoDB is not available at the local default, and `PORT` if port `3000` is occupied.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend HTTP port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/notesapp` |
| `JWT_SECRET` | Secret used to sign and verify auth tokens | Set a private value |
| `CORS_ORIGIN` | Comma-separated allowed browser origins | `http://localhost:5173` |

For a non-default API URL, copy `notes-app/.env.example` to `notes-app/.env` and set `VITE_API_BASE_URL`. Restart Vite after changing frontend environment variables.

### 3. Start the backend

In a terminal:

```sh
cd backend
npm run dev
```

The API is available at `http://localhost:3000` by default.

### 4. Start the frontend

In a second terminal:

```sh
cd notes-app
npm run dev
```

Open the local URL printed by Vite. The frontend API client currently targets `http://localhost:3000/api`.

Create an account at `/signup`, then sign in at `/login`. The browser stores the JWT in local storage and sends it to protected Notes and category routes. Use **Sign out** to remove the token.

### 5. Build the frontend

```sh
cd notes-app
npm run build
```

Run backend security and ownership-scope tests:

```sh
cd backend
npm test
```

## API Overview

All routes are prefixed with `/api`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Create an account | No |
| `POST` | `/auth/login` | Sign in and receive a JWT | No |
| `POST` | `/category/add-cat` | Create a shared category | Bearer JWT |
| `GET` | `/category/get-cat` | List shared categories | Bearer JWT |
| `PUT` | `/category/update_cat/:id` | Update a shared category | Bearer JWT |
| `DELETE` | `/category/delete_cat/:id` | Delete a shared category | Bearer JWT |
| `POST` | `/notes/add-note` | Create a note | Bearer JWT |
| `GET` | `/notes/get-notes` | List the signed-in user's notes | Bearer JWT |
| `PUT` | `/notes/update-note/:id` | Update an owned note | Bearer JWT |
| `DELETE` | `/notes/delete-note/:id` | Delete an owned note | Bearer JWT |

## Current Limitations

- Categories are shared among authenticated users (not individually owned). Add category ownership and plan a data migration if per-user categories become a requirement.
- JWTs are stored in browser local storage; evaluate an HttpOnly secure-cookie design before a public production deployment.

## Security

Never commit `.env` or real credentials. Use a unique production-grade JWT secret and configure `CORS_ORIGIN` to the exact deployed frontend origin before deployment.
