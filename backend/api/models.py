from django.conf import settings
from django.db import models


class Journey(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journey")
    started_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Jornada de {self.user}"


class ActivityProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_progress")
    activity_id = models.PositiveSmallIntegerField()
    attempts = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["activity_id"]
        constraints = [models.UniqueConstraint(fields=["user", "activity_id"], name="unique_user_activity")]

    def __str__(self):
        return f"{self.user} · destino {self.activity_id}"
