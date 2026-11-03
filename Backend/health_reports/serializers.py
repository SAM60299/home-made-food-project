from rest_framework import serializers
from .models import MedicalReport, MedicalReportAIConsent

class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = "__all__"

class MedicalReportAIConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReportAIConsent
        fields = "__all__"