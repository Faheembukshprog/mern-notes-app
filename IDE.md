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
| `.gitignore` | Excludes dependencies, environment files, build/test output, caches, OS metadata, and logs | Updated |
| `notes-app/` | Frontend application | Active |
| `notes-app/package.json`, `package-lock.json` | Frontend dependencies and scripts | Present |
| `notes-app/index.html`, `vite.config.js` | Vite document and configuration | Present |
| `notes-app/src/main.jsx`, `App.jsx`, `index.css` | React bootstrap, routes, and global styles | Present |
| `notes-app/src/components/` (`Navbar.jsx`, `Hero.jsx`) | Shared UI components | Present |
| `notes-app/src/pages/` (`Home.jsx`, `Category.jsx`, `Signup.jsx`) | Route page components | Present |
| `notes-app/src/api/axios.js` | Shared API client | Present |
| `notes-app/src/services/` (`categoryservice.js`, `authsservice.js`, `notesService.js`) | Category, auth, and authenticated Notes API requests | Notes integration added |
| `notes-app/public/hero.png` | Static hero image | Present |
| `backend/` | Express API application | Active |
| `backend/package.json`, `package-lock.json` | Backend dependencies and scripts | Present |
| `backend/index.js` | Server bootstrap, middleware, MongoDB connection | Present |
| `backend/.env.example` | Safe template for backend environment variables | Added |
| `backend/Routes/` (`main_route.js`, `auth_routes.js`, `cat_routes.js`, `notes_routes.js`) | API route composition and endpoints; Notes routes require JWT authentication | Notes routes added |
| `backend/Controllers/` (`Auth_controller.js`, `notes_category_controller.js`, `notes_controller.js`) | Authentication, category, and user-scoped Notes handlers | Notes CRUD added |
| `backend/Middleware/authMiddleware.js` | Verifies bearer JWTs and assigns the authenticated user to requests | Added |
| `backend/Models/` (`UserModel.js`, `notes_category_model.js`, `NoteModel.js`) | Mongoose schemas/models, including user-scoped notes | Note model added |
| `backend/.env` | Local environment configuration; includes a JWT secret | Present; keep private and out of version control |

The stale backend archive, generated frontend build output, and incomplete modernization progress stub were removed. The referenced hero image and package lockfiles were retained. No loose scratch scripts or log files were found.

## Entry Points & Architecture Notes

- Frontend starts at `notes-app/src/main.jsx`; `App.jsx` defines `/`, `/cat`, and `/signup`.
- Run the frontend from `notes-app/` with `npm run dev`; `npm run build` creates the production build.
- Frontend requests use Axios at `http://localhost:3000/api`.
- Backend starts at `backend/index.js`; it mounts category and auth routes under `/api`, listens on `PORT` (default `3000`), and connects using `MONGO_URI` (default `mongodb://localhost:27017/notesapp`).
- Run the backend from `backend/` with `npm run dev` (nodemon). MongoDB must be available locally. `dotenv` loads `backend/.env`.
- Copy `backend/.env.example` to `backend/.env` and set a private `JWT_SECRET`; the legacy `JWTSECRETKEY` is accepted for compatibility.
- Auth endpoints are `/api/auth/signup` and `/api/auth/login`. Category endpoints are `/api/category/add-cat`, `/get-cat`, `/update_cat/:id`, and `/delete_cat/:id`.
- Protected Notes endpoints are `/api/notes/add-note`, `/get-notes`, `/update-note/:id`, and `/delete-note/:id`; requests require a valid JWT.

## Agent Handoff & Task Tracker

- **Current state:** Frontend and backend source, manifests, and lockfiles are present. Frontend production build passes with the Notes UI. No tests were identified; the backend `test` script intentionally exits with an error.
- **Resolved:** `App.jsx` imports the correctly cased `Signup.jsx`; `authsservice.js` now calls the backend's `/auth/login` route.
- **Resolved:** Backend port and MongoDB URI can be configured through `PORT` and `MONGO_URI`; JWT signing uses `JWT_SECRET` (with the legacy key supported).
- **Completed:** Added the timestamped, user-scoped Note schema with optional category reference and JWT bearer authentication middleware.
- **Completed:** Added protected Notes CRUD endpoints with authenticated-user scoping and request validation.
- **Completed:** Added the authenticated Notes service and Home dashboard for listing, creating, editing, and deleting notes, including loading and API error states. The existing sign-in service stores successful login tokens in `localStorage` under `token`.
- **Next milestone:** Add a frontend login page/flow so users can obtain a token through the UI; then protect category APIs and add integration tests. Category service calls remain public.
- **Follow-up:** Replace the placeholder backend test script with meaningful tests.
- **Documentation/hygiene:** Added the public-facing README, refreshed ignore rules, and removed identified stale/generated artifacts. LinkedIn/GitHub showcase documentation and workspace structure are ready; the application is not production-ready until the security and testing follow-ups above are addressed.
- **Version control:** This workspace does not currently contain a `.git` directory, so Git status and tracked-file verification are unavailable.

## Workspace Rules

- Keep the project root and workspace free of generated, temporary, and unrelated files; do not leave logs or scratch scripts.
- Respect ignore rules and keep dependency/build output out of source changes.
- Keep secrets out of documentation and version control.
- Update this `IDE.md` when project structure, setup, or handoff status changes, before finishing a session.
