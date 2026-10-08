import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Flower2,
  HelpCircle,
  Leaf,
  RotateCcw,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import Modal from "./Modal";
import { destinationIcons } from "../data/activities";
import api, { errorMessage } from "../services/api";

const symbols = { leaf: Leaf, sun: Sun, flower: Flower2, berry: Sparkles };
function shuffled(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function MemoryBoard({ cards, onAnswer }) {
  const [deck] = useState(() => shuffled(cards));
  const [open, setOpen] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [turns, setTurns] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const matched = pairs.flat();
  function flip(card) {
    if (open.length === 2 || matched.includes(card.id) || open.includes(card.id)) return;
    if (!open.length) {
      setOpen([card.id]);
      return;
    }
    const ids = [open[0], card.id];
    setOpen(ids);
    setTurns((value) => value + 1);
    const first = deck.find((item) => item.id === open[0]);
    if (first.symbol === card.symbol) {
      const next = [...pairs, ids];
      setPairs(next);
      onAnswer(next.length === 4 ? next : null);
      timer.current = setTimeout(() => setOpen([]), 350);
    } else {
      timer.current = setTimeout(() => setOpen([]), 900);
    }
  }
  return (
    <div className="memory-game">
      <div className="memory-meta">
        <span>{pairs.length}/4 pares</span>
        <span>{turns} jogadas</span>
      </div>
      <div className="memory-grid">
        {deck.map((card, index) => {
          const Icon = symbols[card.symbol];
          const visible = matched.includes(card.id) || open.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${visible ? "is-flipped" : ""} ${matched.includes(card.id) ? "is-matched" : ""}`}
              disabled={matched.includes(card.id) || open.length === 2}
              onClick={() => flip(card)}
              aria-label={visible ? `Carta ${index + 1}: ${card.name}` : `Virar carta ${index + 1}`}
            >
              {visible ? <Icon size={28} /> : <span>✦</span>}
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
  const [reward, setReward] = useState(null);
  const valid =
    activity.kind === "quiz"
      ? answer.filter(Boolean).length === activity.questions.length
      : activity.kind === "memory"
        ? Array.isArray(answer) && answer.length === 4
        : activity.kind === "order"
          ? true
          : Boolean(answer.trim());
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
            DESTINO 0{activity.id} · {activity.skill}
          </span>
          <h2>{activity.title}</h2>
        </div>
      </div>
      {feedback === "correct" ? (
        <div className="reward-view">
          <div className="reward-emblem">
            <Sparkles size={35} />
          </div>
          <span className="eyebrow">FRAGMENTO ENCONTRADO</span>
          <h3>{reward}</h3>
          <p>Mais uma página da história voltou a fazer sentido.</p>
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
          {activity.status === "completed" && (
            <div className="notice notice--info">
              <Check size={16} />
              Você já encontrou este fragmento. Pode praticar novamente.
            </div>
          )}
          {activity.kind === "cipher" && (
            <div className="fragment-strip">
              {fragments.map((word, index) => (
                <span key={index}>{word}</span>
              ))}
              <span className="fragment-missing">?</span>
            </div>
          )}
          <form onSubmit={submit}>
            <h3 className="challenge-question">{activity.question}</h3>
            {["riddle", "cipher"].includes(activity.kind) && (
              <label className="form-label">
                Sua descoberta
                <span className="input-wrap">
                  <input
                    required
                    value={answer}
                    onChange={(event) => choose(event.target.value)}
                    placeholder="Escreva a palavra…"
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
            {activity.kind === "memory" && <MemoryBoard cards={activity.cards} onAnswer={choose} />}
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
                Ainda não é essa! Observe a pista e tente novamente.
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
                {hint ? "Esconder dica" : "Preciso de uma dica"}
              </button>
              <button className="button button--primary" disabled={!valid || busy}>
                {busy ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Revelar fragmento <ArrowRight size={16} />
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
