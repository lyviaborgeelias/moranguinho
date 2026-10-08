from django.urls import path
from .views import (
    ActivityAnswerView, ChangePasswordView, HealthView, JourneyView, LoginEmailView,
    MeView, PasswordResetConfirmView, PasswordResetRequestView, RegisterView,
)

urlpatterns = [
    path("health/", HealthView.as_view()),
    path("login/", LoginEmailView.as_view()),
    path("register/", RegisterView.as_view()),
    path("me/", MeView.as_view()),
    path("password/change/", ChangePasswordView.as_view()),
    path("password/reset/", PasswordResetRequestView.as_view()),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view()),
    path("journey/", JourneyView.as_view()),
    path("activities/<int:activity_id>/answer/", ActivityAnswerView.as_view()),
]
