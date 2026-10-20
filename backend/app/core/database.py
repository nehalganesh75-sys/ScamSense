import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("scamsense.db")

def init_engine(raw_url: str):
    url = raw_url.strip() if raw_url else "sqlite:///./scamsense.db"
    
    # Auto-fix common typos (e.g. postgresq1 with number 1 or legacy postgres://)
    if url.startswith("postgresq1://"):
        url = "postgresql://" + url[13:]
    elif url.startswith("postgres://"):
        url = "postgresql://" + url[11:]

    try:
        if url.startswith("sqlite"):
            return create_engine(
                url,
                connect_args={"check_same_thread": False}
            )
        else:
            return create_engine(
                url,
                pool_pre_ping=True,
                pool_recycle=300
            )
    except Exception as e:
        logger.error("Failed to initialize database engine for URL '%s': %s. Falling back to SQLite.", url, e)
        return create_engine(
            "sqlite:///./scamsense.db",
            connect_args={"check_same_thread": False}
        )

engine = init_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
