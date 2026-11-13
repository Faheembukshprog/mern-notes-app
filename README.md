# MERN Stack Notes Application with Secure Authentication

A full-stack notes app for organizing ideas with categories and JWT-authenticated, user-scoped Notes CRUD.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9-880000)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

## Features

- Account signup and login API using bcrypt password hashing and JWTs.
- Category API for creating, listing, updating, and deleting categories; the current UI supports listing, adding, and deleting.
- JWT-protected Notes API with per-user scoping and create, list, update, and delete operations.
- React dashboard for listing and managing notes, with optional category assignment and loading/error feedback.

## Tech Stack

- **Frontend:** React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios
- **Backend:** Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcrypt
- **Database:** MongoDB
- **Package manager:** npm (separate frontend and backend packages)

## Getting Started

### Prerequisites

- Node.js 22 or later and npm
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

### 5. Build the frontend

```sh
cd notes-app
npm run build
```

## API Overview

All routes are prefixed with `/api`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Create an account | No |
| `POST` | `/auth/login` | Sign in and receive a JWT | No |
| `POST` | `/category/add-cat` | Create a category | No |
| `GET` | `/category/get-cat` | List categories | No |
| `PUT` | `/category/update_cat/:id` | Update a category | No |
| `DELETE` | `/category/delete_cat/:id` | Delete a category | No |
| `POST` | `/notes/add-note` | Create a note | Bearer JWT |
| `GET` | `/notes/get-notes` | List the signed-in user's notes | Bearer JWT |
| `PUT` | `/notes/update-note/:id` | Update an owned note | Bearer JWT |
| `DELETE` | `/notes/delete-note/:id` | Delete an owned note | Bearer JWT |

## Current Limitations

- A frontend login page is not implemented yet. The login API and frontend sign-in service exist, and the Notes service expects a JWT in browser `localStorage` under the key `token`.
- Category endpoints are currently public and categories are not user-scoped. Add authorization and ownership checks before exposing this API to untrusted users.
- Automated backend tests have not been added; the backend's current `npm test` script is a placeholder.

## Security

Never commit `.env` or real credentials. Use a unique production-grade JWT secret, restrict CORS for deployment, and protect category routes before deploying the application publicly.
