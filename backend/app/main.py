import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.models import User, Analysis, Indicator, URLInspection, Scenario, SimulatorAttempt
from app.services.simulator_service import SCENARIOS_DATA
from app.api import analyze, inspect_url, dashboard, reports, simulator, patterns, safety, auth

# Create all database tables
Base.metadata.create_all(bind=engine)

# Seed demo scenarios if needed
def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(Scenario).count() == 0:
            for s in SCENARIOS_DATA:
                scen = Scenario(
                    id=s["id"],
                    category=s["category"],
                    difficulty=s["difficulty"],
                    title=s["title"],
                    fictional_sender=s["fictional_sender"],
                    fictional_message=s["fictional_message"],
                    options=s["options"],
                    learning_takeaway=s["learning_takeaway"]
                )
                db.add(scen)
            db.commit()
    finally:
        db.close()

seed_initial_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for ScamSense — AI-Powered Digital Scam Detection & Safety Assistant",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom global exception handler for security (no internal trace exposure)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log exception internally
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the safety request. Please try again later.",
            "error_type": exc.__class__.__name__
        }
    )

# Health endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "ScamSense API",
        "version": settings.VERSION,
        "database": "connected",
        "timestamp": time.time()
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "ScamSense API",
        "description": "AI-Powered Digital Scam Detection & Safety Assistant REST API",
        "docs": "/docs",
        "version": settings.VERSION
    }

# Include API routers
app.include_router(analyze.router, prefix=f"{settings.API_V1_STR}/analyze", tags=["Analyze"])
app.include_router(inspect_url.router, prefix=f"{settings.API_V1_STR}/inspect-url", tags=["Link Inspector"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports & History"])
app.include_router(simulator.router, prefix=f"{settings.API_V1_STR}/simulator", tags=["Simulator"])
app.include_router(patterns.router, prefix=f"{settings.API_V1_STR}/patterns", tags=["Pattern Explorer"])
app.include_router(safety.router, prefix=f"{settings.API_V1_STR}/safety", tags=["Safety Center"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
