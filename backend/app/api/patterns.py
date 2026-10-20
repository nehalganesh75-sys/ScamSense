from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.schemas import PatternGraphData
from app.services.pattern_service import get_pattern_graph_data

router = APIRouter()

@router.get("/graph", response_model=PatternGraphData)
def get_graph(
    category: Optional[str] = Query(None, description="Filter by scam category"),
    search: Optional[str] = Query(None, description="Search domain, campaign, or entity keyword")
):
    """
    Returns graph representation of scam campaigns, impersonated entities,
    malicious domains, and delivery channels for interactive visualization.
    """
    return get_pattern_graph_data(category_filter=category, search=search)
