import re
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .catalog import ACTIVITIES
from .models import ActivityProgress


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"], EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class JourneyTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="explorer", email="explorer@example.com", first_name="Exploradora", password="CaminhoVerde42!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(self.user)}")

    def answer(self, activity_id, answer):
        return self.client.post(f"/api/activities/{activity_id}/answer/", {"answer": answer}, format="json")

    def test_registration_hashes_password_and_returns_session(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer expired-token")
        response = self.client.post("/api/register/", {"name": "Nova", "email": "NEW@example.com", "password": "PomarSecreto42!", "password_confirmation": "PomarSecreto42!"}, format="json")
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="new@example.com")
        self.assertTrue(user.check_password("PomarSecreto42!"))
        self.assertNotEqual(user.password, "PomarSecreto42!")
        self.assertIn("access", response.data)

    def test_duplicate_email_is_case_insensitive(self):
        response = self.client.post("/api/register/", {"name": "Nova", "email": "EXPLORER@example.com", "password": "PomarSecreto42!", "password_confirmation": "PomarSecreto42!"}, format="json")
        self.assertEqual(response.status_code, 409)

    def test_invalid_registration_is_rejected(self):
        for values in ({}, {"name": " ", "email": "bad@", "password": 123}, {"name": "Nome", "email": "ok@example.com", "password": "12345678", "password_confirmation": "12345678"}):
            self.assertEqual(self.client.post("/api/register/", values, format="json").status_code, 400)

    def test_login_accepts_normalized_email_and_ignores_stale_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer expired")
        response = self.client.post("/api/login/", {"email": " EXPLORER@example.com ", "password": "CaminhoVerde42!"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.client.post("/api/login/", {"email": self.user.email, "password": "CaminhoVerde42!"}, format="json").status_code, 401)

    def test_journey_requires_authentication(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/api/journey/").status_code, 401)

    def test_catalog_does_not_expose_answers_or_unearned_fragments(self):
        data = self.client.get("/api/journey/").data
        self.assertEqual(data["activities"][0]["status"], "available")
        self.assertEqual(data["activities"][1]["status"], "locked")
        for activity in data["activities"]:
            self.assertNotIn("answer", activity)
            self.assertNotIn("fragment", activity)

    def test_locked_activity_cannot_be_skipped(self):
        self.assertEqual(self.answer(6, "florescer").status_code, 403)

    def test_wrong_answer_does_not_award_progress(self):
        response = self.answer(1, "limão")
        self.assertFalse(response.data["correct"])
        self.assertEqual(response.data["journey"]["xp"], 0)
        self.assertEqual(response.data["journey"]["attempts"], 1)

    def test_all_six_challenges_unlock_and_award_certificate(self):
        for activity in ACTIVITIES:
            response = self.answer(activity["id"], activity["answer"])
            self.assertTrue(response.data["correct"])
        data = self.client.get("/api/journey/").data
        self.assertEqual(data["xp"], 600)
        self.assertEqual(data["percent"], 100)
        self.assertIsNotNone(data["finished_at"])
        self.assertEqual(" ".join(data["fragments"]), "JUNTOS O VALE VOLTA A FLORESCER")

    def test_replay_does_not_award_duplicate_points(self):
        self.answer(1, "Morango")
        self.answer(1, "morango")
        data = self.client.get("/api/journey/").data
        self.assertEqual(data["xp"], 100)
        self.assertEqual(data["attempts"], 1)

    def test_memory_rejects_duplicate_or_malformed_pairs(self):
        self.answer(1, "morango")
        self.answer(2, "30")
        for answer in (["a1"], [["a1", "a2"]] * 4, [[None, {}]]):
            self.assertFalse(self.answer(3, answer).data["correct"])

    def test_progress_is_isolated_by_user(self):
        self.answer(1, "morango")
        other = User.objects.create_user(username="other", email="other@example.com", password="CaminhoVerde42!")
        self.client.force_authenticate(other)
        self.assertEqual(self.client.get("/api/journey/").data["completed"], [])

    def test_restart_requires_confirmation_and_keeps_user(self):
        self.answer(1, "morango")
        self.assertEqual(self.client.delete("/api/journey/", {}, format="json").status_code, 400)
        response = self.client.delete("/api/journey/", {"confirm": True}, format="json")
        self.assertEqual(response.data["completed"], [])
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_profile_name_update(self):
        self.assertEqual(self.client.patch("/api/me/", {"name": " Novo Nome "}, format="json").data["user"]["name"], "Novo Nome")

    def test_password_change_checks_current_password(self):
        response = self.client.post("/api/password/change/", {"current_password": "errada", "password": "OutraSenha42!", "password_confirmation": "OutraSenha42!"}, format="json")
        self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/password/change/", {"current_password": "CaminhoVerde42!", "password": "OutraSenha42!", "password_confirmation": "OutraSenha42!"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OutraSenha42!"))

    def test_reset_email_link_and_single_use_token(self):
        self.client.credentials()
        response = self.client.post("/api/password/reset/", {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        data = {"uid": uid, "token": token, "password": "Recuperada42!", "password_confirmation": "Recuperada42!"}
        self.assertEqual(self.client.post("/api/password/reset/confirm/", data, format="json").status_code, 200)
        self.assertEqual(self.client.post("/api/password/reset/confirm/", data, format="json").status_code, 400)

    def test_refresh_returns_new_access(self):
        response = self.client.post("/api/login/", {"email": self.user.email, "password": "CaminhoVerde42!"}, format="json")
        refresh = response.data["refresh"]
        self.assertEqual(self.client.post("/api/token/refresh/", {"refresh": refresh}, format="json").status_code, 200)

    def test_localhost_cors_preflight(self):
        response = self.client.options("/api/login/", HTTP_ORIGIN="http://localhost:5173", HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST", HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type")
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:5173")
