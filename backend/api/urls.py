from django.urls import path
from .views import LoginEmailView

urlpatterns = [path("login/", LoginEmailView.as_view())]
