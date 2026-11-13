# Workspace Handoff

## Project Overview & Tech Stack

- **Frontend:** React 19, React Router 7, Vite 7, Tailwind CSS 4; JavaScript/JSX.
- **Backend:** Node.js, Express 5, Mongoose 9; CommonJS.
- **Data store:** MongoDB (`notesapp` database).
- **Package managers:** npm; independent manifests and lockfiles in `notes-app/` and `backend/`.

## Directory & File Inventory

| Path | Role | Status |
|---|---|---|
| `README.md` | Project overview, setup, API reference, and security limitations | Added |
| `.github/workflows/ci.yml` | GitHub Actions backend audit/tests and frontend production build on `main` pushes and PRs | Added |
| `.gitignore` | Excludes dependencies, environment files, build/test output, caches, OS metadata, and logs | Updated |
| `notes-app/` | Frontend application | Active |
| `notes-app/package.json`, `package-lock.json` | Frontend dependencies and scripts | Present |
| `notes-app/index.html`, `vite.config.js` | Vite document and configuration | Present |
| `notes-app/src/main.jsx`, `App.jsx`, `index.css` | React bootstrap, routes, and global styles | Present |
| `notes-app/src/components/` (`Navbar.jsx`, `Hero.jsx`) | Shared UI components | Present |
| `notes-app/src/pages/` (`Home.jsx`, `Category.jsx`, `Login.jsx`, `Signup.jsx`) | Route page components | Present |
| `notes-app/src/api/axios.js` | Shared API client | Present |
| `notes-app/src/services/` (`categoryservice.js`, `authsservice.js`, `notesService.js`) | Auth, authenticated category, and Notes API requests | Implemented |
| `notes-app/src/pages/Login.jsx` | Login form and token acquisition | Added |
| `notes-app/.env.example` | Frontend API URL template | Added |
| `notes-app/public/hero.png` | Static hero image | Present |
| `backend/` | Express API application | Active |
| `backend/package.json`, `package-lock.json` | Backend dependencies and scripts | Present |
| `backend/index.js`, `app.js`, `config.js` | Fail-fast environment validation, CORS allowlist, API app configuration, and MongoDB connection | Hardened |
| `backend/.env.example` | Safe template for backend environment variables, including CORS allowlist | Updated |
| `render.yaml` | Render Node web-service Blueprint with secret environment prompts | Added |
| `notes-app/vercel.json` | SPA rewrite for React Router paths on Vercel | Added |
| `backend/Routes/` (`main_route.js`, `auth_routes.js`, `cat_routes.js`, `notes_routes.js`) | API route composition; category and Notes routes require JWT authentication | Protected |
| `backend/Controllers/` (`Auth_controller.js`, `notes_category_controller.js`, `notes_controller.js`) | Authentication, category, and user-scoped Notes handlers | Implemented |
| `backend/Middleware/authMiddleware.js` | Verifies bearer JWTs and assigns the authenticated user to requests | Added |
| `backend/Models/` (`UserModel.js`, `notes_category_model.js`, `NoteModel.js`, `CategoryCounterModel.js`) | Mongoose schemas/models, including user-scoped notes and atomic category ID sequence | Implemented |
| `backend/utils/categoryId.js` | Seeds category sequence from existing IDs and atomically allocates new IDs | Implemented |
| `backend/.env` | Local environment configuration | Private local file; keep out of version control |
| `backend/test/security-and-notes.test.js` | Auth validation, startup configuration, category ID safety, category integrity, JWT protection, and Notes user-scope tests | Expanded |

The stale backend archive, generated frontend build output, and incomplete modernization progress stub were removed. The referenced hero image and package lockfiles were retained. No loose scratch scripts or log files were found.

## Entry Points & Architecture Notes

