import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth_router, threats_router, admin_router, chat_router, upload_router, dashboard_router
from seed_data import seed

Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(
    title="Cybersecurity Threat Intelligence Agent API",
    description="Backend for the RSS-driven Threat Intelligence platform "
                "(IOC extraction, classification, severity scoring, MITRE "
                "ATT&CK mapping, Gemini AI analysis, chatbot, and admin ops).",
    version="1.0.0",
)

# NOTE: allow_origins=["*"] combined with allow_credentials=True is invalid
# per the CORS spec (browsers reject/strip credentialed requests against a
# wildcard origin) and, if it did work, would be an overly permissive policy
# for a credentialed/token-bearing API. Configure explicit origins via the
# CORS_ORIGINS env var (comma-separated) instead, defaulting to the Vite
# dev server origins.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(threats_router.router)
app.include_router(admin_router.router)
app.include_router(chat_router.router)
app.include_router(upload_router.router)
app.include_router(dashboard_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Cybersecurity Threat Intelligence Agent"}
