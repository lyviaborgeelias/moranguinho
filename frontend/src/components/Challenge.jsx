import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  X,
} from "lucide-react";
import Modal from "./Modal";
import { destinationIcons } from "../data/activities";
import api, { errorMessage } from "../services/api";
import { DialGame, LightsGame, MazeGame } from "./PuzzleGames";

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
    leaf: "🍓",
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

export default function Challenge({ activity, fragments, onClose, onUpdate }) {
  const Icon = destinationIcons[activity.icon];
  const [answer, setAnswer] = useState(
    activity.kind === "quiz" ? [] : activity.kind === "order" ? [...activity.items] : "",
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState(false);
  const [inspectedClues, setInspectedClues] = useState([]);
  const [reward, setReward] = useState(null);
  const valid = ["maze", "lights"].includes(activity.kind)
    ? Array.isArray(answer) && answer.length > 0
    : activity.kind === "quiz"
      ? answer.filter(Boolean).length === activity.questions.length
      : activity.kind === "memory"
        ? Array.isArray(answer) && answer.length === activity.cards.length / 2
        : activity.kind === "order"
          ? true
          : Boolean(answer.trim()) &&
            (!activity.clues || inspectedClues.length === activity.clues.length);
  function choose(value) {
    setAnswer(value);
    setFeedback("");
    setError("");
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
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const { data } = await api.post(`/activities/${activity.id}/answer/`, { answer });
      onUpdate(data.journey);
      if (data.correct) {
        setReward(data.fragment);
        setFeedback("correct");
      } else setFeedback("wrong");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={activity.title} onClose={onClose} wide>
      <div className={`challenge-heading color-${activity.color}`}>
        <span className="destination-symbol">
          <Icon size={23} />
        </span>
        <div>
          <span className="eyebrow">
            {activity.case_file || `DOSSIÊ 0${activity.id}`} · {activity.skill}
          </span>
          <h2>{activity.title}</h2>
        </div>
      </div>
      {feedback === "correct" ? (
        <div className="reward-view">
          <div className="reward-emblem">
            <Sparkles size={35} />
          </div>
          <span className="eyebrow">PISTA CONFIRMADA</span>
          <h3>{reward}</h3>
          <p>
            {activity.revelation ||
              "Obstáculo vencido! Uma nova área do jardim está liberada para investigar."}
          </p>
          <div className="reward-points">
            <Check size={15} />
            {activity.status === "completed" ? "Destino concluído" : "+100 pontos de exploração"}
          </div>
          <button className="button button--dark button--full" onClick={onClose}>
            Voltar ao mapa <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
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
            {activity.kind === "quiz" && (
              <div className="quiz-list">
                {activity.questions.map((question, index) => (
                  <fieldset key={question.prompt}>
                    <legend>
                      <span>0{index + 1}</span>
                      {question.prompt}
                    </legend>
                    <div className="quiz-options">
                      {question.options.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`choice ${answer[index] === option ? "is-selected" : ""}`}
                          aria-pressed={answer[index] === option}
                          onClick={() => {
                            const next = [...answer];
                            next[index] = option;
                            choose(next);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
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
                Essa pista não fecha o caso. Revise as evidências e tente novamente.
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
              <button className="button button--primary" disabled={!valid || busy}>
                {busy ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Confirmar pista <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
