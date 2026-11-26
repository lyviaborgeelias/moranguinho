import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Compass,
  Footprints,
  Heart,
  Lightbulb,
  MessageCircle,
  Navigation,
  Sparkles,
  Square,
  Trophy,
} from "lucide-react";
import { FRIENDS } from "../game/world";
import { conversations } from "../game/dialogue";
import Modal from "./Modal";

export function FriendPortrait({ friend }) {
  return (
    <div
      className="friend-portrait"
      role="img"
      aria-label={friend.name}
      style={{ "--portrait-offset": `${(friend.id - 1) * 20}%` }}
    />
  );
}

function Encounter({ friend, activity, target, onClose, onMission, onGuide, onFinale }) {
  const [topic, setTopic] = useState("greeting");
  const { clue, thanks } = conversations[friend.id];
  const locked = activity.status === "locked";
  const finished = activity.status === "completed";
  const lines = { greeting: finished ? thanks : friend.greeting, clue, hint: activity.hint };
  return (
    <Modal title={`Conversar com ${friend.name}`} onClose={onClose} className="encounter">
      <header className="encounter-header">
        <div className="encounter-portrait" style={{ "--friend-color": friend.color }}>
          <FriendPortrait friend={friend} />
        </div>
        <div>
          <p className="eyebrow">{activity.place}</p>
          <h2>{friend.name}</h2>
          <p>{locked ? "Encontro futuro" : activity.title}</p>
        </div>
      </header>
      <div className="encounter-speech" aria-live="polite">
        <MessageCircle size={17} aria-hidden="true" />
        <p>
          {locked
            ? `Ainda estou preparando minha pista. ${target.name} está com o próximo bilhete. Procure por ela, e depois me conte o que descobriu!`
            : lines[topic]}
        </p>
      </div>
      {!locked && (
        <div className="encounter-topics" role="group" aria-label="Sobre o que conversar">
          {[
            ["greeting", finished ? "Agradecimento" : "Saudação", Heart],
            ["clue", "Sobre o bilhete", BookOpen],
            ["hint", "Pedir uma dica", Lightbulb],
          ].map(([id, label, Icon]) => (
            <button type="button" key={id} aria-pressed={topic === id} onClick={() => setTopic(id)}>
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
      <footer className="encounter-footer">
        {!locked && (
          <span className="encounter-objective">
            {finished ? (
              <>
                <Heart size={15} fill="currentColor" aria-hidden="true" /> Palavra guardada:{" "}
                {activity.fragment}
              </>
            ) : (
              <>
                <Sparkles size={15} /> {activity.questions.length} perguntas · 100 XP
              </>
            )}
          </span>
        )}
        <div className="encounter-actions">
          <button type="button" className="button button--outline" onClick={onClose}>
            Continuar passeando
          </button>
          {locked ? (
            <button type="button" className="button button--primary" onClick={onGuide}>
              Ir até {target.name} <ArrowRight size={17} />
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={onMission}>
              {finished ? "Rever perguntas" : "Aceitar missão"} <ArrowRight size={17} />
            </button>
          )}
        </div>
        {onFinale && (
          <button type="button" className="text-action" onClick={onFinale}>
            Visitar a festa <Trophy size={15} />
          </button>
        )}
      </footer>
    </Modal>
  );
}

export default function Exploration({
  activities,
  paused,
  followRequest,
  resetKey,
  onMission,
  onFinale,
}) {
  const host = useRef(null),
    engine = useRef(null),
    labels = useRef(new Map());
  const [state, setState] = useState({
    nearId: null,
    distance: 0,
    region: "Jardim da casa",
    following: false,
    angle: 0,
  });
  const [dialogue, setDialogue] = useState(null),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [boot, setBoot] = useState(0),
    [listMode, setListMode] = useState(false);
  const next = activities.find((activity) => activity.status === "available");
  const target = FRIENDS.find((friend) => friend.id === next?.id) || FRIENDS[5];
  const near = FRIENDS.find((friend) => friend.id === state.nearId);
  const friend = FRIENDS.find((item) => item.id === dialogue);
  const activity = activities.find((item) => item.id === dialogue);
  const joystick = useRef(null);
  const guideRequest = useRef(null);
  const complete = activities.length > 0 && activities.every((item) => item.status === "completed");
  useEffect(() => {
    if (listMode) return;
    let instance,
      canceled = false;
    import("../game/engine")
      .then(({ createGarden }) => {
        if (canceled) return;
        instance = createGarden(host.current, {
          labels: labels.current,
          onState: setState,
          onTalk: setDialogue,
          onError: setError,
        });
        engine.current = instance;
        if (instance) setReady(true);
      })
      .catch(() => {
        if (!canceled)
          setError("Não foi possível carregar o cenário. Recarregue o jogo para tentar novamente.");
      });
    return () => {
      canceled = true;
      instance?.destroy();
      engine.current = null;
    };
  }, [boot, listMode]);
  useEffect(() => {
    engine.current?.setActivities(activities);
  }, [activities, ready, boot]);
  useEffect(() => {
    engine.current?.setPaused(Boolean(paused || dialogue));
    if (!paused && !dialogue && guideRequest.current) {
      engine.current?.follow(guideRequest.current);
      guideRequest.current = null;
    }
  }, [paused, dialogue, ready, boot]);
  useEffect(() => {
    if (!followRequest?.id) return;
    if (listMode) setDialogue(followRequest.id);
    else if (ready) engine.current?.follow(followRequest.id);
  }, [followRequest, ready, listMode]);
  useEffect(() => {
    if (resetKey) engine.current?.reset();
  }, [resetKey]);
  function follow(id) {
    setError("");
    engine.current?.follow(id);
  }
  function move(event, x, y) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    engine.current?.setJoystick(x, y);
  }
  function stop() {
    engine.current?.setJoystick(0, 0);
  }
  function stick(event) {
    if (!joystick.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    let x = (event.clientX - rect.left - rect.width / 2) / 35,
      y = (event.clientY - rect.top - rect.height / 2) / 35;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    engine.current?.setJoystick(x, y);
    event.currentTarget.style.setProperty("--stick-x", `${x * 22}px`);
    event.currentTarget.style.setProperty("--stick-y", `${y * 22}px`);
  }
  return (
    <div
      className={`exploration ${paused ? "exploration--paused" : ""}`}
      aria-label="Mundo explorável da Moranguinho"
    >
      <div ref={host} className="garden-renderer" data-testid="garden-world" />
      <div className="npc-labels">
        {FRIENDS.map((item) => (
          <button
            key={item.id}
            ref={(node) => {
              if (node) labels.current.set(item.id, node);
              else labels.current.delete(item.id);
            }}
            className="npc-tag"
            onClick={() => follow(item.id)}
            disabled={paused || Boolean(dialogue)}
            aria-label={`Caminhar até ${item.name}`}
          >
            <span className="npc-quest-marker">!</span>
            <strong>{item.name}</strong>
          </button>
        ))}
      </div>
      {!paused && !listMode && !ready && !error && (
        <div className="garden-starting">
          <span className="spinner" />
          <strong>Preparando o jardim…</strong>
          <span>As amigas estão esperando por você.</span>
        </div>
      )}
      {!paused && error && (
        <div className="garden-error" role="alert">
          <p>{error}</p>
          <button
            className="button button--small button--outline"
            onClick={() => {
              if (!engine.current) {
                setBoot((value) => value + 1);
                setError("");
              } else setError("");
            }}
          >
            {engine.current ? "Entendi" : "Reabrir cenário"}
          </button>
          {!engine.current && (
            <button
              className="button button--small button--primary"
              onClick={() => {
                setError("");
                setListMode(true);
              }}
            >
              Jogar com a lista de encontros <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
      {listMode && !paused && (
        <section className="encounter-list" aria-label="Lista de encontros">
          <header>
            <div>
              <p className="eyebrow">TUTTI-FRUTTI</p>
              <h1>Encontre suas amigas</h1>
            </div>
            <button
              className="button button--outline button--small"
              onClick={() => setListMode(false)}
            >
              Voltar ao jardim 3D
            </button>
          </header>
          <div>
            {activities.map((item) => {
              const npc = FRIENDS.find((entry) => entry.id === item.id);
              if (!npc) return null;
              return (
                <button type="button" key={npc.id} onClick={() => setDialogue(npc.id)}>
                  <FriendPortrait friend={npc} />
                  <span>
                    <strong>{npc.name}</strong>
                    <small>
                      {
                        {
                          locked: "Encontro futuro",
                          available: "Próxima pista",
                          completed: "Pista encontrada",
                        }[item.status]
                      }
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              );
            })}
          </div>
          {complete && (
            <button className="button button--primary" onClick={onFinale}>
              Abrir a festa <Trophy size={16} />
            </button>
          )}
        </section>
      )}
      {!paused && ready && (
        <>
          <section className="field-mission" aria-label="Missão atual">
            <div className="field-mission-heading">
              <span className="mission-compass">
                <Navigation size={21} style={{ transform: `rotate(${state.angle}rad)` }} />
              </span>
              <div>
                <span className="eyebrow">
                  {next ? `ENCONTRO ${next.id} DE 6` : "JORNADA CONCLUÍDA"}
                </span>
                <h1>{next ? `Encontre ${target.name}` : "O segredo da amizade"}</h1>
              </div>
            </div>
            <p>
              {next
                ? "Caminhe até sua amiga e descubra a próxima pista."
                : "A festa das amigas está pronta na clareira."}
            </p>
            <div className="field-mission-bottom">
              {next ? (
                <span>
                  <Footprints size={13} /> {state.distance} m
                </span>
              ) : (
                <span>
                  <Sparkles size={13} /> 6 de 6 pistas
                </span>
              )}
              {next ? (
                <button
                  onClick={() => (state.following ? engine.current?.stop() : follow(target.id))}
                >
                  {state.following ? (
                    <>
                      <Square size={11} /> Parar caminhada
                    </>
                  ) : (
                    <>
                      Seguir até {target.name} <ArrowRight size={13} />
                    </>
                  )}
                </button>
              ) : (
                <button onClick={onFinale}>
                  Abrir a festa <Trophy size={13} />
                </button>
              )}
            </div>
          </section>
          <div className="field-location">
            <span className="location-line" />
            <Compass size={15} />
            <span>{state.region}</span>
            <small>TUTTI-FRUTTI</small>
          </div>
          <div className="walking-help">
            <span>
              <kbd>W</kbd>
              <span>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd>
              </span>
            </span>
            <p>
              Caminhar <i>Shift para correr</i>
            </p>
            <span className="walking-help-divider" />
            <p>
              Arraste para olhar{" "}
              <i>
                <kbd>E</kbd> para conversar
              </i>
            </p>
          </div>
          <div className="touch-controls" aria-label="Controles de movimento">
            <div
              className="movement-stick"
              aria-label="Joystick virtual"
              role="group"
              style={{ "--stick-x": "0px", "--stick-y": "0px" }}
              onPointerDown={(event) => {
                joystick.current = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                stick(event);
              }}
              onPointerMove={stick}
              onPointerUp={(event) => {
                joystick.current = null;
                stop();
                event.currentTarget.style.setProperty("--stick-x", "0px");
                event.currentTarget.style.setProperty("--stick-y", "0px");
              }}
              onPointerCancel={(event) => {
                joystick.current = null;
                stop();
                event.currentTarget.style.setProperty("--stick-x", "0px");
                event.currentTarget.style.setProperty("--stick-y", "0px");
              }}
            >
              <span />
            </div>
            <div className="movement-buttons">
              {[
                ["Caminhar para cima", ArrowUp, 0, -1],
                ["Caminhar para a esquerda", ArrowLeft, -1, 0],
                ["Caminhar para baixo", ArrowDown, 0, 1],
                ["Caminhar para a direita", ArrowRight, 1, 0],
              ].map(([label, Icon, x, y]) => (
                <button
                  key={label}
                  aria-label={label}
                  onPointerDown={(event) => move(event, x, y)}
                  onPointerUp={stop}
                  onPointerCancel={stop}
                  onKeyDown={(event) => {
                    if (["Enter", " "].includes(event.key)) {
                      event.preventDefault();
                      engine.current?.setJoystick(x, y);
                    }
                  }}
                  onKeyUp={stop}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>
          {near && (
            <button className="talk-prompt" onClick={() => engine.current?.interact()}>
              <MessageCircle size={21} />
              <span>
                <small>CONVERSAR COM</small>
                <strong>{near.name}</strong>
              </span>
              <kbd>E</kbd>
            </button>
          )}
          {state.following && (
            <span className="walking-state" role="status">
              <Footprints size={15} /> A caminho… Use WASD ou o controle para mudar de direção.
            </span>
          )}
        </>
      )}
      {friend && activity && (
        <Encounter
          key={friend.id}
          friend={friend}
          activity={activity}
          target={target}
          onClose={() => setDialogue(null)}
          onMission={() => {
            setDialogue(null);
            onMission(activity.id);
          }}
          onGuide={() => {
            if (listMode) setDialogue(target.id);
            else {
              guideRequest.current = target.id;
              setDialogue(null);
            }
          }}
          onFinale={
            complete
              ? () => {
                  setDialogue(null);
                  onFinale();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
