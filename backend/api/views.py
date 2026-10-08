import uuid

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .catalog import ACTIVITIES, correct_answer, public_activity
from .models import ActivityProgress, Journey


def user_payload(user):
    return {"id": user.id, "username": user.username, "email": user.email, "name": user.first_name or user.username}


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh), "user": user_payload(user)}


def journey_payload(user):
    journey, _ = Journey.objects.get_or_create(user=user)
    records = list(ActivityProgress.objects.filter(user=user))
    completed = [record.activity_id for record in records if record.completed_at]
    finished = next((record.completed_at for record in records if record.activity_id == 6), None)
    return {
        "activities": [public_activity(activity, completed) for activity in ACTIVITIES],
        "completed": completed, "xp": len(completed) * 100,
        "percent": round(len(completed) / len(ACTIVITIES) * 100),
        "attempts": sum(record.attempts for record in records),
        "started_at": journey.started_at, "finished_at": finished,
        "fragments": [activity["fragment"] for activity in ACTIVITIES if activity["id"] in completed],
    }


def password_error(password, user=None):
    try:
        validate_password(password, user)
    except ValidationError as error:
        return " ".join(error.messages)
    return None


class PublicView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


class RegisterView(PublicView):
    def post(self, request):
        fields = serializers.Serializer(data=request.data)
        # Typed fields prevent null/object values from producing a server error.
        fields.fields["name"] = serializers.CharField(max_length=150, allow_blank=False)
        fields.fields["email"] = serializers.EmailField(max_length=254)
        fields.fields["password"] = serializers.CharField(min_length=8, max_length=128, trim_whitespace=False)
        fields.fields["password_confirmation"] = serializers.CharField(max_length=128, trim_whitespace=False)
        if not fields.is_valid():
            return Response({"erro": "Confira os campos: nome e e-mail válidos, senha com pelo menos 8 caracteres.", "fields": fields.errors}, status=400)
        data = fields.validated_data
        email = data["email"].lower()
        if User.objects.filter(email__iexact=email).exists():
            return Response({"erro": "Este e-mail já está cadastrado. Entre na sua conta."}, status=409)
        if data["password"] != data["password_confirmation"]:
            return Response({"erro": "As senhas não coincidem."}, status=400)
        user = User(username=uuid.uuid4().hex, email=email, first_name=data["name"])
        error = password_error(data["password"], user)
        if error:
            return Response({"erro": error}, status=400)
        with transaction.atomic():
            user.set_password(data["password"])
            user.save()
            Journey.objects.create(user=user)
        return Response(tokens_for(user), status=201)


class LoginEmailView(PublicView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not password:
            return Response({"erro": "E-mail e senha são obrigatórios."}, status=400)
        email = email.strip()
        user = User.objects.filter(email__iexact=email).first() or User.objects.filter(username__iexact=email).first()
        if not user or not user.is_active or not user.check_password(password):
            return Response({"erro": "E-mail ou senha inválidos."}, status=401)
        return Response(tokens_for(user))


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": user_payload(request.user)})

    def patch(self, request):
        name = request.data.get("name")
        if not isinstance(name, str) or not 1 <= len(name.strip()) <= 150:
            return Response({"erro": "Informe um nome de até 150 caracteres."}, status=400)
        request.user.first_name = name.strip()
        request.user.save(update_fields=["first_name"])
        return Response({"user": user_payload(request.user)})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get("current_password")
        new = request.data.get("password")
        confirmation = request.data.get("password_confirmation")
        if not isinstance(current, str) or not request.user.check_password(current):
            return Response({"erro": "A senha atual está incorreta."}, status=400)
        if not isinstance(new, str) or len(new) > 128 or new != confirmation:
            return Response({"erro": "Confira a nova senha e sua confirmação."}, status=400)
        error = password_error(new, request.user)
        if error:
            return Response({"erro": error}, status=400)
        request.user.set_password(new)
        request.user.save(update_fields=["password"])
        return Response(tokens_for(request.user))


class PasswordResetRequestView(PublicView):
    def post(self, request):
        field = serializers.EmailField()
        try:
            email = field.run_validation(request.data.get("email")).lower()
        except serializers.ValidationError:
            return Response({"erro": "Informe um e-mail válido."}, status=400)
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/redefinir-senha/{uid}/{token}"
            send_mail("Recupere seu acesso a Tutti-Frutti", f"Olá, {user.first_name or 'aventureiro'}!\n\nCrie uma nova senha neste endereço:\n{link}\n\nSe você não pediu a alteração, ignore esta mensagem.", settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({"message": "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha."})


class PasswordResetConfirmView(PublicView):
    def post(self, request):
        try:
            user_id = force_str(urlsafe_base64_decode(request.data.get("uid", "")))
            user = User.objects.get(pk=user_id, is_active=True)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            return Response({"erro": "Link inválido ou expirado. Solicite outro."}, status=400)
        token = request.data.get("token")
        if not isinstance(token, str) or not default_token_generator.check_token(user, token):
            return Response({"erro": "Link inválido ou expirado. Solicite outro."}, status=400)
        password = request.data.get("password")
        if not isinstance(password, str) or len(password) > 128 or password != request.data.get("password_confirmation"):
            return Response({"erro": "Confira a senha e sua confirmação."}, status=400)
        error = password_error(password, user)
        if error:
            return Response({"erro": error}, status=400)
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"message": "Senha atualizada. Você já pode entrar."})


class JourneyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(journey_payload(request.user))

    def delete(self, request):
        if request.data.get("confirm") is not True:
            return Response({"erro": "Confirme que deseja reiniciar a jornada."}, status=400)
        with transaction.atomic():
            ActivityProgress.objects.filter(user=request.user).delete()
            Journey.objects.update_or_create(user=request.user, defaults={"started_at": timezone.now()})
        return Response(journey_payload(request.user))


class ActivityAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, activity_id):
        activity = next((item for item in ACTIVITIES if item["id"] == activity_id), None)
        if not activity:
            return Response({"erro": "Destino não encontrado."}, status=404)
        with transaction.atomic():
            # Lock the journey so concurrent submissions cannot award duplicate completion.
            Journey.objects.get_or_create(user=request.user)
            Journey.objects.select_for_update().get(user=request.user)
            completed = set(ActivityProgress.objects.filter(user=request.user, completed_at__isnull=False).values_list("activity_id", flat=True))
            if activity_id > 1 and activity_id - 1 not in completed:
                return Response({"erro": "Conclua o destino anterior para desbloquear esta atividade."}, status=403)
            record, _ = ActivityProgress.objects.get_or_create(user=request.user, activity_id=activity_id)
            already_completed = bool(record.completed_at)
            correct = correct_answer(activity, request.data.get("answer"))
            if not already_completed:
                record.attempts = F("attempts") + 1
                if correct:
                    record.completed_at = timezone.now()
                record.save()
        return Response({"correct": correct, "already_completed": already_completed, "fragment": activity["fragment"] if correct else None, "journey": journey_payload(request.user)})


class HealthView(PublicView):
    def get(self, request):
        return Response({"status": "ok"})
