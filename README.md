# Segredos de Tutti-Frutti

Aventura educativa full stack com React/Vite e Django REST. O mapa tem seis destinos com enigmas, sequência lógica, jogo da memória, quiz, ordenação e decifração. Cada descoberta desbloqueia o próximo destino, revela uma palavra e adiciona 100 pontos.

## Rodar o projeto

Requisitos: Node.js 22.12+ e Python 3.12+ (Django 6). Mantenha dois terminais abertos.

### Terminal 1 — API

No PowerShell, a partir da pasta do projeto:

```powershell
cd backend
python -m venv env
.\env\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Se já possui um ambiente virtual, apenas ative-o. Se o PowerShell bloquear a ativação, use diretamente `env\Scripts\python.exe` no lugar de `python`.

### Terminal 2 — interface

```powershell
cd frontend
npm ci
npm run dev
```

Abra **http://localhost:5173**, clique em “Começar minha aventura” e crie uma conta. Cadastro e login abrem diretamente `/aventura`. O Vite encaminha `/api` ao Django; não é necessário alterar CORS ou usar outra porta. A porta 5173 é fixa: encerre a instância anterior se estiver ocupada.

## Funcionalidades para demonstrar

1. Crie uma conta e entre no mapa. E-mails duplicados e senhas fracas são rejeitados.
2. Abra o pomar pelo ponto no mapa, use a dica e descubra o primeiro fragmento.
3. Explore os seis desafios. Destinos futuros ficam bloqueados até concluir o anterior.
4. Confira “Meu diário”, as palavras coletadas e as conquistas.
5. Saia e entre novamente: o progresso fica salvo no SQLite **por usuário**, inclusive entre navegadores.
6. Atualize seu nome ou sua senha em “Meu perfil”.
7. Termine o sexto destino para obter o certificado e imprimir ou salvar em PDF.
8. “Reiniciar jornada” pede confirmação e reinicia apenas o progresso da conta atual.

“Lembrar de mim” salva a sessão no navegador; desmarcado, ela dura a sessão da aba. Tokens de acesso são renovados automaticamente com o refresh token.

## Recuperação de senha

A tela “Esqueci a senha” envia um link com token de uso único e validade de uma hora. Para desenvolvimento, o Django **imprime o e-mail no terminal**: copie o link mostrado e abra no navegador. Não há um serviço SMTP contratado no projeto.

Para enviar e-mails reais, configure as variáveis `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` e `DEFAULT_FROM_EMAIL`. `FRONTEND_URL` define a origem dos links (padrão `http://localhost:5173`).

## Validação

```powershell
# Na pasta backend — testes com banco isolado em memória
python -B manage.py check
python -B manage.py test api

# Na pasta frontend
npm run lint
npm run build
npm exec playwright install chromium
npm test
```

Os testes de navegador iniciam a API na porta 8011 com um SQLite temporário e a interface na porta 5180. Não usam nem restauram `backend/db.sqlite3`.

## Estrutura

- `frontend/src/pages/`: apresentação e área autenticada.
- `frontend/src/components/Challenge.jsx`: seis tipos de atividades.
- `frontend/src/context/`: estado de autenticação.
- `backend/api/catalog.py`: conteúdo e validação das respostas no servidor.
- `backend/api/models.py`: jornada e tentativas por usuário.
- `backend/api/tests.py` e `frontend/tests/`: testes funcionais.

As respostas corretas e os fragmentos não conquistados não são enviados no catálogo da API. A conclusão é validada no Django. O painel `/admin/` permite consultar progresso e usuários com uma conta criada por `python manage.py createsuperuser`.

## Configuração

A API usa SQLite e configurações locais de desenvolvimento. `DJANGO_SECRET_KEY`, `DJANGO_DEBUG` e `DJANGO_DB_PATH` podem ser definidos no ambiente. `VITE_API_URL` é opcional para hospedar a interface com outra origem de API.

A imagem original foi preservada. O novo mapa `frontend/public/imagens/tutti-frutti-map.png` foi criado com imagegen; o prompt está em `docs/map-art.md`.
