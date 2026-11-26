import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Star,
  ShieldAlert,
  X,
} from "lucide-react";
import Modal from "./Modal";
import { destinationIcons } from "../data/activities";
import api, { errorMessage } from "../services/api";
import { readLocal, writeLocal } from "../services/progress";
import { DialGame, LightsGame, MazeGame } from "./PuzzleGames";
import { FriendPortrait } from "./Exploration";
import { StrawberryMark } from "./Logo";
import { FRIENDS } from "../game/world";

function shuffled(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function MemoryBoard({ cards, maxTurns = 14, onAnswer }) {
  const pairCount = cards.length / 2;
  const fruitSymbols = {
    leaf: <StrawberryMark size={30} />,
    sun: "🍊",
    flower: "🍇",
    berry: "🫐",
    cherry: "🍒",
    lemon: "🍋",
  };
  const [deck, setDeck] = useState(() => shuffled(cards));
  const [open, setOpen] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [turns, setTurns] = useState(0);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const matched = pairs.flat();
  function flip(card) {
    if (
      failed ||
      turns >= maxTurns ||
      open.length === 2 ||
      matched.includes(card.id) ||
      open.includes(card.id)
    )
      return;
    if (!open.length) {
      setOpen([card.id]);
      return;
    }
    const ids = [open[0], card.id];
    setOpen(ids);
    const nextTurns = turns + 1;
    setTurns(nextTurns);
    const first = deck.find((item) => item.id === open[0]);
    if (first.symbol === card.symbol) {
      const next = [...pairs, ids];
      setPairs(next);
      onAnswer(next.length === pairCount ? next : null);
      timer.current = setTimeout(() => {
        setOpen([]);
        if (nextTurns >= maxTurns && next.length < pairCount) setFailed(true);
      }, 350);
    } else {
      timer.current = setTimeout(() => {
        setOpen([]);
        if (nextTurns >= maxTurns) {
          setFailed(true);
          onAnswer(null);
        }
      }, 900);
    }
  }
  function reset() {
    clearTimeout(timer.current);
    setDeck(shuffled(cards));
    setOpen([]);
    setPairs([]);
    setTurns(0);
    setFailed(false);
    onAnswer(null);
  }
  return (
    <div className="memory-game">
      <div className="memory-meta">
        <span>
          {pairs.length}/{pairCount} pares
        </span>
        <span>
          Jogadas {turns}/{maxTurns}
        </span>
      </div>
      {failed && (
        <div className="memory-failed" role="status">
          <span>As fotos desapareceram antes de você encontrar todos os pares.</span>
          <button type="button" className="button button--small button--outline" onClick={reset}>
            Recomeçar memória
          </button>
        </div>
      )}
      <div className="memory-grid">
        {deck.map((card, index) => {
          const visible = matched.includes(card.id) || open.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${visible ? "is-flipped" : ""} ${matched.includes(card.id) ? "is-matched" : ""}`}
              disabled={
                failed || matched.includes(card.id) || open.length === 2 || turns >= maxTurns
              }
              onClick={() => flip(card)}
              aria-label={visible ? `Carta ${index + 1}: ${card.name}` : `Virar carta ${index + 1}`}
            >
              {visible ? (
                <span className="memory-fruit">{fruitSymbols[card.symbol]}</span>
              ) : (
                <span>?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Challenge({
  activity,
  fragments,
  onClose,
  onUpdate,
  onNext,
  onFinale,
  finalSolved,
  online = true,
}) {
  const Icon = destinationIcons[activity.icon];
  const friend = FRIENDS.find((item) => item.id === activity.id);
  const [answer, setAnswer] = useState(() =>
    activity.kind === "quiz"
      ? activity.status === "completed"
        ? []
        : readLocal(`draft-${activity.id}`, activity.answers || [])
      : activity.kind === "order"
        ? [...activity.items]
        : "",
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState(false);
  const [inspectedClues, setInspectedClues] = useState([]);
  const [reward, setReward] = useState(null);
  const [earned, setEarned] = useState(false);
  const [step, setStep] = useState(0);
  const [review, setReview] = useState([]);
  const quiz = activity.kind === "quiz";
  const question = quiz ? activity.questions[step] : null;
  const hasNextQuestion = quiz && step < activity.questions.length - 1;
  const unanswered = quiz ? activity.questions.findIndex((_, index) => !answer[index]) : -1;
  const valid = ["maze", "lights"].includes(activity.kind)
    ? Array.isArray(answer) && answer.length > 0
    : quiz
      ? unanswered === -1
      : activity.kind === "memory"
        ? Array.isArray(answer) && answer.length === activity.cards.length / 2
        : activity.kind === "order"
          ? true
          : Boolean(answer.trim()) &&
            (!activity.clues || inspectedClues.length === activity.clues.length);
  function choose(value) {
    setAnswer(value);
    if (quiz) writeLocal(`draft-${activity.id}`, value);
    setFeedback("");
    setError("");
  }
  function selectOption(option) {
    const next = [...answer];
    next[step] = option;
    setReview((current) => current.filter((index) => index !== step));
    choose(next);
  }
  function move(index, direction) {
    const next = [...answer];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    choose(next);
  }
  function inspectClue(index) {
    setInspectedClues((current) => (current.includes(index) ? current : [...current, index]));
  }
  async function submit(event) {
    event.preventDefault();
    if (!valid || busy || !online) return;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const { data } = await api.post(`/activities/${activity.id}/answer/`, { answer });
      setEarned(data.correct && !data.already_completed);
      onUpdate(data.journey);
      if (data.correct) {
        writeLocal(`draft-${activity.id}`, null);
        setReward(data.fragment);
        setFeedback("correct");
      } else {
        setFeedback("wrong");
        if (quiz && data.incorrect_questions?.length) {
          setReview(data.incorrect_questions);
          setStep(data.incorrect_questions[0]);
        }
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={activity.title} onClose={onClose} wide className="modal--challenge">
      <div className="challenge-level">
        FASE {String(activity.id).padStart(2, "0")} <span>/ 06</span>
      </div>
      <div className={`challenge-heading color-${activity.color}`}>
        <span className="destination-symbol">
          {activity.kind === "quiz" ? <FriendPortrait friend={friend} /> : <Icon size={23} />}
        </span>
        <div>
          <span className="eyebrow">
            {activity.friend || activity.case_file || `MISSÃO 0${activity.id}`} · {activity.skill}
          </span>
          <h2>{activity.title}</h2>
        </div>
      </div>
      {activity.treasure && feedback !== "correct" && (
        <p className="treasure-reward">
          Tesouro encontrado: <strong>{activity.treasure}</strong>
        </p>
      )}
      {!online && (
        <p role="status">
          Offline: respostas ficam salvas neste dispositivo. Reconecte-se para confirmar a pista.
        </p>
      )}
      {feedback === "correct" ? (
        <div className="reward-view" role="status">
          <div className="reward-stars" aria-hidden="true">
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
          </div>
          <div className="reward-emblem">
            <Sparkles size={35} />
          </div>
          <span className="eyebrow">PISTA CONFIRMADA</span>
          <span className="reward-title">Você mandou bem!</span>
          <h3>{reward}</h3>
          <p className="treasure-reward">
            Tesouro encontrado: <strong>{activity.treasure}</strong>
          </p>
          <p>
            {activity.revelation ||
              "Obstáculo vencido! Uma nova área do jardim está liberada para investigar."}
          </p>
          <div className="reward-points">
            <Check size={15} />
            {earned ? "+100 XP · Nova pista na coleção!" : "Destino concluído"}
          </div>
          {earned && (
            <div
              className="reward-collection"
              aria-label={`${fragments.length} de 6 palavras coletadas`}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={i < fragments.length ? "is-filled" : ""}>
                  {i < fragments.length ? <Check size={13} /> : i + 1}
                </span>
              ))}
            </div>
          )}
          <div className="reward-actions">
            {earned && (onNext || onFinale) && (
              <button className="button button--primary" onClick={onFinale || onNext}>
                {onFinale
                  ? finalSolved
                    ? "Participar da festa"
                    : "Resolver enigma final"
                  : "Seguir para o próximo encontro"}{" "}
                <ArrowRight size={17} />
              </button>
            )}
            <button className="button button--outline" onClick={onClose}>
              Voltar ao jardim
            </button>
          </div>
        </div>
      ) : (
        <>
          <details className="challenge-brief">
            <summary>
              <BookOpen size={16} /> História e instruções da missão <span>+</span>
            </summary>
            <p className="challenge-story">{activity.story}</p>
            {activity.obstacle && (
              <div className="obstacle-card">
                <ShieldAlert size={18} />
                <div>
                  <span>OBSTÁCULO DO CASO</span>
                  <p>{activity.obstacle}</p>
                </div>
              </div>
            )}
          </details>
          {activity.clues && (
            <div className="clue-panel">
              <div className="clue-panel-heading">
                <span className="eyebrow">EVIDÊNCIAS DA CENA</span>
                <strong>
                  {inspectedClues.length}/{activity.clues.length} examinadas
                </strong>
              </div>
              <div className="clue-grid">
                {activity.clues.map((clue, index) => {
                  const inspected = inspectedClues.includes(index);
                  return (
                    <button
                      type="button"
                      key={clue}
                      className={`clue-card ${inspected ? "is-inspected" : ""}`}
                      onClick={() => inspectClue(index)}
                    >
                      <span>{inspected ? <Check size={15} /> : `0${index + 1}`}</span>
                      <strong>{inspected ? clue : "Examinar evidência"}</strong>
                    </button>
                  );
                })}
              </div>
              {inspectedClues.length < activity.clues.length && (
                <small className="clue-panel-tip">
                  Examine todas as evidências para liberar a resposta.
                </small>
              )}
            </div>
          )}
          {activity.status === "completed" && (
            <div className="notice notice--info">
              <Check size={16} />
              Você já confirmou esta pista. Pode investigar novamente.
            </div>
          )}
          {activity.kind === "cipher" && (
            <>
              <span className="cipher-section-label">Mensagens já encontradas</span>
              <div className="fragment-strip">
                {fragments.map((word, index) => (
                  <span key={index}>{word}</span>
                ))}
                <span className="fragment-missing">?</span>
              </div>
            </>
          )}
          {activity.kind === "cipher" && (
            <>
              <p className="cipher-guide">
                Leia cada letra três posições para trás no alfabeto. Exemplo: D vira A.
              </p>
              <div className="cipher-code-card">
                <span>PALAVRA CODIFICADA</span>
                <strong>{activity.cipher}</strong>
              </div>
            </>
          )}
          <form onSubmit={submit}>
            <h3 className="challenge-question">{activity.question}</h3>
            {activity.kind === "maze" && <MazeGame activity={activity} onAnswer={choose} />}
            {activity.kind === "lights" && <LightsGame activity={activity} onAnswer={choose} />}
            {["lock", "cipher"].includes(activity.kind) && (
              <DialGame activity={activity} onAnswer={choose} />
            )}
            {activity.kind === "riddle" && (
              <label className="form-label">
                Sua resposta
                <span className="input-wrap">
                  <input
                    required
                    value={answer}
                    onChange={(event) => choose(event.target.value)}
                    placeholder={
                      activity.kind === "cipher"
                        ? "Digite a palavra completa…"
                        : "Escreva a palavra…"
                    }
                    autoComplete="off"
                    maxLength={100}
                  />
                </span>
              </label>
            )}
            {activity.kind === "sequence" && (
              <>
                <div className="sequence-display">
                  {activity.sequence.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                  <span className="sequence-unknown">?</span>
                </div>
                <div className="choice-grid">
                  {activity.options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`choice ${answer === option ? "is-selected" : ""}`}
                      aria-pressed={answer === option}
                      onClick={() => choose(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
            {activity.kind === "memory" && (
              <MemoryBoard cards={activity.cards} maxTurns={activity.max_turns} onAnswer={choose} />
            )}
            {question && (
              <div className="quiz-list quiz-round">
                <div className="quiz-steps" role="group" aria-label="Etapas da missão">
                  {activity.questions.map((item, index) => (
                    <button
                      key={item.prompt}
                      type="button"
                      aria-pressed={step === index}
                      className={review.includes(index) ? "needs-review" : ""}
                      disabled={busy}
                      onClick={() => setStep(index)}
                    >
                      {review.includes(index) ? (
                        <RotateCcw size={14} />
                      ) : answer[index] ? (
                        <Check size={14} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                      Pergunta {index + 1}
                    </button>
                  ))}
                </div>
                <fieldset key={question.prompt} disabled={busy}>
                  <legend>{question.prompt}</legend>
                  <div className="quiz-options">
                    {question.options.map((option, optionIndex) => (
                      <button
                        type="button"
                        key={option}
                        className={`choice ${answer[step] === option ? "is-selected" : ""}`}
                        aria-pressed={answer[step] === option}
                        onClick={() => selectOption(option)}
                      >
                        <span className="answer-letter" aria-hidden="true">
                          {answer[step] === option ? (
                            <Check size={15} />
                          ) : (
                            String.fromCharCode(65 + optionIndex)
                          )}
                        </span>
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}
            {activity.kind === "order" && (
              <>
                <ul className="route-clues">
                  {activity.question_clues?.map((clue) => (
                    <li key={clue}>{clue}</li>
                  ))}
                </ul>
                <ol className="order-list">
                  {answer.map((item, index) => (
                    <li key={item}>
                      <span className="order-index">{index + 1}</span>
                      <strong>{item}</strong>
                      <button
                        type="button"
                        className="icon-button"
                        disabled={index === 0}
                        aria-label={`Mover ${item} para cima`}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        disabled={index === answer.length - 1}
                        aria-label={`Mover ${item} para baixo`}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown size={15} />
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {hint && (
              <p className="hint-box">
                <Sparkles size={15} />
                {activity.hint}
              </p>
            )}
            {feedback === "wrong" && (
              <div className="notice notice--error" role="status">
                <RotateCcw size={17} />
                {review.length === 1
                  ? `Revise a pergunta ${review[0] + 1}. Sua outra resposta foi mantida.`
                  : review.length
                    ? "Revise as perguntas marcadas. Você pode consultar a dica e tentar novamente."
                    : "Ainda não foi dessa vez. Abra a pista e tente novamente."}
              </div>
            )}
            {error && (
              <div className="notice notice--error" role="alert">
                <X size={17} />
                {error}
              </div>
            )}
            <div className="challenge-footer">
              <button
                type="button"
                className="hint-button"
                onClick={() => setHint(!hint)}
                aria-expanded={hint}
              >
                <HelpCircle size={16} />
                {hint ? "Fechar pista" : "Abrir pista"}
              </button>
              {hasNextQuestion ? (
                <button
                  key="next-question"
                  type="button"
                  className="button button--primary"
                  disabled={!answer[step] || busy}
                  onClick={() => setStep(step + 1)}
                >
                  Próxima pergunta <ArrowRight size={16} />
                </button>
              ) : quiz && unanswered !== -1 && Boolean(answer[step]) ? (
                <button
                  key="unanswered-question"
                  type="button"
                  className="button button--primary"
                  onClick={() => setStep(unanswered)}
                >
                  Voltar à pergunta {unanswered + 1} <ArrowLeft size={16} />
                </button>
              ) : (
                <button
                  key="confirm-answers"
                  type="submit"
                  className="button button--primary"
                  disabled={!valid || busy || !online}
                >
                  {busy ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      Confirmar pista <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
