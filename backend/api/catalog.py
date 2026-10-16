"""Conteúdo público dos desafios e respostas mantidas somente no servidor."""
import unicodedata

ACTIVITIES = [
    dict(id=1, title="O labirinto de espinhos", place="Casa da Moranguinho", kind="maze", skill="Estratégia", minutes=4,
         board=["#######", "#S..#E#", "#.#.#.#", "#X#...#", "#.#X#.#", "#..K..#", "#######"], start=[1, 1],
         case_file="Dossiê 01 · O labirinto de espinhos",
         obstacle="Você tem três corações. Cercas bloqueiam a passagem e espinhos tiram um coração.",
         story="O livro de receitas da festa desapareceu! Moranguinho avistou um envelope atrás das cercas do jardim. Leve-a até a chave e depois ao envelope para começar a investigação.",
         question="Recupere o envelope sem perder todos os corações.",
         hint="O corredor da direita leva ao envelope. Busque a chave por baixo; evite as casas marcadas com espinhos.",
         answer=[[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 4], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5]], fragment="AMIZADE", x=17, y=66, color="rose", icon="sprout"),
    dict(id=2, title="O cadeado da despensa", place="Cozinha da Moranguinho", kind="lock", skill="Dedução", minutes=5,
         lock_clues=["Os três algarismos são diferentes. A soma deles é 19.", "O algarismo do meio é o dobro do primeiro.", "O último algarismo é três unidades maior que o primeiro."],
         case_file="Dossiê 02 · A receita interrompida",
         obstacle="Combine as três pistas para descobrir uma única combinação. Gire cada disco do cadeado.",
         story="O envelope trouxe Moranguinho à cozinha. Na despensa trancada, três anotações da receita escondem a combinação do cadeado. Cruze as informações para recuperar a próxima pista.",
         question="Qual combinação abre a despensa?",
         hint="Chame o primeiro algarismo de x. A soma será x + 2x + (x + 3) = 19. Depois confira as três pistas.",
         answer="487", fragment="MORANGO", x=32, y=36, color="purple", icon="flower"),
    dict(id=3, title="Memórias das amigas", place="Jardim das Amigas", kind="memory", skill="Memória", minutes=4,
         case_file="Dossiê 03 · As fotos rasgadas",
         obstacle="As fotos foram viradas para baixo. Você terá de memorizar posições antes que as pistas desapareçam.",
         story="Dentro da despensa havia um álbum de frutas com doze cartas viradas. As amigas esconderam a próxima pista entre os pares. Cada tentativa revela apenas duas cartas: memorize bem!",
         question="Encontre os seis pares em até 14 jogadas.",
         max_turns=14,
         cards=[dict(id="a1", symbol="leaf", name="Moranguinho"), dict(id="a2", symbol="leaf", name="Moranguinho"),
                dict(id="b1", symbol="sun", name="Laranjinha"), dict(id="b2", symbol="sun", name="Laranjinha"),
                dict(id="c1", symbol="flower", name="Uvinha"), dict(id="c2", symbol="flower", name="Uvinha"),
                dict(id="d1", symbol="berry", name="Mirtilo"), dict(id="d2", symbol="berry", name="Mirtilo"),
                dict(id="e1", symbol="cherry", name="Cereja"), dict(id="e2", symbol="cherry", name="Cereja"),
                dict(id="f1", symbol="lemon", name="Limão"), dict(id="f2", symbol="lemon", name="Limão")],
         hint="Memorize cada posição. Uma carta repetida pode confirmar uma pista importante.",
         answer=[["a1", "a2"], ["b1", "b2"], ["c1", "c2"], ["d1", "d2"], ["e1", "e2"], ["f1", "f2"]], fragment="ALEGRIA", x=53, y=60, color="blue", icon="water"),
    dict(id=4, title="O portão das lanternas", place="Praça da Cidade do Morango", kind="lights", skill="Planejamento", minutes=5,
         lights=[1, 0, 1, 0, 0, 0, 1, 0, 1], move_limit=8,
         case_file="Dossiê 04 · O portão das lanternas",
         obstacle="Cada botão também muda os vizinhos. Você tem oito movimentos para apagar o painel inteiro.",
         story="As amigas seguiram as pegadas até um portão iluminado. O mecanismo só abre quando todas as lanternas se apagam. Planeje os toques antes de começar.",
         question="Apague as nove lanternas para liberar a passagem.",
         hint="Tocar duas vezes na mesma casa desfaz a mudança. Experimente pensar em pares de cantos opostos.",
         answer=[0, 2, 6, 8], fragment="CARINHO", x=64, y=24, color="gold", icon="clock"),
    dict(id=5, title="A trilha de migalhas", place="Pomar das Amigas", kind="order", skill="Reconstrução", minutes=4,
         case_file="Dossiê 05 · A trilha de migalhas",
         obstacle="As seis placas estão embaralhadas. Mova-as para cima ou para baixo até formar uma rota que respeite todas as pistas.",
         story="Depois do portão, Moranguinho encontrou seis placas caídas. As anotações na cesta revelam a ordem dos lugares visitados por quem levou o livro. Reconstrua a rota.",
         question="Organize as seis paradas usando as anotações abaixo.",
         items=["Pomar", "Casa da árvore", "Praça", "Cozinha", "Jardim", "Ponte"],
         question_clues=["A trilha começa na cozinha e termina na casa da árvore.", "O jardim vem imediatamente depois da cozinha.", "A praça fica entre a ponte e o pomar, nessa ordem e sem paradas extras."],
         hint="Fixe cozinha e jardim no começo e casa da árvore no final. Encaixe ponte → praça → pomar no espaço que sobrou.",
         answer=["cozinha", "jardim", "ponte", "praca", "pomar", "casa da arvore"], fragment="CUIDADO", x=82, y=45, color="green", icon="book"),
    dict(id=6, title="O segredo da amizade", place="Casa da Árvore", kind="cipher", skill="Decifração", minutes=5,
         case_file="Dossiê 06 · A mensagem final",
         obstacle="O bilhete está protegido por uma cifra. Sem decifrar a mensagem, o nome do responsável continuará oculto.",
         story="Na casa da árvore, Moranguinho encontrou o último bilhete. O autor usou um código para esconder a verdade: cada letra foi deslocada três posições no alfabeto.",
         question="Descubra a palavra secreta:",
         cipher="DPLJRV", hint="Volte três letras em cada disco: D → A, P → M. Continue usando o mesmo deslocamento.",
         revelation="Caso resolvido! As amigas guardaram o livro no cofre para preparar uma festa surpresa para Moranguinho. Os bilhetes eram um convite para a caça ao tesouro. Abra o livro e comemore com elas!",
         answer="amigos", fragment="AMIGOS", x=84, y=15, color="rose", icon="tree"),
]


