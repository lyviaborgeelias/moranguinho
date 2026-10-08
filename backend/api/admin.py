from django.contrib import admin
from .models import ActivityProgress, Journey


@admin.register(ActivityProgress)
class ActivityProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "activity_id", "attempts", "completed_at"]
    list_filter = ["activity_id", "completed_at"]
    search_fields = ["user__email", "user__first_name"]


@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    list_display = ["user", "started_at"]
    search_fields = ["user__email", "user__first_name"]
