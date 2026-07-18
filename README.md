# park-web-app

A full-stack park booking web app (frontend + FastAPI backend). This README explains how to run the project locally for development and testing.

## Prerequisites

- Node.js (recommended v16 or newer) and Yarn or npm
- Python 3.10+ and pip
- MongoDB (local or Atlas) and a connection string
- `git`

## Repository layout

- `backend/` — FastAPI backend
- `frontend/` — React frontend (CRACO + Tailwind)

---

## Backend — Local setup

1. Change to the backend folder:

	cd backend

2. Create a virtual environment and activate it:

	python -m venv .venv
	source .venv/bin/activate

3. Install Python dependencies:

	pip install -r requirements.txt

4. Create a `.env` file in the `backend/` directory with at least the following values:

	MONGO_URL=your_mongo_connection_string
	DB_NAME=your_database_name
	# Optional: a comma-separated list of origins allowed by CORS
	CORS_ORIGINS=http://localhost:3000

5. Run the development server with Uvicorn (reload enabled):

	uvicorn server:app --reload --host 0.0.0.0 --port 8000

The API will be available at http://localhost:8000 (routes are under `/api`, e.g. `http://localhost:8000/api/status`).

## Frontend — Local setup

1. Change to the frontend folder:

	cd frontend

2. Install dependencies (use Yarn if available; otherwise use npm):

	yarn install
	# or
	npm install

3. Start the development server:

	yarn start
	# or
	npm run start

The frontend dev server runs at http://localhost:3000 by default. If the app needs to call the backend, make sure the backend is running and that the frontend points to the right API URL (see source files or add an env variable if you extend the app).

## Running tests

- Backend tests (from project root):

  cd backend && pytest

- Frontend tests:

  cd frontend && yarn test

## Building for production

- Frontend build:

  cd frontend && yarn build

- Backend production deployment:

  Use an ASGI server such as Uvicorn or Gunicorn with Uvicorn workers. Example:

  uvicorn server:app --host 0.0.0.0 --port 8000 --workers 1

## Troubleshooting

- MongoDB connection errors: verify `MONGO_URL` and that your IP/network allows connections (Atlas IP whitelist).
- If frontend cannot reach backend: verify `CORS_ORIGINS` in `backend/.env` or run backend with proper host/port.
- Package install issues: ensure Node and Python versions meet the prerequisites and clear caches (`yarn cache clean` / `pip cache purge`) if necessary.

## Helpful commands (summary)

- Start backend: `cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8000`
- Start frontend: `cd frontend && yarn start`
- Run backend tests: `cd backend && pytest`
- Build frontend: `cd frontend && yarn build`

If you'd like, I can also add a `.env.example` and a `.gitignore` tailored to this project and commit them.

