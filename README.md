# Segredos de Tutti-Frutti

O livro de receitas da Moranguinho desapareceu. Explore o jardim em 3D, converse com seis amigas e reúna as palavras que levam à surpresa da clareira. O jogo usa React, Vite, Three.js, Django REST e SQLite.

## Como rodar o projeto

Instale **Python 3.12 ou superior** e **Node.js 22.12 ou superior** (com npm). Abra dois terminais na pasta que contém este README e mantenha os dois abertos enquanto joga.

### Terminal 1 — API Django

`env` é o ambiente virtual do backend. Os comandos abaixo usam o Python desse ambiente diretamente, sem precisar ativá-lo no PowerShell.

```powershell
cd backend
python -m venv env
.\env\Scripts\python.exe -m pip install -r requirements.txt
.\env\Scripts\python.exe -B manage.py migrate
.\env\Scripts\python.exe -B manage.py runserver 127.0.0.1:8000
```

Se o ambiente já existir e as dependências estiverem instaladas, execute `cd backend` e os dois comandos de `manage.py`. Para confirmar que a API iniciou, abra [a página de diagnóstico](http://127.0.0.1:8000/api/health/). Ela retorna `{"status":"ok"}`.

No Linux ou macOS, use `python3 -m venv env` para criar o ambiente e `./env/bin/python` nos comandos seguintes.

### Terminal 2 — Jogo no navegador

No segundo terminal, parta novamente da pasta que contém este README:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1
```

Abra [o jogo](http://127.0.0.1:5173/) e clique em **Começar investigação**. A partida começa como visitante. O Vite encaminha as chamadas de `/api` ao Django, e o progresso fica associado ao navegador em que você joga.

Para encerrar, pressione **Ctrl+C** em cada terminal. Se a porta 8000 ou 5173 estiver ocupada, encerre a instância anterior do projeto antes de reiniciar.

## Como apresentar

1. Em **Meu perfil**, informe o nome que deve aparecer no certificado.
2. No jardim, use **Seguir até Laranjinha**. Mostre a trilha luminosa, depois escolha **Sobre o bilhete** ou **Pedir uma dica** durante a conversa.
3. Aceite a missão e responda às duas perguntas sobre *Moranguinho: Aventuras em Tutti-Frutti*. Caso uma resposta esteja incorreta, o jogo indica o que precisa ser revisto. Uma pista completa vale 100 XP e desbloqueia o próximo encontro.
4. Use **Meu diário** para rever as descobertas e **Conquistas** para acompanhar as três medalhas.
5. Depois da sexta pista, escolha **Participar da festa**, abra o livro e receba o certificado **Guardião do Jardim**. A opção de impressão também permite salvar em PDF.

Use WASD ou as setas para caminhar, Shift para correr, E para conversar e arraste o cenário para olhar ao redor. No celular, use o joystick e o botão de conversa. Se o navegador não iniciar o cenário 3D, **Jogar com a lista de encontros** permite continuar a mesma aventura.

## Validação

```powershell
# Na pasta backend
.\env\Scripts\python.exe -B manage.py check
.\env\Scripts\python.exe -B manage.py test api

# Na pasta frontend
npm run lint
npm run build
npm exec playwright install chromium
npm test
```

O Playwright inicia a API na porta 8011, usando um SQLite temporário, e a interface na porta 5180. Os testes não alteram o banco da partida local.

## Estrutura

- `frontend/src/game/`: cenário, personagens, navegação e diálogos.
- `frontend/src/components/`: encontros, perguntas e festa final.
- `backend/api/catalog.py`: conteúdo das missões e correção das respostas.
- `backend/api/models.py`: progresso e tentativas.
- `docs/logo-art.md`: referência visual da marca.

A API usa configurações locais de desenvolvimento. `DJANGO_DB_PATH`, `DJANGO_DEBUG` e `DJANGO_SECRET_KEY` podem ser definidos no ambiente. `VITE_API_URL` é opcional para hospedar a interface com outra origem de API.
