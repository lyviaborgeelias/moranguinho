"""Missões das amigas. As respostas e palavras ainda não conquistadas ficam no servidor."""
import unicodedata


def question(prompt, *options):
    return {"prompt": prompt, "options": list(options)}


# Referências para os enredos e os nomes da dublagem:
# https://www.primevideo.com/-/pt/detail/0S5W7IC5LBM32M4G3XGXHTSPYM
# https://www.paramountplus.com/shows/strawberry-shortcakes-berry-bitty-adventures/episodes/1/
# https://www.paramountplus.com/shows/strawberry-shortcakes-berry-bitty-adventures/episodes/2/
ACTIVITIES = [
    dict(id=1, title="A cesta de Laranjinha", place="Jardim da casa", kind="quiz", skill="Memória da série", minutes=3,
         icon="sprout", color="gold", friend="Laranjinha",
         story="Dentro da cesta, Laranjinha encontrou um bilhete que lembra dois sustos que ela levou em Tutti-Frutti.",
         question="Lembre o que aconteceu no riacho e durante o apagão.",
         questions=[
             question("O que Laranjinha achou que tocou seu pé no riacho e o que o animal que ela adotou era de verdade?",
                      "Uma enguia e um filhote de peixe",
                      "Uma enguia e um girino",
                      "Uma sanguessuga e um girino",
                      "Uma sanguessuga e um filhote de peixe"),
             question("Em ‘Enfrentando seus Medos’, onde as amigas estavam quando a luz acabou e qual criatura assustava Laranjinha?",
                      "No café, com medo do Galumphalot",
                      "No salão, com medo de uma enguia",
                      "No café, com medo de uma enguia",
                      "No salão, com medo do Galumphalot"),
         ],
         hint="No riacho, só depois de adotar o bichinho ela percebeu que ele mudava de forma. O outro susto começou com uma história lida para os Berrykins.",
         answer=["Uma enguia e um girino", "No salão, com medo do Galumphalot"], fragment="AMIZADE",
         revelation="Muito bem! No fundo da cesta havia uma palavra: AMIZADE. Laranjinha viu Liminha passando em direção à horta. Vá conversar com ela!"),
    dict(id=2, title="O cuidado com a horta", place="Horta de Liminha", kind="quiz", skill="Detalhes dos episódios", minutes=3,
         icon="flower", color="green", friend="Liminha",
         story="Entre os canteiros, Liminha achou uma pista sobre as aventuras de Gotinha de Limão no jardim e no salão.",
         question="Relembre os preparativos de Gotinha de Limão para dois eventos da cidade.",
         questions=[
             question("Em ‘O Sumiço das Violetas’, que cuidado Gotinha de Limão repetia à noite com as flores do concurso?",
                      "Cantava para as violetas",
                      "Girava os vasos de frente para a lua",
                      "Cobria as flores com redomas de vidro",
                      "Regava as violetas antes de dormir"),
             question("Em ‘O Que Mais Importa’, para a inauguração de qual lugar as amigas se arrumavam quando os secadores saíram do controle?",
                      "Do novo mercado da cidade",
                      "Do estúdio de dança",
                      "Do clube de boliche",
                      "Da boutique de roupas"),
         ],
         hint="O ritual da noite era diferente da rega do dia. Já o novo ponto de encontro da cidade tinha pistas para jogar.",
         answer=["Cantava para as violetas", "Do clube de boliche"], fragment="MORANGO",
         revelation="Liminha entregou a palavra MORANGO e contou que Uvinha está esperando no pomar."),
    dict(id=3, title="As descobertas do pomar", place="Pomar das amigas", kind="quiz", skill="Mistérios da série", minutes=3,
         icon="tree", color="purple", friend="Uvinha",
         story="Uvinha encontrou um bilhete preso a uma árvore. Ele menciona uma detetive dos livros e um perfume que saiu do controle.",
         question="Relembre o que aconteceu nos dois mistérios.",
         questions=[
             question("Em ‘O Sumiço de Amora Linda’, como Uvinha levou a admiração por Patti Persimmon para fora dos livros?",
                      "Montou um clube para o público resolver enigmas",
                      "Escreveu um novo caso inspirado nas amigas",
                      "Encenou um dos mistérios com os Berrykins",
                      "Vestiu-se como a detetive e saiu à procura de casos"),
             question("Em ‘O Perfume Especial’, que mistura caiu no frasco e fez as plantas crescerem depressa?",
                      "Suco de frutas e orvalho do pomar",
                      "Brilho dos Berrykins e solução de Berrykin Bloom",
                      "Pólen das flores e farinha do café",
                      "Sementes de margarida e água do riacho"),
         ],
         hint="Patti inspirou Uvinha a investigar por conta própria. No pomar, foi o vento que juntou o trabalho de quem colhia com o de quem cuidava das flores.",
         answer=["Vestiu-se como a detetive e saiu à procura de casos", "Brilho dos Berrykins e solução de Berrykin Bloom"], fragment="ALEGRIA",
         revelation="Mistérios desvendados! A palavra é ALEGRIA. Siga pelo caminho do bosque para encontrar Amora."),
    dict(id=4, title="Os sons do bosque", place="Bosque de Amora", kind="quiz", skill="Causa e consequência", minutes=3,
         icon="water", color="blue", friend="Amora",
         story="No bosque, Amora guardou um bilhete sobre duas confusões de Tutti-Frutti: uma no jardim e outra na troca de presentes.",
         question="Descubra o que deu errado em cada episódio.",
         questions=[
             question("Quando as sementes de Amora Linda brotaram em menos de um dia, o que ela esperava plantar e o que veio por engano no pacote?",
                      "Violetas e sementes de margarida",
                      "Margaridas e sementes de girassol",
                      "Margaridas e milho de pipoca",
                      "Violetas e milho de pipoca"),
             question("Na troca de presentes da Primeira Geada, por que o presente de Amora Linda acabou passando de mão em mão?",
                      "Ela escolheu algo que ela mesma queria ganhar",
                      "Ela trocou a etiqueta com a de outro presente",
                      "Ela confundiu o horário da entrega",
                      "Ela separou os embrulhos pela ordem errada"),
         ],
         hint="O problema da plantação começou com a embalagem das sementes. Na troca da Primeira Geada, pense em quem teve seus gostos levados em conta.",
         answer=["Margaridas e milho de pipoca", "Ela escolheu algo que ela mesma queria ganhar"], fragment="CARINHO",
         revelation="Amora entregou a palavra CARINHO. Atravesse a ponte do riacho: Cerejinha está do outro lado."),
    dict(id=5, title="O bilhete da ponte", place="Jardim da ponte", kind="quiz", skill="Música e bastidores", minutes=3,
         icon="clock", color="rose", friend="Cerejinha",
         story="Cerejinha achou um bilhete que lembra sua chegada a Tutti-Frutti e os primeiros ensaios com suas alunas.",
         question="Lembre como Cerejinha chegou à cidade e o que aconteceu nos preparativos para o recital.",
         questions=[
             question("Em ‘Megaestrela Pop’, para qual evento as amigas convidaram Cerejinha como surpresa para Moranguinho?",
                      "O desfile do festival da cidade",
                      "A inauguração do mercado",
                      "A apresentação do concurso de talentos",
                      "O baile da Primeira Geada"),
             question("Quando Cerejinha organizou um recital para suas alunas, por que Ameixinha tentou adiá-lo?",
                      "Queria trocar a música depois do último ensaio",
                      "Precisava buscar um instrumento emprestado",
                      "Queria treinar um novo dueto com Cerejinha",
                      "Sentiu medo de se apresentar no palco"),
         ],
         hint="O primeiro convite celebrava a abertura de um espaço novo. Para entender Ameixinha, pense na diferença entre ensaiar e tocar para uma plateia.",
         answer=["A inauguração do mercado", "Sentiu medo de se apresentar no palco"], fragment="CUIDADO",
         revelation="Você encontrou a palavra CUIDADO! Cerejinha sorriu ao falar da festa. Framboesa está na clareira e tem a última pista."),
    dict(id=6, title="O segredo das amigas", place="Clareira da amizade", kind="quiz", skill="Moda e amizade", minutes=3,
         icon="book", color="rose", friend="Framboesa",
         story="O último bilhete lembra duas vezes em que os trabalhos de Framboesinha puseram à prova sua relação com as amigas.",
         question="Relembre a confusão do festival e a decisão sobre sua carreira.",
         questions=[
             question("Em ‘A União Faz a Força’, qual criação Framboesinha suspeitou que as amigas tinham copiado?",
                      "O desenho que fez em sua lanterna",
                      "O bordado que fez no vestido da festa",
                      "O enfeite que fez para a entrada do baile",
                      "A estampa que fez para a decoração da praça"),
             question("Que proposta Framboesinha recebeu de uma pessoa que procurava novos talentos, antes de decidir ficar em Tutti-Frutti?",
                      "Criar figurinos para a turnê de Cerejinha",
                      "Assumir a decoração dos eventos do mercado",
                      "Criar uma coleção de roupas com glitter na cidade grande",
                      "Abrir uma escola de moda na cidade grande"),
         ],
         hint="Pense em algo que cada amiga preparou para levar ao festival. Na segunda história, a proposta envolvia sair da cidade e continuar desenhando roupas.",
         answer=["O desenho que fez em sua lanterna", "Criar uma coleção de roupas com glitter na cidade grande"], fragment="AMIGOS",
         revelation="Framboesa juntou as seis palavras e trouxe o livro de volta. Há uma última mensagem esperando por você na clareira."),
]


