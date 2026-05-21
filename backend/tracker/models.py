import uuid
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class Application(models.Model):
    class ApplicationType(models.TextChoices):
        RECORDATION = 'Recordation', 'Recordation'
        RENEWAL = 'Renewal', 'Renewal'
        CHANGE_OF_OWNERSHIP = 'Change of Ownership', 'Change of Ownership'
        CHANGE_OF_NAME = 'Change of Name', 'Change of Name'
        DISCONTINUATION = 'Discontinuation', 'Discontinuation'

    class Status(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        SUBMITTED = 'Submitted', 'Submitted'
        UNDER_REVIEW = 'Under Review', 'Under Review'
        NEED_MORE_INFO = 'Need More Information', 'Need More Information'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'

    # Auto-generate a unique string for the tracking number
    tracking_number = models.CharField(max_length=50, unique=True, editable=False)
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=255)
    application_type = models.CharField(max_length=50, choices=ApplicationType.choices)
    description = models.TextField()
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.DRAFT)
    reviewer_comment = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            # Generate tracking number like APP-1A2B3C
            self.tracking_number = f"APP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    # --- State Transition Logic ---
    
    def submit(self):
        if self.status not in [self.Status.DRAFT, self.Status.NEED_MORE_INFO]:
            raise ValidationError("Only Draft or Need More Info applications can be submitted.")
        self.status = self.Status.SUBMITTED
        self.submitted_at = timezone.now()
        self.save()

    def start_review(self):
        if self.status != self.Status.SUBMITTED:
            raise ValidationError("Only Submitted applications can be reviewed.")
        self.status = self.Status.UNDER_REVIEW
        self.save()

    def record_decision(self, decision, comment=None):
        if self.status != self.Status.UNDER_REVIEW:
            raise ValidationError("Only applications Under Review can receive a decision.")
        
        if decision in [self.Status.NEED_MORE_INFO, self.Status.REJECTED] and not comment:
            raise ValidationError(f"A comment is required when decision is {decision}.")

        self.status = decision
        if comment:
            self.reviewer_comment = comment
        self.reviewed_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.tracking_number} - {self.company_name}"