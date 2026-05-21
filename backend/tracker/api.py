from ninja import Router
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from typing import List
from .models import Application
from .schemas import ApplicationOut, ApplicationCreate, ReviewDecisionIn

router = Router()

@router.get("/", response=List[ApplicationOut])
def list_applications(request):
    return Application.objects.all().order_by("-created_at")

@router.get("/{application_id}", response=ApplicationOut)
def get_application(request, application_id: int):
    return get_object_or_404(Application, id=application_id)

@router.post("/", response={201: ApplicationOut})
def create_application(request, payload: ApplicationCreate):
    application = Application.objects.create(**payload.dict())
    return 201, application

@router.put("/{application_id}", response=ApplicationOut)
def update_application(request, application_id: int, payload: ApplicationCreate):
    application = get_object_or_404(Application, id=application_id)
    
    # Rule: Only Draft applications can be edited (Need More Info can just be resubmitted)
    if application.status not in [Application.Status.DRAFT, Application.Status.NEED_MORE_INFO]:
        raise HttpError(400, "Only Draft or Need More Info applications can be edited.")
        
    for attr, value in payload.dict().items():
        setattr(application, attr, value)
    application.save()
    return application

@router.post("/{application_id}/submit", response=ApplicationOut)
def submit_application(request, application_id: int):
    application = get_object_or_404(Application, id=application_id)
    try:
        application.submit()
    except ValidationError as e:
        raise HttpError(400, str(e.message))
    return application

@router.post("/{application_id}/start-review", response=ApplicationOut)
def start_review(request, application_id: int):
    application = get_object_or_404(Application, id=application_id)
    try:
        application.start_review()
    except ValidationError as e:
        raise HttpError(400, str(e.message))
    return application

@router.post("/{application_id}/record-decision", response=ApplicationOut)
def record_decision(request, application_id: int, payload: ReviewDecisionIn):
    application = get_object_or_404(Application, id=application_id)
    try:
        application.record_decision(payload.decision, payload.comment)
    except ValidationError as e:
        raise HttpError(400, str(e.message))
    return application