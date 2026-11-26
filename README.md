# Segredos de Tutti-Frutti — Caça ao Tesouro

**SENAI Roberto Mange | Front-end — Atividade Somativa**

O livro de receitas da Moranguinho desapareceu! Nesta aventura, o jogador explora um jardim em 3D, conversa com seis amigas, responde aos quizzes, coleta tesouros e pistas e resolve um enigma final para recuperar o livro e liberar a festa e o certificado.

## 1. Pré-requisitos

Antes de executar o projeto, instale:

- [Python](https://www.python.org/downloads/) 3.12 ou superior (marque a opção **Add Python to PATH** na instalação para Windows).
- [Node.js](https://nodejs.org/) 22.12 ou superior, com npm.
- Um navegador atualizado, preferencialmente Google Chrome ou Microsoft Edge, com WebGL habilitado.
- [Visual Studio Code](https://code.visualstudio.com/) (opcional, para abrir o projeto e utilizar os terminais).

Confira a instalação no PowerShell:

```powershell
python --version
node --version
npm --version
```

O projeto utiliza SQLite; portanto, **não é necessário instalar MySQL, configurar um banco externo, criar uma conta ou cadastrar um superusuário** para jogar. É necessário acesso à internet para instalar as dependências pela primeira vez.

## 2. Instalação e execução no Windows

Baixe o repositório pelo GitHub (Code → Download ZIP, ou clone o repositório caso tenha acesso). Extraia o arquivo, abra a pasta do projeto no VS Code e localize a pasta que contém `README.md`, `backend` e `frontend`.

Abra dois terminais PowerShell nessa pasta. Mantenha ambos em execução enquanto utiliza o jogo.

### Terminal 1 — Backend (Django)

Execute os comandos abaixo, um de cada vez:

```powershell
cd backend
python -m venv env
.\env\Scripts\python.exe -m pip install -r requirements.txt
.\env\Scripts\python.exe manage.py migrate
.\env\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Os comandos utilizam diretamente o Python do ambiente virtual, sem precisar alterar a política de execução de scripts do PowerShell. A migração cria automaticamente o arquivo `db.sqlite3` e as tabelas necessárias.

Para confirmar que o backend está funcionando, abra <http://127.0.0.1:8000/api/health/>. O retorno esperado é:

```json
{"status":"ok"}
```

### Terminal 2 — Frontend (React)

Abra um **novo terminal na pasta raiz do projeto**, sem encerrar o backend, e execute:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1
```

### Acesso ao jogo

**Abra [http://127.0.0.1:5173/](http://127.0.0.1:5173/) no navegador.**

| Serviço | Endereço |
|---|---|
| Frontend — jogo | http://127.0.0.1:5173/ |
| Backend — API | http://127.0.0.1:8000/api/health/ |

Não é necessário configurar um arquivo `.env` para a execução local. O Vite encaminha as requisições `/api` para o Django automaticamente.

Para encerrar a aplicação, pressione `Ctrl+C` em cada terminal.

### Executar novamente após a primeira instalação

Não é necessário reinstalar as dependências a cada execução. A partir da pasta raiz, abra dois terminais:

**Terminal 1:**

```powershell
cd backend
.\env\Scripts\python.exe manage.py migrate
.\env\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

**Terminal 2:**

```powershell
cd frontend
npm run dev -- --host 127.0.0.1
```

### Linux e macOS

No backend, substitua `python -m venv env` por `python3 -m venv env` e `.\env\Scripts\python.exe` por `./env/bin/python`. Os comandos do frontend permanecem iguais.

## 3. Como jogar

1. Na tela inicial, clique em **Começar investigação** para iniciar uma partida ou **Continuar aventura** para retomar o progresso. O botão **Como jogar** apresenta o tutorial.
2. Em **Meu perfil**, informe o nome desejado para o certificado.
3. No jardim, utilize **Mostrar caminho até Laranjinha** para visualizar a trilha luminosa. A personagem é controlada manualmente pelo jogador; a trilha não movimenta a Moranguinho.
4. Caminhe até a amiga, pressione **E** ou utilize o botão de conversa. Escolha **Sobre o bilhete** ou **Pedir uma dica**, aceite a missão e responda às duas perguntas do quiz.
5. Ao aceitar a missão, encontre o tesouro e receba uma pista incompleta. Ao acertar o quiz, complete a pista, ganhe 100 XP e desbloqueie a próxima amiga. Em caso de erro, revise as respostas e tente novamente.
6. Em **Meu diário**, consulte os tesouros, as pistas e o progresso. Reorganize os cartões arrastando-os ou utilizando os controles de teclado.
7. Depois de completar as seis fases, escolha **Resolver enigma final**. Associe as seis palavras às definições correspondentes e valide a resposta. Uma solução incorreta não libera a conclusão.
8. Resolva corretamente o enigma para abrir o livro, participar da festa e receber o certificado **Guardião do Jardim**. É possível imprimir ou salvar o certificado em PDF e reiniciar a aventura.

A opção **Jogar com a lista de encontros** permite acessar a jornada sem depender do cenário 3D, sendo uma alternativa de acessibilidade e para dispositivos sem WebGL.

## 4. Controles da personagem

| Controle | Função |
|---|---|
| W, A, S, D ou setas | Caminhar |
| Shift + direção | Correr |
| E, próximo a uma amiga | Iniciar conversa |
| Arrastar o cenário com o mouse | Movimentar a câmera |
| Joystick virtual | Caminhar em dispositivos com toque |
| Botão de conversa | Interagir em dispositivos com toque |
| Tab / Shift+Tab | Navegar entre elementos interativos |
| Enter ou Espaço | Acionar botões em foco |

A Moranguinho para quando o jogador solta os controles. A aproximação de uma personagem não inicia conversas automaticamente.

## 5. Roteiro de avaliação das funcionalidades

| Funcionalidade | Como verificar |
|---|---|
| Mapa e progressão | Inicie uma nova aventura, confira os locais bloqueados e conclua o primeiro quiz para liberar o próximo. |
| Quiz dos guardiões | Responda incorretamente, verifique o feedback e depois conclua corretamente. |
| Tesouros e pistas | Aceite uma missão e consulte o diário antes e depois de concluí-la. |
| Drag and Drop | Com pistas disponíveis, arraste um cartão para alterar sua ordem no diário. |
| Navegação por teclado | Use Tab para acessar os botões Subir/Descer e Enter ou Espaço para reordenar. Também é possível usar Alt + setas nos controles. |
| Persistência | Recarregue a página no mesmo endereço e navegador, selecione Continuar aventura e confira o progresso e a ordem das pistas. |
| Enigma final | Complete as seis fases, teste uma resposta incorreta e depois a solução correta. |
| Conclusão | Confira a festa, o certificado e a possibilidade de reiniciar. |
| Geolocalização | Em Meu perfil, selecione Usar minha localização e autorize ou negue a permissão do navegador. A localização é opcional, não altera o mapa fictício e as coordenadas não são persistidas. |
| Responsividade e acessibilidade | Teste a interface em desktop e tablet, com teclado, toque e a lista alternativa de encontros. |

O progresso oficial é registrado no banco SQLite e associado ao visitante. O LocalStorage mantém uma cópia do progresso, rascunhos das respostas e a ordem das pistas. Utilize sempre o mesmo navegador e endereço para retomar a mesma partida. Iniciar outra aventura quando já existe progresso exige confirmação.

## 6. PWA — instalação e funcionamento offline

O modo de desenvolvimento não registra o Service Worker. Para avaliar a PWA, mantenha o backend rodando, interrompa o frontend de desenvolvimento com `Ctrl+C` e execute, na pasta `frontend`:

```powershell
npm run build
npm run preview -- --host 127.0.0.1
```

Acesse **[http://127.0.0.1:4173/](http://127.0.0.1:4173/)**.

1. Abra o jogo e entre na aventura enquanto estiver online. Aguarde a ativação do Service Worker.
2. Em um navegador compatível, utilize a opção de instalar o aplicativo na barra de endereços ou no menu do navegador.
3. Para simular falta de conexão, abra as ferramentas de desenvolvedor (F12), selecione Network/Rede → Offline e recarregue a página após a ativação do Service Worker.
4. Verifique o indicador offline, o acesso à aventura e a consulta e reordenação das pistas previamente coletadas.
5. Retorne ao modo online para validar novas respostas e concluir a aventura.

**Limite do modo offline:** é possível explorar, consultar e reorganizar pistas e preparar respostas. Confirmar novos quizzes, validar o enigma, editar o perfil e reiniciar a jornada exigem conexão com a API. A aplicação não armazena respostas corretas de fases bloqueadas no cache. O endereço de produção (4173) possui armazenamento local separado do endereço de desenvolvimento (5173); para avaliar a persistência, use o mesmo endereço durante o teste.

## 7. Testes automatizados

A execução dos testes é opcional para jogar. Para avaliar o código, utilize os comandos a seguir após instalar as dependências.

### Backend

A partir da raiz do projeto:

```powershell
cd backend
.\env\Scripts\python.exe manage.py check
.\env\Scripts\python.exe manage.py test
```

### Frontend

Em outro terminal, a partir da raiz:

```powershell
cd frontend
npm run lint
npm run test:unit
npm run build
```

### Testes de navegador e PWA (Playwright)

Dentro de `frontend`, faça o Python do ambiente virtual ficar disponível para o Playwright sem precisar ativar scripts do PowerShell:

```powershell
$env:Path = "$(Resolve-Path ..\backend\env\Scripts);$env:Path"
python -m django --version
npx playwright install chromium
npm test
npm run test:pwa
```

Encerre previamente servidores de teste/preview que estejam usando as portas 8011, 5180 e 4173. O Playwright inicia uma API isolada (8011) com SQLite temporário, o frontend de teste (5180) ou o preview PWA (4173), sem modificar o banco da partida local.

### Registro de validação

- Backend: 26 testes aprovados na revisão anterior, cujo backend foi mantido na versão com controles manuais.
- Frontend: 12 testes unitários aprovados, incluindo os cinco de movimentação manual.
- ESLint e verificações do Django: aprovados.
- Build de produção e testes Playwright: preparados, mas não confirmados no ambiente utilizado para a revisão devido a limitações de dependências e navegação local.
- Conformidade integral WCAG AA: requer auditoria manual e no navegador.

Consulte [docs/validacao.md](docs/validacao.md) para a matriz de requisitos e as evidências disponíveis. A atualização deste README não altera o código nem constitui uma nova execução dos testes.

## 8. Solução de problemas

| Problema | Solução |
|---|---|
| `python` não reconhecido | Instale Python 3.12+ com PATH e reabra o terminal. |
| `npm` não reconhecido | Instale Node.js 22.12+ e reabra o terminal. |
| Porta 5173 ocupada | Encerre a instância anterior com Ctrl+C ou utilize o comando alternativo abaixo. |
| Porta 8000 ocupada | Encerre o backend anterior antes de iniciar o Django novamente. |
| Falha na comunicação com a API | Confira se o Django está rodando e se `/api/health/` retorna `status: ok`. |
| Erros de banco/tabelas | Execute `manage.py migrate` com o Python do ambiente virtual. |
| Cenário 3D não aparece | Use um navegador com WebGL ou selecione Jogar com a lista de encontros. |
| PWA não instala | Utilize o build de produção em 4173, aguarde o Service Worker e confira se o navegador oferece instalação. |
| Avisos de vulnerabilidades do npm | Execute `npm audit` para verificar as dependências afetadas. Não use `npm audit fix --force` sem revisar as alterações e testar o projeto. |

Se a porta 5173 estiver ocupada, uma alternativa que não exige encerrar outros programas é executar no frontend:

```powershell
npm run dev -- --host 127.0.0.1 --port 5174
```

Nesse caso, abra <http://127.0.0.1:5174/>. O progresso local de uma porta não é necessariamente compartilhado com a outra.

Para atualizar uma instalação anterior preservando o progresso do banco, faça backup do arquivo `backend/db.sqlite3`, copie-o para a nova instalação e execute `manage.py migrate`. O ZIP não inclui ambientes virtuais, `node_modules`, banco antigo ou histórico Git. Uma partida antiga que terminou o sexto quiz ainda deverá resolver o novo enigma final.

## 9. Tecnologias e estrutura do projeto

- React, Vite, JavaScript, HTML semântico e CSS — interface e navegação.
- Three.js — cenário 3D, personagens e movimentação.
- Django e Django REST Framework — API e validação das regras do jogo.
- SQLite e LocalStorage — persistência de dados.
- Web App Manifest e Service Worker — PWA e cache offline.
- APIs do navegador — Geolocation e Drag and Drop.
- ESLint, Node Test Runner, testes Django e Playwright — qualidade e testes.

```text
moranguinho/
├── backend/
│   ├── api/               # Modelos, missões, regras, endpoints e testes
│   ├── backend/           # Configurações Django
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/            # Recursos estáticos
│   ├── src/
│   │   ├── components/    # Componentes da interface
│   │   ├── game/          # Cenário e movimentação manual
│   │   ├── pages/         # Telas do jogo
│   │   ├── services/      # Comunicação com a API
│   │   └── styles/        # Estilos
│   ├── tests/             # Testes de interface
│   ├── tests-pwa/         # Testes PWA
│   ├── unit/              # Testes unitários
│   └── package.json
├── docs/                  # Documentação e evidências de validação
└── README.md
```

A configuração padrão é destinada à execução local para avaliação. `DJANGO_DB_PATH`, `DJANGO_DEBUG` e `DJANGO_SECRET_KEY` podem ser definidos no ambiente. `VITE_API_URL` e `API_PROXY_TARGET` permitem configurar uma API alternativa quando necessário. Uma publicação externa requer HTTPS e configurações de segurança adequadas.
