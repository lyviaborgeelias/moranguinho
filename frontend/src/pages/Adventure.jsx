import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Download,
  HelpCircle,
  LockKeyhole,
  Footprints,
  RotateCcw,
  Star,
  X,
  Home as HomeIcon,
  Settings2,
  Trophy,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Logo, { StrawberryMark } from "../components/Logo";
import Modal from "../components/Modal";
import ClueOrder from "../components/ClueOrder";
import FinalRiddle from "../components/FinalRiddle";
import GeoLocation from "../components/GeoLocation";
import { readLocal, writeLocal, clearLocalJourney, orderedClues } from "../services/progress";
import Challenge from "../components/Challenge";
import { Certificate, Finale } from "../components/Finale";
import { useAuth } from "../context/AuthContext";
import { achievements, destinationIcons } from "../data/activities";
import api, { errorMessage } from "../services/api";
import { FullscreenButton, GameGuide } from "../components/GameChrome";
import Exploration, { FriendPortrait } from "../components/Exploration";
import { FRIENDS } from "../game/world";
import "../styles/Adventure.css";
import "../styles/Challenge.css";
import "../styles/Exploration.css";
import "../styles/QuestPolish.css";
import "../styles/Completion.css";

const views = [
  { id: "world", label: "Explorar", icon: Footprints },
  { id: "journal", label: "Meu diário", icon: BookOpen },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "profile", label: "Meu perfil", icon: Settings2 },
];

function Profile({ user, updateUser }) {
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.patch("/me/", { name });
      updateUser(data.user);
      setNotice({
        type: "success",
        text: "Seu nome foi atualizado.",
      });
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="profile-layout">
      <article className="paper-card">
        <span className="eyebrow">IDENTIDADE DE EXPLORADOR</span>
        <h2>Nome no certificado</h2>
        <form onSubmit={(event) => save(event)}>
          <label className="form-label">
            Seu nome
            <span className="input-wrap">
              <input
                required
                maxLength={150}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </span>
          </label>
          <button className="button button--dark" disabled={busy}>
            Salvar nome <Check size={16} />
          </button>
        </form>
      </article>
      <article className="profile-session paper-card">
        <Compass size={21} />
        <div>
          <strong>Jornada salva neste dispositivo</strong>
          <p>Seu progresso fica guardado automaticamente enquanto você joga por aqui.</p>
        </div>
      </article>
      {notice && (
        <div className={`notice notice--${notice.type} profile-notice`} role="status">
          {notice.text}
        </div>
      )}
    </div>
  );
}

