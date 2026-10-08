"""Conteúdo público dos desafios e respostas mantidas somente no servidor."""
import unicodedata

ACTIVITIES = [
    dict(id=1, title="O portão do pomar", place="Pomar dos Morangos", kind="riddle", skill="Observação", minutes=2,
         story="Uma inscrição no portão diz que apenas quem reconhece o símbolo do vale pode passar. As folhas escondem a primeira palavra do registro.",
         question="Uso uma coroa verde, visto vermelho e carrego minhas sementes por fora. Quem sou eu?",
         hint="A resposta dá nome à fruta que aparece nas casas e plantações do vale.",
         answer="morango", fragment="JUNTOS", x=17, y=66, color="rose", icon="sprout"),
    dict(id=2, title="O jardim dos padrões", place="Bosque Encantado", kind="sequence", skill="Lógica", minutes=3,
         story="A guardiã do bosque plantou flores em grupos. A cada canteiro, uma nova regra se revela. Descubra quantas flores ela vai plantar a seguir.",
         question="Complete a sequência de flores: 2, 6, 12, 20, …",
         sequence=[2, 6, 12, 20], options=["24", "28", "30", "32"],
         hint="As diferenças entre os números são 4, 6 e 8. Qual será a próxima diferença?",
         answer="30", fragment="O", x=32, y=36, color="purple", icon="flower"),
    dict(id=3, title="Os reflexos do lago", place="Lago Cristalino", kind="memory", skill="Memória", minutes=4,
         story="O lago espelha pequenos símbolos do vale. Vire duas cartas de cada vez e encontre os quatro pares para acalmar as águas.",
         question="Encontre os quatro pares de símbolos.",
         cards=[dict(id="a1", symbol="leaf", name="Folha"), dict(id="a2", symbol="leaf", name="Folha"),
                dict(id="b1", symbol="sun", name="Sol"), dict(id="b2", symbol="sun", name="Sol"),
                dict(id="c1", symbol="flower", name="Flor"), dict(id="c2", symbol="flower", name="Flor"),
                dict(id="d1", symbol="berry", name="Morango"), dict(id="d2", symbol="berry", name="Morango")],
         hint="Observe onde cada símbolo apareceu. As cartas mantêm sua posição durante o desafio.",
         answer=[["a1", "a2"], ["b1", "b2"], ["c1", "c2"], ["d1", "d2"]], fragment="VALE", x=53, y=60, color="blue", icon="water"),
    dict(id=4, title="O relógio dos ventos", place="Torre do Relógio", kind="quiz", skill="Conhecimento", minutes=3,
         story="A torre mede o tempo e observa o céu. Responda às três perguntas do seu antigo zelador para fazer as engrenagens girarem.",
         question="Resolva as três perguntas da torre.",
         questions=[
             dict(prompt="Qual instrumento mostra a direção do vento?", options=["Biruta", "Termômetro", "Ampulheta"]),
             dict(prompt="Em qual direção o Sol nasce, aproximadamente?", options=["Oeste", "Leste", "Sul"]),
             dict(prompt="Quantos minutos existem em uma hora?", options=["30", "60", "100"])],
         hint="Uma biruta acompanha o vento; pense nos pontos cardeais e no relógio.",
         answer=["biruta", "leste", "60"], fragment="VOLTA", x=64, y=24, color="gold", icon="clock"),
    dict(id=5, title="As páginas da chuva", place="Biblioteca Verde", kind="order", skill="Organização", minutes=3,
         story="Um livro caiu da estante e suas páginas se misturaram. Reconstrua o ciclo da água, começando quando o Sol aquece rios e lagos.",
         question="Organize as etapas do ciclo da água.",
         items=["Precipitação", "Acumulação", "Evaporação", "Condensação"],
         hint="A água vira vapor, forma nuvens, cai como chuva e se reúne em rios e lagos.",
         answer=["evaporacao", "condensacao", "precipitacao", "acumulacao"], fragment="A", x=82, y=45, color="green", icon="book"),
    dict(id=6, title="O coração do vale", place="Grande Árvore", kind="cipher", skill="Decifração", minutes=4,
         story="Cinco palavras trouxeram você até aqui. No baú, a última palavra foi escondida por um código: cada letra avançou três posições no alfabeto. Volte três posições para descobrir o segredo.",
         question="Decifre a palavra: IORUHVFHU",
         cipher="IORUHVFHU", hint="I vira F, O vira L e R vira O. Continue voltando três posições.",
         answer="florescer", fragment="FLORESCER", x=84, y=15, color="rose", icon="tree"),
]


def normalize(value):
    if isinstance(value, str):
        return "".join(c for c in unicodedata.normalize("NFKD", value.strip().lower()) if not unicodedata.combining(c))
    if isinstance(value, list):
        return [normalize(item) for item in value]
    return value


def correct_answer(activity, answer):
    if activity["kind"] == "memory":
        if not isinstance(answer, list) or any(not isinstance(pair, list) or len(pair) != 2 or any(not isinstance(card, str) for card in pair) for pair in answer):
            return False
        return sorted(sorted(pair) for pair in answer) == sorted(sorted(pair) for pair in activity["answer"])
    return normalize(answer) == normalize(activity["answer"])


def public_activity(activity, completed):
    payload = {key: value for key, value in activity.items() if key not in ("answer", "fragment")}
    payload["status"] = "completed" if activity["id"] in completed else "available" if activity["id"] == 1 or activity["id"] - 1 in completed else "locked"
    if activity["id"] in completed:
        payload["fragment"] = activity["fragment"]
    return payload
