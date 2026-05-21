from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from tracker.api import router as tracker_router

# Instantiate the API
api = NinjaAPI(title="Workflow Tracker API", version="1.0.0")

# Register our tracker endpoints under /api/applications/
api.add_router("/applications/", tracker_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]