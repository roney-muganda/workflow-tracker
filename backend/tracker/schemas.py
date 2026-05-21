from ninja import ModelSchema, Schema
from .models import Application
from typing import Optional
from datetime import datetime

# Output schema: What the API returns to the frontend
class ApplicationOut(ModelSchema):
    class Meta:
        model = Application
        fields = "__all__"

# Input schema: What the API expects when creating/updating
class ApplicationCreate(ModelSchema):
    class Meta:
        model = Application
        fields = [
            "applicant_name", 
            "applicant_email", 
            "company_name", 
            "application_type", 
            "description"
        ]

# Input schema: specifically for the reviewer's decision
class ReviewDecisionIn(Schema):
    decision: str
    comment: Optional[str] = None