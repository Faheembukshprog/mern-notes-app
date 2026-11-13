# MERN Stack Notes Application with Secure Authentication

A full-stack notes app for organizing ideas with categories and JWT-authenticated, user-scoped Notes CRUD.

[![CI](https://github.com/Faheembukshprog/mern-notes-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Faheembukshprog/mern-notes-app/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-not%20specified-lightgrey)](#license)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20%7C%2022.12%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9-880000)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

## Architecture Highlights

- **MVC backend:** Express routes dispatch to controllers, backed by Mongoose models.
- **JWT route guards:** Authenticated category and Notes routes verify bearer tokens.
- **User-scoped data:** Notes reads and mutations are constrained to the authenticated user.
- **Production safeguards:** Startup validates required environment variables and production CORS origins.
- **Automated verification:** GitHub Actions audits and tests the backend, audits frontend dependencies, and builds the frontend on pushes and pull requests to `main`.

## GitHub Repository Metadata

- **Description:** Secure MERN notes application with JWT authentication, user-scoped CRUD, and automated CI.
- **Suggested topics:** `mern`, `react`, `nodejs`, `express`, `mongodb`, `jwt-auth`, `rest-api`, `fullstack`, `portfolio-project`

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
git clone https://github.com/Faheembukshprog/mern-notes-app.git
cd mern-notes-app

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

Edit `backend/.env` and set a unique `JWT_SECRET` of at least 32 characters. Keep `.env` private; it is ignored by Git. Configure `MONGO_URI` with a valid MongoDB connection string and set `PORT` if port `3000` is occupied. The server validates required configuration and exits before listening if it is missing or invalid.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend HTTP port | `3000` |
| `MONGO_URI` | MongoDB connection string | Required; see `backend/.env.example` |
| `JWT_SECRET` | Secret used to sign and verify auth tokens | Required; at least 32 characters |
| `CORS_ORIGIN` | Comma-separated allowed browser origins | `http://localhost:5173` |

For a non-default API URL, copy `notes-app/.env.example` to `notes-app/.env` and set `VITE_API_BASE_URL`. Restart Vite after changing frontend environment variables.

### 3. Start the backend

In a terminal:

```sh
cd backend
npm run dev
```

After MongoDB connects successfully, the API is available at `http://localhost:3000` by default.

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

## License

No root-level license has been selected for this repository yet. The `license` field in `backend/package.json` describes that package only; choose and add a repository-wide `LICENSE` before advertising the full project under an open-source license.

## Production Deployment

The repository includes a Render Blueprint in `render.yaml` and a Vercel SPA rewrite in `notes-app/vercel.json`. This prepares deployment configuration; you still need to create the provider services and supply your production domains and secrets.

### 1. Provision MongoDB Atlas

1. Create an Atlas project and cluster, then create a database user with a strong password.
2. In Network Access, allow connections from the backend hosting provider. Prefer the provider's static outbound IPs and restrict the rule as much as your hosting plan permits.
3. Copy the Atlas `mongodb+srv://` connection string, replace its credential placeholders, and use the `notesapp` database name.
4. Keep this URI private and add it only to the backend host's secret environment configuration.

### 2. Deploy the backend to Render

1. Push the repository to GitHub and select **New → Blueprint** in Render; connect the repository and let Render read the root `render.yaml`.
2. Set the prompted `MONGO_URI` to the Atlas URI, `JWT_SECRET` to a cryptographically random unique value of at least 32 characters, and `CORS_ORIGIN` to the exact frontend origin (for example `https://your-notes-app.vercel.app`, without a path or trailing slash). Multiple origins may be comma-separated.
3. The Blueprint sets `NODE_ENV=production`; Render supplies `PORT`. It installs dependencies from `backend/` and runs `npm start`.
4. Wait for the service to start, then record its public base URL, such as `https://notesapp-api.onrender.com`.

To configure Render manually, choose **Node**, set the root directory to `backend`, the build command to `npm install`, and the start command to `npm start`. Add `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the Render environment settings.

### 3. Deploy the frontend to Vercel

1. Import the GitHub repository in Vercel and set **Root Directory** to `notes-app`.
2. Set build command to `npm run build` and output directory to `dist`. The default `npm install` install command is sufficient.
3. Set `VITE_API_BASE_URL` in the Vercel Production environment to the Render URL plus `/api`, e.g. `https://notesapp-api.onrender.com/api`.
4. Deploy. The `notes-app/vercel.json` rewrite serves `index.html` for client-side routes. Add the exact Vercel origin to Render's `CORS_ORIGIN`.
5. Redeploy/restart the affected service after changing environment variables.

### 4. Live smoke-test checklist

1. **Signup:** create a new account with a valid email and a password of at least 12 characters.
2. **Login/session:** sign in and confirm the authenticated view loads and the JWT is persisted under `token` in browser local storage. Do not share the token.
3. **Notes CRUD:** create a note, edit its title/content, reload to confirm persistence, and delete it.
4. **Categories:** confirm categories load while signed in. Verify category endpoints reject requests without a JWT; the deployed frontend should send one.
5. **Sign out:** confirm sign-out removes the token and protected Notes/category data requires signing in again.
6. **Cross-origin/API:** check browser developer tools for successful API responses and no CORS errors. A non-allowlisted origin must not receive an allow-origin response.

### Production environment variables

| Service | Variable | Required value |
|---|---|---|
| Render backend | `NODE_ENV` | `production` (set by Blueprint) |
| Render backend | `NODE_VERSION` | `22.12.0` (set by Blueprint) |
| Render backend | `PORT` | Supplied by Render; do not hardcode |
| Render backend | `MONGO_URI` | Private Atlas connection string |
| Render backend | `JWT_SECRET` | Private random value, at least 32 characters |
| Render backend | `CORS_ORIGIN` | Exact Vercel origin(s), comma-separated if needed |
| Vercel frontend | `VITE_API_BASE_URL` | Render URL plus `/api` |

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

Never commit `.env` or real credentials. Use a unique production-grade JWT secret and configure `CORS_ORIGIN` to the exact deployed frontend origin before deployment. Signup requires a password between 12 and 72 UTF-8 bytes (bcrypt's maximum input size).
