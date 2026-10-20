# ScamSense — AI-Powered Digital Scam Detection & Safety Assistant

> **"Think Before You Trust."**  
> An explainable cybersecurity application designed to analyze potentially fraudulent communications, inspect suspicious URLs, and provide interactive awareness simulation.

---

## 1. Project Overview

**ScamSense** is a full-stack digital safety platform engineered to protect users from fraudulent job offers, phishing emails, imposter extortion schemes (&ldquo;digital arrest&rdquo;), parcel delivery fee traps, and UPI payment scams. 

Unlike black-box AI tools, ScamSense isolates exact suspicious excerpts, explains the psychological or deceptive playbooks at work, and delivers concrete, actionable safety recommendations.

### Key Capabilities
- **Explainable Scam Analyzer (`/analyze`)**: Heuristic multi-tier NLP rule engine detecting urgency, advance fee demands, credential harvesting, impersonation, and process bypassing.
- **Suspicious Link Inspector (`/link-inspector`)**: Static lexical and structural URL inspector with brand lookalike detection, punycode/IDN spoof alerts, disposable TLD flags, and zero-fetch SSRF protection.
- **Scam Pattern Explorer (`/pattern-explorer`)**: Interactive relational graph mapping campaigns, spoofed entities, domains, and delivery channels with dynamic search and filtering.
- **Scam Awareness Simulator (`/simulator`)**: Scenario-based defensive training laboratory with step-by-step questions, immediate feedback, and real-time score tracking.
- **Analytics Dashboard (`/dashboard`)**: Volume timeline charts, severity breakdowns, and top indicator frequencies calculated from application telemetry.
- **Audit Reports & Privacy Controls (`/reports`, `/settings`)**: Full user data sovereignty with content-free analysis mode, CSV/JSON history export, and one-click data purge.
- **Verified Safety Resource Center (`/safety-center`)**: Direct links to India's National Cyber Crime Reporting Portal (`cybercrime.gov.in`), the 24x7 Cyber Fraud Helpline **`1930`**, DoT Chakshu, and evidence preservation guidelines.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Cybersecurity SaaS Dark Navy Palette)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Volume AreaChart, Severity Pie, Top Indicators BarChart)
- **Navigation**: React Router DOM (v7)
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Data Validation**: Pydantic v2
- **ORM**: SQLAlchemy 2.0
- **Database Migrations**: Alembic
- **Security**: PBKDF2/Bcrypt password hashing, Python-JOSE JWT authentication
- **Testing**: Pytest + FastAPI TestClient + HTTPX

### Database & Deployment
- **Database**: PostgreSQL (Production ready) / SQLite fallback for local zero-dependency development
- **Containerization**: Docker & Docker Compose
- **Hosting Targets**: Static frontend (Vercel / Netlify / Cloudflare Pages), Backend API (Render / Fly.io / AWS ECS), Managed PostgreSQL (Neon / Supabase / AWS RDS).

---

## 3. Project Directory Structure

```
scamsense/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Routers (analyze, url, dashboard, reports, simulator, etc.)
│   │   ├── core/            # Settings, Database engine, and JWT/Bcrypt security
│   │   ├── models/          # SQLAlchemy ORM models (User, Analysis, Indicator, etc.)
│   │   ├── schemas/         # Pydantic request and response schemas
│   │   ├── services/        # Scam detector rule engine, URL inspector, Pattern graph, Simulator
│   │   └── main.py          # FastAPI application entrypoint & middleware
│   ├── migrations/          # Alembic migration scripts and version files
│   ├── tests/               # Pytest automated test suites
│   ├── Dockerfile           # Backend container definition
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, Footer, RiskBadge, RiskScoreGauge, Skeletons)
│   │   ├── context/         # AuthContext (JWT session, guest mode, privacy consent)
│   │   ├── pages/           # 10 core routes (Landing, Analyze, Inspector, Pattern, Simulator, etc.)
│   │   ├── services/        # Frontend API client
│   │   ├── test/            # Vitest unit test suites
│   │   └── types/           # Shared TypeScript interfaces
│   ├── Dockerfile           # Multi-stage production container
│   ├── nginx.conf           # SPA client routing and reverse proxy
│   └── package.json
├── docs/
│   ├── architecture.md      # Architectural design and subsystem breakdown
│   ├── detection-methodology.md # Rule engine weights, diminishing returns, and scoring
│   └── privacy.md           # Privacy guarantee, data minimization, and content retention policy
├── docker-compose.yml       # Local multi-container development orchestration
├── .env.example             # Environment variable template
└── README.md
```

---

## 4. Local Quickstart Guide

### Prerequisites
- **Python 3.12+** or **3.13+**
- **Node.js 20+** and **npm**
- *(Optional)* Docker and Docker Compose

---

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/your-username/scamsense.git
cd scamsense
cp .env.example .env
```

---

### Step 2: Backend Setup

```bash
# 1. Create and activate a Python virtual environment
python -m venv backend/venv

# Windows PowerShell:
.\backend\venv\Scripts\Activate.ps1
# macOS/Linux:
source backend/venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Apply database migrations (SQLite or PostgreSQL)
alembic upgrade head

# 4. Start the FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will now be accessible at `http://127.0.0.1:8000`.  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup

In a new terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 5. Running with Docker Compose

To start the full stack including PostgreSQL, the FastAPI backend, and Nginx-served frontend in isolated containers:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 6. Running Automated Tests

### Backend Unit & Integration Tests (Pytest)
```bash
# From workspace root with venv activated:
pytest backend/tests -v
```
*Covers upfront payment rules, credential harvesting detection, diminishing returns scoring, benign controls, homoglyph lookalikes, SSRF guards, and REST endpoints (18/18 tests passing).*

### Frontend Component & Integration Tests (Vitest)
```bash
cd frontend
npm run test
```
*Covers RiskBadge rendering, RiskScoreGauge meter animation, EmptyState interactions, and form states (8/8 tests passing).*

---

## 7. Emergency Reporting & Trust Advisory

- **India Cyber Crime Helpline**: **`1930`** (Toll-Free, 24x7)
- **Official Reporting Portal**: [`cybercrime.gov.in`](https://cybercrime.gov.in)
- **Telecom Fraud Reporting**: [`sancharsaathi.gov.in/sfc`](https://sancharsaathi.gov.in/sfc) (Chakshu)

> **Important Disclosure**: ScamSense is an academic digital safety assistant developed for educational, analytical, and computer science research purposes. A result of &ldquo;Low observed risk&rdquo; indicates no heuristic warning signs were recognized in the submitted text; it does not guarantee that a sender or message is genuine. Always verify official corporate or banking communications independently.