def normalize(value):
    if isinstance(value, str):
        return "".join(c for c in unicodedata.normalize("NFKD", value.strip().lower()) if not unicodedata.combining(c))
    if isinstance(value, list):
        return [normalize(item) for item in value]
    return value


def correct_answer(activity, answer):
    if activity["kind"] == "maze":
        if not isinstance(answer, list) or not 2 <= len(answer) <= 500:
            return False
        previous = None
        has_key = False
        for position in answer:
            if not isinstance(position, list) or len(position) != 2 or any(type(v) is not int for v in position):
                return False
            r, c = position
            if not 0 <= r < len(activity["board"]) or not 0 <= c < len(activity["board"][r]):
                return False
            tile = activity["board"][r][c]
            if tile in "#X" or (previous is None and position != activity["start"]):
                return False
            if previous is not None and abs(r - previous[0]) + abs(c - previous[1]) != 1:
                return False
            if tile == "E" and not has_key:
                return False
            has_key = has_key or tile == "K"
            previous = position
        return has_key and activity["board"][previous[0]][previous[1]] == "E"
    if activity["kind"] == "lights":
        if not isinstance(answer, list) or not 1 <= len(answer) <= activity["move_limit"] or any(type(i) is not int or not 0 <= i < 9 for i in answer):
            return False
        cells = activity["lights"][:]
        for index in answer:
            cells = [1 - value if abs(i // 3 - index // 3) + abs(i % 3 - index % 3) <= 1 else value for i, value in enumerate(cells)]
        return not any(cells)
    if activity["kind"] == "memory":
        if not isinstance(answer, list) or any(not isinstance(pair, list) or len(pair) != 2 or any(not isinstance(card, str) for card in pair) for pair in answer):
            return False
        return sorted(sorted(pair) for pair in answer) == sorted(sorted(pair) for pair in activity["answer"])
    return normalize(answer) == normalize(activity["answer"])


def public_activity(activity, completed):
    payload = {key: value for key, value in activity.items() if key not in ("answer", "fragment", "revelation")}
    payload["status"] = "completed" if activity["id"] in completed else "available" if activity["id"] == 1 or activity["id"] - 1 in completed else "locked"
    if activity["id"] in completed:
        payload["fragment"] = activity["fragment"]
        if "revelation" in activity:
            payload["revelation"] = activity["revelation"]
    return payload
