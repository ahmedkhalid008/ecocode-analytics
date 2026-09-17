from pydantic import BaseModel
from typing import List

class RecommendationInsight(BaseModel):
    id: str
    type: str
    severity: str  # "CRITICAL" | "WARNING" | "HEALTHY" | "INFO"
    algorithm_name: str
    metric_value: str
    title: str
    insight: str
    action: str
    potential_saving: str

class RecommendationListResponse(BaseModel):
    insights: List[RecommendationInsight]
