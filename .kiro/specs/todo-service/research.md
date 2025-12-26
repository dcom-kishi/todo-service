# Research & Design Decisions

## Summary
- **Feature**: todo-service
- **Discovery Scope**: New Feature (Greenfield) - Monorepo Architecture
- **Key Findings**:
  - **Monorepo Structure**: `frontend/` (Next.js) and `backend/` (FastAPI) co-located.
  - **Vercel Deployment**: Unified `vercel.json` utilizing `@vercel/next` for frontend and `@vercel/python` for backend serverless functions.
  - **Supabase Integration**: Python `supabase` client with FastAPI, utilizing Supabase Auth (JWT) for secure endpoints.

## Research Log

### Monorepo & Deployment Strategy
- **Context**: Deploying Next.js (TS) and FastAPI (Python) from a single repo to Vercel.
- **Sources Consulted**: Vercel docs, community guides on "Next.js + Python on Vercel".
- **Findings**:
  - Vercel natively supports Python runtimes.
  - `vercel.json` configures routing: `/api/*` -> `backend/main.py`, `/*` -> `frontend`.
  - Development requires `next.config.js` rewrites to proxy `/api` to `localhost:8000` or a unified Docker Compose setup.
  - **Constraint Check**: User requested Docker for dev. A `docker-compose.yml` orchestrating `frontend` (node) and `backend` (uv/python) containers is standard.

### Package Management
- **Context**: Python package management.
- **Findings**:
  - `uv` is a modern, extremely fast Python package manager.
  - Docker integration: Use multi-stage builds or simple volume mounts with `uv pip install` for dev speed.
  - Vercel: Vercel expects `requirements.txt`. `uv` can export this (`uv pip compile pyproject.toml -o requirements.txt`) for deployment compatibility.

### Authentication Flow
- **Context**: "Backend REST API used for login auth".
- **Selected Pattern**:
  1. Frontend sends credentials to FastAPI (`POST /api/auth/login`).
  2. FastAPI calls Supabase Auth (`signInWithPassword`).
  3. FastAPI returns Access Token (JWT) to Frontend.
  4. Frontend stores token (Cookie/Memory) and attaches to subsequent requests.
  5. FastAPI validates JWT on protected routes using `supabase.auth.getUser(token)`.

### Target Versions Validation
- **Context**: User requested Next.js 16 and Python 3.14.
- **Python 3.14**:
  - **Status**: Released Oct 2025. Stable.
  - **Key Features**: 
    - JIT Compiler (Experimental on some platforms, potential perf boost).
    - Deferred Evaluation of Annotations (PEP 649) - improves Pydantic integration potential.
    - Template Strings (t-strings) - cleaner string construction.
    - Better multi-core support (free-threaded improvements).
  - **Impact**: Use `python:3.14-slim` (or equivalent `uv` base) for Docker.
- **Next.js 16**:
  - **Status**: Assumed stable release (Late 2025).
  - **Impact**: Continue using App Router and Server Actions. Expect improved Turbopack stability and build performance.

### Cost Feasibility Analysis
- **Context**: User requested feasibility check for Vercel and Supabase free tiers.
- **Vercel (Hobby Plan)**:
  - **Limits**:
    - Bandwidth: 100 GB/month (Sufficient for text-based Todo app).
    - Serverless Function Execution: 100 GB-hours or 1M invocations/month (Generous for personal use).
    - Function Duration: 10s default (API logic must be fast).
  - **Assessment**: Feasible. `frontend` (Next.js) and `backend` (FastAPI via rewrite) fit well.
- **Supabase (Free Tier)**:
  - **Limits**:
    - Database: 500MB (Huge for Todo text data).
    - Auth: 50,000 MAUs (More than enough).
    - API Requests: Unlimited (PostgREST).
    - Pausing: Projects pause after 1 week of inactivity (Development considerations).
  - **Assessment**: Feasible. Ideal for prototype/personal use.
- **Conclusion**: The proposed architecture is fully viable within free tiers.

### Deployment Strategy
- **Context**: Requirement to deploy via GitHub Actions and manage secrets there.
- **Findings**:
  - **Vercel CLI**: Can be triggered from GitHub Actions (`vercel deploy --prod`).
  - **Secrets Management**:
    - Secrets stored in GitHub Actions Secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
    - App secrets (DB URL, etc.) can be pulled to Vercel env vars via CLI (`vercel env pull`) or set via dashboard.
    - *Correction*: Requirement asks to "embed secrets from GitHub Actions". This implies using `vercel env add` or passing env vars during build, BUT Vercel recommends setting Environment Variables in the Project Settings.
    - **Proposed Flow**:
      1. GitHub Action triggers on push to main.
      2. Authenticates using `VERCEL_TOKEN`.
      3. Deploys using `vercel deploy --prod --token=$VERCEL_TOKEN`.
      4. Note: While secrets *can* be synced, it's safer/standard to set production secrets (SUPABASE_KEY etc) once in Vercel Dashboard. However, to strictly follow "embed secrets from GitHub Actions", we can use `vercel env add` in the workflow, but this is complex and non-standard.
      - **Refined Approach**: Use standard Vercel Git Integration for code, but if "GitHub Actions" is mandatory for *deploy trigger*, we disable Vercel's auto-deploy and use the CLI in Actions.
      - **Secrets**: The requirement says "embed production auth info via GitHub Actions secrets". This suggests passing them as build env vars or using `vercel env add` commands in the script.
      - **Decision**: We will design a GitHub Action that installs Vercel CLI and runs deployment commands, passing necessary tokens.

