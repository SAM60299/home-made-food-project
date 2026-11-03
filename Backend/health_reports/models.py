import uuid
from django.db import models
from django.contrib.auth.models import User

class MedicalReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="medical_reports", null=True, blank=True)
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100)
    report_date = models.DateField(null=True, blank=True)
    private_notes = models.TextField(blank=True, default="")
    supabase_file_path = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

class MedicalReportAIConsent(models.Model):
    report = models.OneToOneField(MedicalReport, on_delete=models.CASCADE, related_name="ai_consent")
    explicitly_consented = models.BooleanField(default=False)
    policy_version = models.CharField(max_length=50, default="v1.0-2026")
    consented_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)