import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.models import User, SimulatorAttempt
from app.schemas.schemas import ScenarioOut, ScenarioAttemptRequest, ScenarioAttemptResult
from app.services.simulator_service import get_scenarios, evaluate_attempt

router = APIRouter()

@router.get("/scenarios", response_model=List[ScenarioOut])
def list_scenarios(category: Optional[str] = Query(None)):
    """Returns available educational scam awareness simulation scenarios."""
    return get_scenarios(category)

@router.post("/scenarios/{scenario_id}/attempt", response_model=ScenarioAttemptResult)
def submit_attempt(
    scenario_id: str,
    payload: ScenarioAttemptRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Evaluates user's chosen safety response and records progress."""
    try:
        result = evaluate_attempt(scenario_id, payload.selected_option_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist attempt record
    db_attempt = SimulatorAttempt(
        user_id=current_user.id if current_user else None,
        session_id=payload.session_id,
        scenario_id=scenario_id,
        selected_option_id=payload.selected_option_id,
        is_correct=result.is_correct,
        score=result.score,
        completed_at=datetime.datetime.utcnow()
    )
    db.add(db_attempt)
    db.commit()

    return result

@router.get("/progress")
def get_user_progress(
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Calculates user or session completion rate, total points, and completed scenarios."""
    query = db.query(SimulatorAttempt)
    if current_user:
        query = query.filter(SimulatorAttempt.user_id == current_user.id)
    elif session_id:
        query = query.filter(SimulatorAttempt.session_id == session_id)

    attempts = query.all()
    all_scenarios = get_scenarios()
    total_available = len(all_scenarios)
    completed_scenarios = list(set(a.scenario_id for a in attempts))
    total_score = sum(a.score for a in attempts)
    avg_score = int(total_score / len(attempts)) if attempts else 0

    return {
        "total_available": total_available,
        "completed_count": len(completed_scenarios),
        "completion_rate_percent": int((len(completed_scenarios) / total_available) * 100) if total_available > 0 else 0,
        "completed_scenario_ids": completed_scenarios,
        "total_attempts": len(attempts),
        "average_score": avg_score
    }
