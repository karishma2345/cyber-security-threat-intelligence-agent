# Sentinel Dawn — Cyber Threat Intelligence Agent

A full-stack, AI-assisted Cyber Threat Intelligence platform, engineered from
the original research Jupyter Notebook ("Cybersecurity Threat Intelligence
Agent") into a production web application.

**Stack:** React + Vite (frontend) · Python FastAPI (backend) · SQLite3 (database)
**Theme:** "Defending Sunlight" — dusk-navy backdrop, sunrise orange, drifting clouds

---

## 1. What's inside

```
threat-intel-app/
├── backend/                 FastAPI + SQLite backend
│   ├── main.py               App entrypoint
│   ├── config.py             RSS feeds, threat types, severity, MITRE map, Gemini prompt (from notebook)
│   ├── models.py             SQLAlchemy ORM models
│   ├── schemas.py            Pydantic request/response schemas
│   ├── auth.py                JWT auth + password hashing
│   ├── seed_data.py          Seeds demo user + sample threat articles
│   ├── services/
│   │   ├── ioc_engine.py      IOC regex extraction, classify_threat, calculate_severity, mitre_mapping (Part 3 of notebook)
│   │   ├── rss_collector.py   feedparser-based RSS ingestion (Part 2 of notebook)
│   │   ├── gemini_service.py  Gemini AI threat analysis + rule-based fallback (Part 4 of notebook)
│   │   ├── settings.py        Admin-configurable API key / model / feeds
│   │   └── activity.py        Activity/audit logging
│   ├── routers/
│   │   ├── auth_router.py     Signup / login / admin login
│   │   ├── threats_router.py  Search, detect, analyze (Threat & Severity Detection)
│   │   ├── admin_router.py    API integration, user management, history, RSS ingest
│   │   ├── chat_router.py     AI chatbot (Part 7)
│   │   ├── upload_router.py   User file uploads
│   │   └── dashboard_router.py Aggregated stats for charts
│   ├── uploads/               Uploaded files are stored here
│   └── requirements.txt
│
└── frontend/                React + Vite frontend
    └── src/
        ├── pages/             Home, Login, Signup, AdminLogin, UserDashboard, AdminDashboard
        ├── pages/user/        Overview, Threat Search, Detection, Chatbot, Uploads
        ├── pages/admin/       Overview, API Integration, User Management, History Analysis
        ├── components/        Shared UI (DashboardLayout, FlowDiagram, CloudField, badges…)
        └── styles/            "Defending Sunlight" design system (theme.css)
```

---

## 2. Running the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend automatically creates `threat_intel.db` (SQLite) and seeds it on
first run with:
- A **demo user account** → `demo` / `demo1234`
- **8 realistic sample threat intelligence articles** (so Search, Dashboard,
  and the Chatbot work immediately, even fully offline)

API docs are available at `http://127.0.0.1:8000/docs` once running.

### Admin credentials (constant, as specified)
```
Username: Admin
Password: admin123
```

---

## 3. Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api/*` requests
to `http://127.0.0.1:8000`, so make sure the backend is running first.

To build a production bundle: `npm run build` (outputs to `frontend/dist`).

---

## 4. Connecting live data sources

By default the app runs fully functional **offline** using seeded sample
data and a local rule-based analysis engine (no external API calls
required). To connect it to the real world:

### 4.1 RSS Threat Feeds (live collection)
As **Admin → API Integration**, add/remove RSS sources, then click
**"Run RSS Ingestion"** on the Admin Overview page. This calls the exact
notebook Part 2 logic (`feedparser`) against your configured feeds and
runs every new article through the Part 3 IOC/severity/MITRE pipeline.
*(Requires outbound internet access from wherever the backend is hosted.)*

### 4.2 Gemini AI Analysis
As **Admin → API Integration**, paste your Gemini API key and (optionally)
change the model name (defaults to the notebook's `gemini-3.5-flash` — swap
this for whatever model your account has access to). Once set, every
"Run AI Analysis" action across the app calls the real Gemini API using the
exact `THREAT_PROMPT` from the notebook instead of the offline heuristic
fallback.

> **Note:** at the time this app was built, "gemini-3.5-flash" was not a
> publicly documented Google model name (Gemini's public line goes
> 1.5 → 2.0 → 2.5). The value is preserved exactly as it appeared in the
> source notebook and is fully configurable here — update it in Admin →
> API Integration to match whatever model string is valid for your API key.

---

## 5. User roles

| Role  | Access |
|-------|--------|
| **User** | Sign up / sign in · Threat Search · Threat & Severity Detection · AI Chatbot · File Uploads |
| **Admin** | Constant credentials (`Admin`/`admin123`) · API Integration (Gemini key, model, RSS feeds) · User Management · History Analysis (full audit log) · Threat Repository view · Trigger RSS ingestion |

---

## 6. Notes on faithfulness to the source notebook

- `services/ioc_engine.py` reproduces the notebook's IOC regex patterns,
  `classify_threat()`, `calculate_severity()`, and `mitre_mapping()`
  functions line-for-line in behavior.
- `services/rss_collector.py` mirrors the notebook's Part 2 RSS collection
  loop (same `RSS_FEEDS`, same `MAX_ARTICLES_PER_SOURCE = 10`).
- `services/gemini_service.py` uses the notebook's exact `THREAT_PROMPT`
  JSON-schema prompt and model name, with a deterministic fallback
  analyzer so the app is fully demoable without an API key or internet.
- `seed_data.py` provides realistic sample articles run through this same
  pipeline, standing in for what live RSS collection would produce.