def normalize(value):
    if isinstance(value, str):
        return "".join(c for c in unicodedata.normalize("NFKD", value.strip().lower()) if not unicodedata.combining(c))
    if isinstance(value, list):
        return [normalize(item) for item in value]
    return value


def incorrect_questions(activity, answer):
    if not isinstance(answer, list) or len(answer) != len(activity["questions"]) or any(not isinstance(value, str) for value in answer):
        return None
    return [
        index for index, (value, expected) in enumerate(zip(normalize(answer), normalize(activity["answer"])))
        if value != expected
    ]


def correct_answer(activity, answer):
    return incorrect_questions(activity, answer) == []


TREASURES = ["Cesta de frutas", "Flor encantada", "Lupa de investigação", "Pacote de sementes", "Nota musical", "Lanterna decorada"]
# A mensagem final possui seis lacunas, cada uma com uma definição única.
FINAL_ORDER = [5, 4, 1, 6, 2, 3]


def public_activity(activity, completed, record=None):
    payload = {key: value for key, value in activity.items() if key not in ("answer", "fragment", "revelation")}
    payload["status"] = "completed" if activity["id"] in completed else "available" if activity["id"] == 1 or activity["id"] - 1 in completed else "locked"
    if payload["status"] == "available" and record and (record.started_at or record.attempts):
        payload["status"] = "in_progress"
    payload["clue_status"] = {"locked": "locked", "available": "incomplete", "in_progress": "incomplete", "completed": "complete"}[payload["status"]]
    payload["quiz_status"] = "correct" if payload["status"] == "completed" else "incorrect" if record and record.attempts else "unanswered"
    payload["answers"] = record.answers if record else []
    if payload["status"] == "in_progress" or activity["id"] in completed:
        payload["treasure"] = TREASURES[activity["id"] - 1]
    if payload["clue_status"] == "incomplete":
        payload["clue_preview"] = f"Palavra secreta com {len(activity['fragment'])} letras."
    if activity["id"] in completed:
        payload["fragment"] = activity["fragment"]
        payload["revelation"] = activity["revelation"]
    return payload
