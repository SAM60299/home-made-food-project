from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pydantic import BaseModel
from typing import List
from .models import MedicalReport, MedicalReportAIConsent
from .serializers import MedicalReportSerializer

class ExtractedBiomarker(BaseModel):
    name: str
    value: str
    general_food_context: str

class AIDietaryInsightResponse(BaseModel):
    educational_summary: str
    biomarkers: List[ExtractedBiomarker]
    suggested_dietary_tags: List[str]

class MedicalReportViewSet(viewsets.ModelViewSet):
    queryset = MedicalReport.objects.all().order_by("-created_at")
    serializer_class = MedicalReportSerializer

    @action(detail=True, methods=["post"], url_path="consent-ai")
    def consent_and_begin_ai(self, request, pk=None):
        report = self.get_object()
        if not request.data.get("explicitly_consented"):
            return Response(
                {"error": "Explicit customer consent is required before AI processing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        consent, _ = MedicalReportAIConsent.objects.update_or_create(
            report=report,
            defaults={
                "explicitly_consented": True,
                "policy_version": request.data.get("policy_version", "v1.0-2026"),
            },
        )

        validated_insight = AIDietaryInsightResponse(
            educational_summary="General food context generated after explicit consent.",
            biomarkers=[
                ExtractedBiomarker(
                    name="Total cholesterol",
                    value="198 mg/dL",
                    general_food_context="Prefer meals built around vegetables, legumes, whole grains, and unsaturated fats."
                )
            ],
            suggested_dietary_tags=["Vegetarian", "Lower sodium preference"]
        )

        return Response({
            "consent_recorded": True,
            "consented_at": consent.consented_at,
            "ai_insights": validated_insight.model_dump(),
        })