export default function Adventure() {
  const { user, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const view = views.some((item) => item.id === params.get("aba")) ? params.get("aba") : "world";
  const [journey, setJourneyState] = useState(() => readLocal("journey"));
  const [order, setOrderState] = useState(() => readLocal("order", []));
  const [online, setOnline] = useState(() => navigator.onLine);
  const setJourney = useCallback((data) => {
    writeLocal("journey", data);
    setJourneyState(data);
  }, []);
  function setOrder(value) {
    writeLocal("order", value);
    setOrderState(value);
  }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [missionId, setMissionId] = useState(null);
  const [followRequest, setFollowRequest] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [info, setInfo] = useState(false);
  const [reset, setReset] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [ending, setEnding] = useState(null);
  const newGameHandled = useRef(false);
  const selected = journey?.activities.find(
    (item) => item.id === missionId && item.status !== "locked",
  );
  const allClues = journey?.completed.length === 6;
  const complete = Boolean(journey?.finished_at);
  const next = journey?.activities.find((activity) =>
    ["available", "in_progress"].includes(activity.status),
  );
  const closeActivity = useCallback(() => setMissionId(null), []);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get("/journey/");
      setJourney(data);
    } catch (requestError) {
      setError(
        readLocal("journey")
          ? "Modo offline: progresso local disponível. Conecte-se para validar respostas."
          : errorMessage(requestError),
      );
    } finally {
      setBusy(false);
    }
  }, [setJourney]);
  useEffect(() => {
    load();
    const connected = () => {
      setOnline(true);
      load();
    };
    const disconnected = () => setOnline(false);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
    };
  }, [load]);

  useEffect(() => {
    if (!busy && journey && params.get("novo") === "1" && !newGameHandled.current) {
      newGameHandled.current = true;
      if (
        journey.completed.length ||
        journey.activities.some((item) => item.status === "in_progress")
      )
        setReset(true);
      setParams({}, { replace: true });
    }
  }, [busy, journey, params, setParams]);

  function tab(id) {
    setParams(id === "world" ? {} : { aba: id });
  }
  function open(activity) {
    if (activity.status === "locked") return;
    setMissionId(null);
    tab("world");
    setFollowRequest((current) => ({ id: activity.id, version: (current?.version || 0) + 1 }));
  }
  function openFinale() {
    if (!allClues) return;
    setMissionId(null);
    setEnding(complete ? "party" : "riddle");
  }
  async function startMission(id) {
    const activity = journey.activities.find((item) => item.id === id);
    if (!activity || activity.status === "locked") return;
    setMissionId(id);
    if (activity.status !== "available") return;
    const local = {
      ...journey,
      activities: journey.activities.map((item) =>
        item.id === id ? { ...item, status: "in_progress", clue_status: "incomplete" } : item,
      ),
    };
    setJourney(local);
    if (online) {
      try {
        const { data } = await api.post(`/activities/${id}/start/`);
        setJourneyState((current) => {
          // Do not replace a newer quiz completion if the start request resolves late.
          if (
            current.started_at !== data.started_at ||
            current.completed.length > data.completed.length ||
            current.attempts > data.attempts ||
            current.finished_at
          )
            return current;
          writeLocal("journey", data);
          return data;
        });
      } catch {
        /* Local in-progress state is retained; submission is validated by the API. */
      }
    }
  }
  function solved(data) {
    setJourney(data);
    setEnding("party");
  }
  async function restart() {
    setResetBusy(true);
    try {
      const { data } = await api.delete("/journey/", { data: { confirm: true } });
      clearLocalJourney();
      setOrder([]);
      setJourney(data);
      setMissionId(null);
      setFollowRequest(null);
      setEnding(null);
      setResetKey((value) => value + 1);
      setReset(false);
      setParams({});
    } catch (requestError) {
      setError(errorMessage(requestError));
      setReset(false);
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="game-shell">
      <header className="game-hud-bar">
        <button
          className="player-badge"
          onClick={() => tab("profile")}
          aria-label="Abrir meu perfil"
        >
          <span className="player-portrait" aria-hidden="true">
            <StrawberryMark size={40} />
          </span>
          <span>
            <small>JOGANDO COM MORANGUINHO</small>
            <strong>{user.name.split(" ")[0]}</strong>
          </span>
          <span className="player-level" title="Nível de exploração">
            {Math.min((journey?.completed.length || 0) + 1, 6)}
          </span>
        </button>
        <div className="hud-progress">
          <span>
            <Star size={15} fill="currentColor" /> {journey?.xp || 0} <small>XP</small>
          </span>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progresso da jornada"
            aria-valuenow={journey?.percent || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${journey?.percent || 0}%` }} />
          </div>
          <small>{journey?.completed.length || 0} / 6 fases</small>
          <span className="save-indicator" role="status">
            <span className={`status-dot ${!online || error ? "status-dot--offline" : ""}`} />
            {!online || error
              ? "Offline · cópia local"
              : busy
                ? "Carregando…"
                : "Online · jornada salva"}
          </span>
        </div>
        <div className="game-tools">
          {error && journey && (
            <button
              className="game-tool"
              aria-label="Reconectar ao servidor"
              title="Reconectar"
              onClick={load}
            >
              <RotateCcw size={17} />
            </button>
          )}
          <button
            className="game-tool"
            onClick={() => setInfo(true)}
            aria-label="Como jogar"
            title="Como jogar"
          >
            <HelpCircle size={20} />
          </button>
          <FullscreenButton />
          <Link className="game-tool" to="/" aria-label="Tela inicial" title="Tela inicial">
            <HomeIcon size={19} />
          </Link>
        </div>
      </header>
      <main className={`game-stage ${view !== "world" ? "game-stage--menu" : ""}`}>
        {journey && (
          <Exploration
            activities={journey.activities}
            paused={view !== "world" || Boolean(selected) || info || reset || Boolean(ending)}
            followRequest={followRequest}
            resetKey={resetKey}
            onMission={startMission}
            finalSolved={complete}
            onFinale={openFinale}
          />
        )}
        {error && !journey && (
          <div className="world-error notice notice--error" role="alert">
            {error}
            <button className="button button--small button--outline" onClick={load}>
              Tentar novamente
            </button>
          </div>
        )}
        {busy && !journey && (
          <div className="world-loading">
            <span className="spinner" />
            <h1>Abrindo o jardim…</h1>
            <p>Uma nova descoberta está logo ali.</p>
          </div>
        )}
        {journey && view !== "world" && (
          <section
            className={`game-menu game-menu--${view}`}
            aria-label={views.find((item) => item.id === view).label}
          >
            <header className="game-menu-heading">
              <div>
                <span className="eyebrow">
                  {view === "journal"
                    ? "INVENTÁRIO DE DESCOBERTAS"
                    : view === "achievements"
                      ? "SEU SALÃO DE TROFÉUS"
                      : "FICHA DO AVENTUREIRO"}
                </span>
                <h1>
                  {view === "journal"
                    ? "Meu diário"
                    : view === "achievements"
                      ? "Conquistas"
                      : "Meu perfil"}
                </h1>
              </div>
              <button
                className="icon-button"
                aria-label="Voltar ao jardim"
                onClick={() => tab("world")}
              >
                <X size={19} />
              </button>
            </header>
            {view === "journal" && (
              <>
                <div className="journal-banner">
                  <BookOpen size={30} />
                  <div>
                    <span className="eyebrow">CADERNO DE EVIDÊNCIAS</span>
                    <h2>
                      {complete
                        ? "A amizade faz o jardim florescer."
                        : "Uma história que se revela aos poucos."}
                    </h2>
                    <div className="fragment-strip">
                      {[
                        ...orderedClues(journey.activities, order),
                        ...journey.activities.filter((item) => !item.fragment),
                      ].map((activity) => (
                        <span
                          key={activity.id}
                          className={activity.fragment ? "" : "fragment-missing"}
                        >
                          {activity.fragment || "?"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ClueOrder activities={journey.activities} order={order} onOrder={setOrder} />
                {allClues && (
                  <button className="button button--primary" onClick={openFinale}>
                    {complete ? "Festa das amigas" : "Resolver enigma final"}
                  </button>
                )}
                <div className="journal-grid journal-meetings">
                  {journey.activities.map((activity) => {
                    const Icon = destinationIcons[activity.icon];
                    const friend = FRIENDS.find((item) => item.id === activity.id);
                    return (
                      <article
                        key={activity.id}
                        className={`journal-card paper-card color-${activity.color} ${activity.status === "completed" ? "" : "journal-empty"}`}
                      >
                        <header className="journal-meeting-heading">
                          <span className="destination-symbol">
                            {friend ? <FriendPortrait friend={friend} /> : <Icon size={23} />}
                          </span>
                          <div>
                            <span className="eyebrow">{activity.place}</span>
                            <h2>{activity.friend ?? activity.title}</h2>
                          </div>
                        </header>
                        <p className="clue-state">
                          {
                            {
                              locked: "Pista bloqueada",
                              incomplete: "Pista incompleta",
                              complete: "Pista completa",
                            }[activity.clue_status]
                          }{" "}
                          ·{" "}
                          {
                            {
                              locked: "Bloqueado",
                              available: "Disponível",
                              in_progress: "Em andamento",
                              completed: "Concluído",
                            }[activity.status]
                          }
                        </p>
                        {activity.treasure && activity.status !== "completed" && (
                          <p>
                            Tesouro encontrado: <strong>{activity.treasure}</strong>
                          </p>
                        )}
                        {activity.clue_preview && <p>Pista parcial: {activity.clue_preview}</p>}
                        <p className="quiz-state">
                          {
                            {
                              unanswered: "Quiz não respondido",
                              incorrect: "Quiz respondido incorretamente",
                              correct: "Quiz respondido corretamente",
                            }[activity.quiz_status]
                          }
                        </p>
                        <p>
                          {activity.status === "completed"
                            ? activity.revelation
                            : ["available", "in_progress"].includes(activity.status)
                              ? activity.story
                              : "Desbloqueie este encontro ao encontrar a pista anterior."}
                        </p>
                        {activity.fragment ? (
                          <span className="collected-fragment">
                            {activity.fragment} · {activity.treasure}
                            <Check size={14} />
                          </span>
                        ) : ["available", "in_progress"].includes(activity.status) ? (
                          <button className="text-action" onClick={() => open(activity)}>
                            Visitar {activity.friend} <ArrowRight size={14} />
                          </button>
                        ) : (
                          <span className="journal-lock">
                            <LockIcon size={14} /> Encontro bloqueado
                          </span>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
            {view === "achievements" && (
              <>
                <div className="achievement-summary paper-card">
                  <span className="achievement-trophy">
                    <Trophy size={32} />
                  </span>
                  <div>
                    <span className="eyebrow">SUA COLEÇÃO DE DESCOBERTAS</span>
                    <h2>{journey.xp} pontos de exploração.</h2>
                    <p>
                      {
                        achievements.filter(
                          (item) =>
                            journey.completed.length >= item.threshold &&
                            (item.id !== "guardian" || complete),
                        ).length
                      }{" "}
                      de {achievements.length} conquistas desbloqueadas · {journey.attempts}{" "}
                      tentativas na jornada
                    </p>
                  </div>
                  {allClues && (
                    <div className="achievement-actions">
                      <button className="button button--primary" onClick={openFinale}>
                        {complete ? "Festa das amigas" : "Resolver enigma final"}{" "}
                        <Trophy size={16} />
                      </button>
                      {complete && (
                        <button
                          className="button button--outline"
                          onClick={() => setEnding("certificate")}
                        >
                          Meu certificado <Download size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="achievement-grid">
                  {achievements.map(({ id, title, text, threshold, icon: Icon }) => {
                    const unlocked =
                      journey.completed.length >= threshold && (id !== "guardian" || complete);
                    return (
                      <article
                        key={id}
                        className={`achievement-card paper-card ${unlocked ? "is-unlocked" : ""}`}
                      >
                        <span className="achievement-emblem">
                          <Icon size={35} strokeWidth={1.4} />
                        </span>
                        <span className="eyebrow">
                          {unlocked ? "CONQUISTA DESBLOQUEADA" : "UM NOVO OBJETIVO"}
                        </span>
                        <h2>{title}</h2>
                        <p>{text}</p>
                        <span className="achievement-status">
                          {unlocked ? (
                            <>
                              <Check size={14} /> Conquistado
                            </>
                          ) : (
                            <>
                              <LockIcon size={14} />
                              {Math.min(journey.completed.length, threshold)} / {threshold} destinos
                            </>
                          )}
                        </span>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
            {view === "profile" && (
              <>
                <Profile user={user} updateUser={updateUser} />
                <GeoLocation />
              </>
            )}

            {view === "profile" && (
              <button className="restart-journey" onClick={() => setReset(true)}>
                <RotateCcw size={15} /> Reiniciar jornada
              </button>
            )}
          </section>
        )}
      </main>
      <footer className="game-bottom-bar">
        <span className="game-bottom-hint">
          <Compass size={16} />{" "}
          {complete ? "O jardim está em festa!" : "Toda grande aventura começa com um passo."}
        </span>
        <nav className="game-dock" aria-label="Navegação da aventura">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => tab(id)}
              aria-pressed={view === id}
            >
              <Icon size={23} />
              <span>{label}</span>
              {id === "journal" && <small>{journey?.completed.length || 0}/6</small>}
            </button>
          ))}
        </nav>
        <span className="game-bottom-brand">
          <Logo compact light />
        </span>
      </footer>
      {selected && (
        <Challenge
          key={selected.id}
          activity={selected}
          fragments={journey.fragments}
          onClose={closeActivity}
          onUpdate={setJourney}
          onNext={next ? () => open(next) : undefined}
          onFinale={allClues ? openFinale : undefined}
          finalSolved={complete}
          online={online}
        />
      )}
      {info && <GameGuide onClose={() => setInfo(false)} />}
      {reset && (
        <Modal title="Reiniciar jornada" onClose={() => setReset(false)}>
          <span className="eyebrow">COMEÇAR UMA NOVA HISTÓRIA</span>
          <h2>
            Explorar o jardim
            <br />
            mais uma vez?
          </h2>
          <p className="modal-lead">
            As mensagens, pontos e conquistas desta jornada serão reiniciados. Você poderá começar
            uma nova aventura quando quiser.
          </p>
          <div className="modal-actions">
            <button className="button button--outline" onClick={() => setReset(false)}>
              Manter minha jornada
            </button>
            <button
              className="button button--primary"
              disabled={resetBusy || !online}
              onClick={restart}
            >
              {resetBusy ? "Reiniciando…" : "Sim, reiniciar"}
            </button>
          </div>
        </Modal>
      )}
      {allClues && !complete && ending === "riddle" && (
        <FinalRiddle
          journey={journey}
          order={order}
          onOrder={setOrder}
          onSolved={solved}
          onClose={() => setEnding(null)}
          online={online}
        />
      )}
      {complete && ending === "party" && (
        <Finale
          journey={journey}
          onClose={() => setEnding(null)}
          onCertificate={() => setEnding("certificate")}
          onRestart={() => {
            setEnding(null);
            setReset(true);
          }}
        />
      )}
      {complete && ending === "certificate" && (
        <Certificate
          name={user.name}
          journey={journey}
          onClose={() => setEnding(null)}
          onFinale={openFinale}
        />
      )}
    </div>
  );
}
function LockIcon({ size = 16 }) {
  return <LockKeyhole size={size} />;
}
