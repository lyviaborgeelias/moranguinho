"""Servidor exclusivamente para testes de navegador; nunca usa o banco do projeto."""
import os
import tempfile
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

with tempfile.TemporaryDirectory(prefix="tutti-frutti-browser-") as directory:
    os.environ["DJANGO_DB_PATH"] = str(Path(directory) / "test.sqlite3")
    import django
    django.setup()
    from django.core.management import call_command
    call_command("migrate", interactive=False, verbosity=0)
    call_command("runserver", "127.0.0.1:8011", use_reloader=False)