- Frontend starts at `notes-app/src/main.jsx`; `App.jsx` defines `/`, `/cat`, `/login`, and `/signup`.
- Run the frontend from `notes-app/` with `npm run dev`; `npm run build` creates the production build.
- Frontend requests use Axios at `VITE_API_BASE_URL` (default `http://localhost:3000/api`).
- Backend starts at `backend/index.js`; it mounts category, auth, and Notes routes under `/api`. Startup requires a valid `MONGO_URI` and `JWT_SECRET`, validates them before connecting, and listens on `PORT` (default `3000`) only after MongoDB connects.
- Run the backend from `backend/` with `npm run dev` (nodemon). MongoDB must be available locally. `dotenv` loads `backend/.env`.
- Copy `backend/.env.example` to `backend/.env`; set a unique `JWT_SECRET` of at least 32 characters and configure `MONGO_URI` and `CORS_ORIGIN`. Placeholder and weak JWT secrets are rejected outside tests; there is no legacy secret fallback.
- Copy `notes-app/.env.example` to `notes-app/.env` to override `VITE_API_BASE_URL`.
- Auth endpoints are `/api/auth/signup` and `/api/auth/login`. Category endpoints are `/api/category/add-cat`, `/get-cat`, `/update_cat/:id`, and `/delete_cat/:id`; all require JWT auth and operate on a shared category catalog.
- Protected Notes endpoints are `/api/notes/add-note`, `/get-notes`, `/update-note/:id`, and `/delete-note/:id`; requests require a valid JWT.

## Agent Handoff & Task Tracker

- **Current state:** Frontend and backend source, manifests, and lockfiles are present. Frontend build and focused backend auth/Notes ownership tests are available.
- **Resolved:** `App.jsx` imports the correctly cased `Signup.jsx`; `authsservice.js` now calls the backend's `/auth/login` route.
- **Resolved:** Backend startup fails fast when the MongoDB URI or JWT secret is missing or invalid; JWT signing and verification use only `JWT_SECRET`.
- **Deployment-ready configuration:** `backend/package.json` provides `npm start`; Render Blueprint config is in `render.yaml`; Vercel SPA routing is in `notes-app/vercel.json`. Production startup requires `CORS_ORIGIN` to contain a valid non-loopback frontend origin.
- **CI:** `.github/workflows/ci.yml` runs `npm ci`, `npm audit`, and `npm test` for the backend and `npm ci`, `npm audit`, and `npm run build` for the frontend on pushes and pull requests targeting `main`.
- **Completed:** Added the timestamped, user-scoped Note schema with optional category reference and JWT bearer authentication middleware.
- **Completed:** Added protected Notes CRUD endpoints with authenticated-user scoping and request validation.
- **Completed:** Added server-side signup/login validation, generic login failures, safe category ID allocation, and protection against deleting categories still referenced by notes. Signup requires passwords of at least 12 characters.
- **Completed:** Added the authenticated Notes service and Home dashboard for listing, creating, editing, and deleting notes, including loading and API error states. The existing sign-in service stores successful login tokens in `localStorage` under `token`.
- **Completed:** Added frontend login/sign-out, authenticated category requests, configurable frontend API URL, allowlisted backend CORS, and backend tests for CORS policy, JWT route protection, and Notes user scoping.
- **Category policy:** Categories are shared across authenticated users; changing to user-owned categories requires a data migration and revised access rules.
- **Follow-up:** Consider HttpOnly cookies and full end-to-end tests before public production deployment.
- **Deployment pending:** No cloud resources have been created. Provision Atlas, deploy the Render Blueprint with private `MONGO_URI`/`JWT_SECRET` and the Vercel origin, then deploy `notes-app/` to Vercel with `VITE_API_BASE_URL=<Render URL>/api` and run the live smoke-test checklist in `README.md`.
- **Documentation/hygiene:** Added the public-facing README, refreshed ignore rules, and removed identified stale/generated artifacts. The workspace is prepared for a GitHub/LinkedIn showcase; production deployment still requires an appropriate secret, deployed-origin CORS configuration, and security review.
- **Version control:** Git is on `main` with `origin` configured. Published `v1.0.0` remains pinned to its original audited baseline. The current hardening, CI, and deployment configuration is validated for the next patch release (`v1.0.1`). Preserve unrelated modernization progress artifacts when staging.

## Workspace Rules

- Keep the project root and workspace free of generated, temporary, and unrelated files; do not leave logs or scratch scripts.
- Respect ignore rules and keep dependency/build output out of source changes.
- Keep secrets out of documentation and version control.
- Update this `IDE.md` when project structure, setup, or handoff status changes, before finishing a session.
