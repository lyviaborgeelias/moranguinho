# Validação — Segredos de Tutti-Frutti

Revisão realizada em 26/11/2026, com base nas oito páginas do enunciado SENAI **5.01-FR-97 v.4 — Caça ao Tesouro**. O cenário 3D, a identidade visual, os quizzes e os recursos originais foram preservados; esta versão complementa os critérios faltantes. O ZIP original não foi modificado.

## Matriz de requisitos

| Requisito | Implementação | Evidência / limitação |
|---|---|---|
| 4.1 Mapa (OBR) | Cenário 3D, trilha exclusivamente visual, caminhada manual, estados, lista alternativa disponível | Progressão testada pela API; navegação visual precisa ser testada no navegador |
| 4.2 Progressão (OBR) | Ordem sequencial, bloqueio de fases futuras, estados | Testes Django aprovados |
| 4.3 Tesouros (DES) | Seis objetos associados às amigas; encontrados ao iniciar missão e exibidos no quiz/diário | Teste de persistência Django aprovado |
| 4.4 Quiz (OBR) | Duas perguntas por encontro, feedback, revisão, desbloqueio após acerto | Testes Django aprovados; fluxo de UI a confirmar |
| 4.5 Inventário (OBR) | Diário, tesouros e estados, pistas parciais, Drag and Drop nativo, botões de reordenação, Alt+setas, ARIA, anúncios de movimentação | Lógica de ordenação testada no Node; interação real de navegador a confirmar |
| 4.6 Enigma final (OBR) | Seis pistas ordenadas por definições; API valida ordem e só libera festa/certificado ao resolver | Testes de solução correta, incorreta, inválida, acesso prematuro, persistência e reset aprovados |
| 4.7 Salvamento local (DES) | Snapshot por visitante, rascunho de quiz, ordem, progresso, tesouros, pistas, resultados; API mantém progresso oficial | Testes Node e Django aprovados |
| 7 Telas | Inicial, continuar, tutorial, mapa, quiz, inventário, enigma, conclusão e opção reiniciar | Implementações presentes; testes visuais pendentes |
| 8 Estados | Bloqueado, disponível, em andamento, concluído; pista bloqueada/incompleta/completa; quiz não respondido/incorreto/correto; online/offline | Testes de estados e persistência aprovados |
| 9 Desktop/tablet | CSS responsivo mantido e ampliado; controles de toque e alternativa ao 3D | Testes Playwright preparados, mas execução bloqueada neste ambiente |
| 10 Acessibilidade | Teclado, labels, ARIA, foco visível, diálogo nativo, alternativa ao cenário, redução de movimentos CSS | WCAG AA integral não certificada; requer auditoria em navegador/leitor de tela |
| Geolocalização | Bússola real opcional no perfil via `navigator.geolocation`, com sucesso, erro, permissão negada e opção de limpar | Sem persistência de coordenadas; teste Playwright preparado |
| PWA | Manifest, ícones 192/512, Service Worker versionado, precache e fallback offline | Testes Node da geração e estratégia de cache aprovados; instalação e uso real precisam ser confirmados |
| Entrega | README atualizado e comandos de instalação/testes | GitHub privado, acesso à professora e entrega são ações da equipe |

O enunciado lista geolocalização e PWA como conteúdos formativos, sem especificar regras de localização real nem exigir validação de todas as novas respostas offline. A localização real é independente do mapa fictício. Para evitar respostas corretas expostas no cliente e progresso não validado, offline é possível explorar, consultar, ordenar e preparar respostas; novas recompensas e a conclusão exigem a API. Fontes externas têm fallback tipográfico local.

## Resultados efetivamente executados

| Verificação | Resultado |
|---|---|
| Django `manage.py check` | Aprovado, nenhum problema |
| Django `manage.py test` | 26/26 aprovados |
| Django `makemigrations --check --dry-run` | Nenhuma alteração pendente |
| Migração em cópia isolada do banco original | Aprovada: `api.0002` aplicada |
| ESLint (`eslint . --max-warnings=0`) | Aprovado, código 0 |
| Node `node --test unit/*.test.js` | 12/12 aprovados (5 testes novos de movimento manual) |
| Vite `build` | Bloqueado: dependência nativa Rolldown para Linux ausente; pacote original contém binding Windows e rede/DNS não permite baixar dependências |
| Playwright | Tentativa dos 7 testes existentes via compilação temporária alternativa: navegador impediu navegação local (`ERR_BLOCKED_BY_ADMINISTRATOR`); não houve teste funcional de UI executado com sucesso |
| Playwright descoberta de testes | 8 testes de UI + 1 teste PWA descobertos; executar na máquina de desenvolvimento |

**Total: 38 testes automatizados de backend e lógica/cache aprovados.** Os 26 testes Django são da revisão anterior; o backend não foi alterado nesta revisão. O ESLint e as verificações de migração são adicionais e não foram contados como testes. O build de produção, a instalação PWA, a renderização WebGL e a auditoria integral de WCAG AA não foram confirmados. Não se deve interpretar este relatório como garantia de nota ou certificação de acessibilidade.

## Checklist de validação antes da apresentação

1. Instalar dependências limpas com `npm ci`, usando Node >=22.12 e Python >=3.12.
2. Rodar o build, o teste de UI (`npm test`) e o teste PWA (`npm run test:pwa`). Ativar o ambiente Python do backend no terminal que executa Playwright.
3. No navegador, validar os seis encontros, erros e acertos, arraste e teclado, erro e acerto do enigma, certificado, reinício, retomada e comportamento em 1280×720 e 1024×768.
4. Verificar foco, contraste e leitor de tela com axe DevTools/Lighthouse e navegação manual; corrigir eventuais achados WCAG AA.
5. Validar instalação pelo menu do navegador e modo offline em `npm run preview`, após uma primeira abertura online. Reconectar para concluir as novas respostas.
6. Manter repositório GitHub privado, adicionar `@marianyMorais` e entregar até 06/12/2026.

## Revisão de controles manuais

A personagem só se desloca com WASD, setas ou controles direcionais de toque. Shift isolado não provoca movimento; soltar o controle interrompe o deslocamento. A trilha é recalculada como orientação visual, sem controlar posição ou abrir diálogos. Aproximar-se de uma amiga permite iniciar conversa por E ou botão. A alternativa de lista de encontros foi preservada para acessibilidade. Cinco testes unitários novos validam a lógica de movimento, incluindo ausência de deslocamento com trilha ativa, parada, corrida, joystick e colisões. O teste Playwright de exploração foi reescrito para verificar a imobilidade após selecionar o caminho e após concluir uma missão, e a conversa iniciada manualmente. A execução visual continua pendente devido às limitações do ambiente descritas acima.