### Database Deployment
- **Context**: Automating Supabase migrations via GitHub Actions.
- **Tools**: `supabase/setup-cli` action.
- **Workflow**:
  1. Checkout code.
  2. Setup Supabase CLI.
  3. Link to Supabase project (`supabase link`).
  4. Push migrations (`supabase db push`) to apply `supabase/migrations/*.sql`.
- **Secrets**: Requires `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`.

### Supabase Local Docker Configuration
- **Context**: Re-evaluating Docker config to include local Supabase.
- **Findings**:
  - Official Supabase Docker setup available (self-hosting repo).
  - **Prerequisites**: Docker, Docker Compose, Git.
  - **Setup Steps**:
    1. Clone/Copy Supabase Docker config.
    2. Configure `.env` (Postgres password, JWT secret, etc.).
    3. Run `docker compose up -d`.
  - **Access**:
    - Studio: `http://localhost:8000`
    - Postgres: `localhost:5432`
    - API: `http://localhost:8000/rest/v1/`
  - **Integration**:
    - Can merge into project `docker-compose.yml` or keep separate.
    - Recommended: Use Supabase CLI (`supabase start`) for development as it manages Docker containers automatically and mimics the platform better than raw self-hosting scripts for dev purposes.
    - **Decision**: Use `supabase start` (CLI) for local dev instead of manual docker-compose of raw images, as it simplifies "dev parity" and migration management.
    - However, if the user explicitly wants *one* `docker-compose.yml` for everything:
      - We can include the services, but it's complex (Kong, GoTrue, PostgREST, Realtime, Storage, etc.).
      - **Alternative**: Keep `frontend` and `backend` in `docker-compose.yml` and use `supabase start` for the DB/Auth stack.
      - **Refined Decision for "Docker Config Reconsideration"**:
        - Use `supabase start` to spin up the local Supabase stack (DB, Auth, Studio, Edge Functions).
        - Use `docker-compose.yml` for `frontend` (Next.js) and `backend` (FastAPI).
        - Configure `frontend` and `backend` containers to talk to the Supabase network (or use host networking/host gateway).
        - This provides the best balance of "managed local dev" and "containerized apps".

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| **Separated Monorepo** | Explicit `frontend` & `backend` dirs. FE calls BE via HTTP. | Clear separation of concerns, independent scaling potential, language flexibility. | Higher boilerplate (API definitions, type syncing), "Network waterfall" risk. | **Selected** per user request. |
| Fullstack Next.js | Server Actions handle everything. | Simpler, type-safe. | Python integration becomes "scripting" rather than "service". | Rejected due to "Python + FastAPI" requirement. |

## Design Decisions

### Decision: API Routing & Rewrites
- **Context**: Handling Cross-Origin (CORS) and routing during Dev vs Prod.
- **Selected Approach**:
  - **Dev (Docker)**: Nginx or explicit port mapping. FE talks to `http://backend:8000`.
  - **Prod (Vercel)**: `vercel.json` rewrites `/api/*` to the Python function.
- **Rationale**: Simplifies frontend code (always calls `/api/...`) regardless of environment.

### Decision: Auth Implementation
- **Context**: Where does Auth live?
- **Selected Approach**: FastAPI acts as the Auth Gateway.
- **Rationale**: Keeps the "Business Logic" in Python as requested. Frontend is purely presentation.
- **Trade-offs**: Adds an extra hop compared to FE calling Supabase directly, but satisfies the "Backend REST API" constraint.

### Decision: Development Environment
- **Context**: `uv` and Docker.
- **Selected Approach**:
  - `backend/Dockerfile`: Uses `ghcr.io/astral-sh/uv:python3.11-bookworm-slim`.
  - `docker-compose.yml`: Mounts source code for hot-reload (`uvicorn --reload`).
  - `.env`: Shared config (DB URL, API Keys).
  - `.env.local`: Secrets (not committed).

## Risks & Mitigations
- **Risk**: Vercel Python Cold Starts.
  - **Mitigation**: Keep dependencies minimal. Use `slim` builds where possible.
- **Risk**: Type safety between TS Frontend and Python Backend.
  - **Mitigation**: Use OpenAPI generator (generate TS client from FastAPI `openapi.json`) in CI pipeline or manually.