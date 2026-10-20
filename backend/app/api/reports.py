import csv
import io
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.models import User, Analysis, Indicator, URLInspection
from app.schemas.schemas import AnalysisOut, IndicatorOut, URLInspectionOut

router = APIRouter()

@router.get("")
def list_reports(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Query(None),
    assessment: Optional[str] = Query(None),
    analysis_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Lists saved analyses with filtering, search, and pagination."""
    query = db.query(Analysis)

    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    elif session_id:
        query = query.filter(Analysis.session_id == session_id)
    # else guest mode returns session/public records

    if assessment and assessment != "all":
        query = query.filter(Analysis.assessment == assessment)

    if analysis_type and analysis_type != "all":
        query = query.filter(Analysis.analysis_type == analysis_type)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Analysis.summary.ilike(search_fmt),
                Analysis.content_preview.ilike(search_fmt)
            )
        )

    total_count = query.count()
    records = query.order_by(Analysis.created_at.desc()).offset(offset).limit(limit).all()

    items = []
    for r in records:
        indicators_out = [
            IndicatorOut(
                code=ind.indicator_code,
                title=ind.title,
                severity=ind.severity,
                evidence=ind.evidence,
                explanation=ind.explanation,
                recommendation=ind.recommendation
            ) for ind in r.indicators
        ]
        url_out = None
        if r.url_inspection:
            url_out = URLInspectionOut(
                raw_url=r.url_inspection.raw_url,
                normalized_domain=r.url_inspection.normalized_domain,
                risk_score=r.url_inspection.risk_score,
                assessment=r.url_inspection.assessment,
                structural_flags=r.url_inspection.structural_flags or [],
                reputation_status=r.url_inspection.reputation_status,
                reputation_provider=r.url_inspection.reputation_provider,
                details=r.url_inspection.details or {},
                created_at=r.url_inspection.created_at
            )

        items.append({
            "id": r.id,
            "assessment": r.assessment,
            "risk_score": r.risk_score,
            "summary": r.summary,
            "analysis_type": r.analysis_type,
            "content_preview": r.content_preview,
            "consent_given": r.consent_given,
            "indicator_count": len(indicators_out),
            "indicators": indicators_out,
            "url_inspection": url_out,
            "created_at": r.created_at
        })

    return {
        "total": total_count,
        "items": items,
        "limit": limit,
        "offset": offset
    }

@router.get("/export")
def export_reports(
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Query(None)
):
    """Exports previous analysis history in JSON or CSV format."""
    query = db.query(Analysis)
    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    elif session_id:
        query = query.filter(Analysis.session_id == session_id)

    records = query.order_by(Analysis.created_at.desc()).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Created At", "Assessment", "Risk Score", "Type", "Summary", "Indicators Count"])
        for r in records:
            writer.writerow([
                r.id,
                r.created_at.isoformat() if r.created_at else "",
                r.assessment,
                r.risk_score,
                r.analysis_type,
                r.summary,
                len(r.indicators)
            ])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=scamsense_report_export.csv"}
        )

    # JSON export
    data = [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "assessment": r.assessment,
            "risk_score": r.risk_score,
            "type": r.analysis_type,
            "summary": r.summary,
            "indicators": [{"code": i.indicator_code, "title": i.title, "severity": i.severity} for i in r.indicators]
        }
        for r in records
    ]
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=scamsense_report_export.json"}
    )

@router.get("/{report_id}", response_model=AnalysisOut)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetches full assessment details, indicators, and recommendations for a report ID."""
    report = db.query(Analysis).filter(Analysis.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    indicators_out = [
        IndicatorOut(
            code=ind.indicator_code,
            title=ind.title,
            severity=ind.severity,
            evidence=ind.evidence,
            explanation=ind.explanation,
            recommendation=ind.recommendation
        ) for ind in report.indicators
    ]

    url_out = None
    if report.url_inspection:
        url_out = URLInspectionOut(
            raw_url=report.url_inspection.raw_url,
            normalized_domain=report.url_inspection.normalized_domain,
            risk_score=report.url_inspection.risk_score,
            assessment=report.url_inspection.assessment,
            structural_flags=report.url_inspection.structural_flags or [],
            reputation_status=report.url_inspection.reputation_status,
            reputation_provider=report.url_inspection.reputation_provider,
            details=report.url_inspection.details or {},
            created_at=report.url_inspection.created_at
        )

    recs = [i.recommendation for i in indicators_out]
    if not recs:
        recs = ["Verify any unsolicited requests through officially established channels."]

    return AnalysisOut(
        id=report.id,
        assessment=report.assessment,
        risk_score=report.risk_score,
        summary=report.summary,
        analysis_type=report.analysis_type,
        content_preview=report.content_preview,
        indicators=indicators_out,
        url_inspection=url_out,
        recommendations=recs,
        limitations=report.limitations or [],
        created_at=report.created_at
    )

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Deletes a specific analysis record and all associated indicators."""
    report = db.query(Analysis).filter(Analysis.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    db.delete(report)
    db.commit()
    return {"message": f"Report #{report_id} has been permanently deleted."}

@router.delete("")
def clear_all_reports(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Query(None)
):
    """Clears history with confirmation."""
    query = db.query(Analysis)
    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    elif session_id:
        query = query.filter(Analysis.session_id == session_id)

    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {"message": f"Successfully cleared {deleted_count} analysis record(s)."}
