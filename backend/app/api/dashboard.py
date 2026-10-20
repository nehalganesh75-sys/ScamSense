import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Analysis, Indicator, URLInspection, SimulatorAttempt
from app.schemas.schemas import DashboardSummaryOut, TrendPoint

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns aggregated dashboard metrics calculated from live database data.
    Always reflects real stored data — no demo fallback.
    """
    total_analyses = db.query(Analysis).count()

    # Risk distribution
    risk_counts = db.query(Analysis.assessment, func.count(Analysis.id)).group_by(Analysis.assessment).all()
    risk_dist = {"high_suspicion": 0, "caution_advised": 0, "low_risk": 0}
    for assessment, count in risk_counts:
        if assessment in risk_dist:
            risk_dist[assessment] = count

    # Type distribution
    type_counts = db.query(Analysis.analysis_type, func.count(Analysis.id)).group_by(Analysis.analysis_type).all()
    type_dist = {t or "message": count for t, count in type_counts}

    # Top indicators
    ind_counts = db.query(
        Indicator.indicator_code,
        Indicator.title,
        Indicator.severity,
        func.count(Indicator.id).label("count")
    ).group_by(Indicator.indicator_code, Indicator.title, Indicator.severity).order_by(func.count(Indicator.id).desc()).limit(5).all()

    top_indicators = [
        {"code": ic[0], "title": ic[1], "severity": ic[2], "count": ic[3]}
        for ic in ind_counts
    ]

    total_urls = db.query(URLInspection).count()

    # Simulator stats
    sim_attempts = db.query(SimulatorAttempt).all()
    sim_count = len(sim_attempts)
    avg_score = int(sum(a.score for a in sim_attempts) / sim_count) if sim_count > 0 else 0

    return DashboardSummaryOut(
        total_analyses=total_analyses,
        risk_distribution=risk_dist,
        type_distribution=type_dist,
        top_indicators=top_indicators,
        total_url_inspections=total_urls,
        simulator_stats={
            "total_attempts": sim_count,
            "average_score": avg_score,
            "scenarios_completed": len(set(a.scenario_id for a in sim_attempts))
        },
        is_demo_data=False
    )


@router.get("/trends", response_model=List[TrendPoint])
def get_dashboard_trends(db: Session = Depends(get_db)):
    """
    Returns volume and assessment distribution trends over the last 7 days.
    Always reflects real stored data — no demo fallback.
    """
    today = datetime.datetime.utcnow().date()
    trends: List[TrendPoint] = []

    for i in range(6, -1, -1):
        target_day = today - datetime.timedelta(days=i)
        start_dt = datetime.datetime.combine(target_day, datetime.time.min)
        end_dt = datetime.datetime.combine(target_day, datetime.time.max)

        day_analyses = db.query(Analysis).filter(
            Analysis.created_at >= start_dt,
            Analysis.created_at <= end_dt
        ).all()

        high_s = sum(1 for a in day_analyses if a.assessment == "high_suspicion")
        caut = sum(1 for a in day_analyses if a.assessment == "caution_advised")
        low_r = sum(1 for a in day_analyses if a.assessment == "low_risk")

        label = "Today" if i == 0 else ("Yesterday" if i == 1 else target_day.strftime("%b %d"))
        trends.append(TrendPoint(
            date=label,
            total=len(day_analyses),
            high_suspicion=high_s,
            caution_advised=caut,
            low_risk=low_r
        ))

    return trends
