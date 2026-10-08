import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Download,
  Flag,
  HelpCircle,
  Leaf,
  LockKeyhole,
  LogOut,
  MapPinned,
  MoveHorizontal,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import Modal from "../components/Modal";
import Challenge from "../components/Challenge";
import { PasswordField } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { achievements, destinationIcons } from "../data/activities";
import api, { errorMessage } from "../services/api";
import { saveAuth } from "../services/auth";
import "../styles/Adventure.css";

const views = [
  { id: "map", label: "Mapa do vale", icon: MapPinned },
  { id: "journal", label: "Meu diário", icon: BookOpen },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "profile", label: "Meu perfil", icon: Settings2 },
];

function Profile({ user, updateUser, logout }) {
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  async function save(event, changePassword = false) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (changePassword) {
        const { data } = await api.post("/password/change/", passwords);
        const remember = Boolean(localStorage.getItem("accessToken"));
        saveAuth(data.access, data.refresh, data.user, remember);
        setPasswords({ current_password: "", password: "", password_confirmation: "" });
      } else {
        const { data } = await api.patch("/me/", { name });
        updateUser(data.user);
      }
      setNotice({
        type: "success",
        text: changePassword ? "Sua senha foi atualizada." : "Seu nome foi atualizado.",
      });
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }
  const change = (event) =>
    setPasswords((current) => ({ ...current, [event.target.name]: event.target.value }));
  return (
    <div className="profile-layout">
      <article className="paper-card">
        <span className="eyebrow">IDENTIDADE DE EXPLORADOR</span>
        <h2>Sobre você.</h2>
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
          <label className="form-label">
            E-mail
            <span className="input-wrap">
              <input value={user.email} readOnly autoComplete="email" />
            </span>
          </label>
          <button className="button button--dark" disabled={busy}>
            Salvar nome <Check size={16} />
          </button>
        </form>
      </article>
      <article className="paper-card">
        <span className="eyebrow">SEGURANÇA DA CONTA</span>
        <h2>Uma nova senha.</h2>
        <form onSubmit={(event) => save(event, true)}>
          <PasswordField
            label="Senha atual"
            name="current_password"
            value={passwords.current_password}
            onChange={change}
          />
          <PasswordField
            label="Nova senha"
            value={passwords.password}
            onChange={change}
            newPassword
          />
          <PasswordField
            label="Confirme a nova senha"
            name="password_confirmation"
            value={passwords.password_confirmation}
            onChange={change}
            newPassword
          />
          <button className="button button--dark" disabled={busy}>
            Atualizar senha <ShieldCheck size={16} />
          </button>
        </form>
      </article>
      <article className="profile-session paper-card">
        <LogOut size={21} />
        <div>
          <strong>Uma pausa na aventura?</strong>
          <p>Seu progresso fica guardado para a próxima visita.</p>
        </div>
        <button className="button button--outline" onClick={logout}>
          Encerrar sessão <ArrowRight size={16} />
        </button>
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
  const { user, logout, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const view = views.some((item) => item.id === params.get("aba")) ? params.get("aba") : "map";
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [info, setInfo] = useState(false);
  const [reset, setReset] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [certificate, setCertificate] = useState(false);
  const selectedId = Number(params.get("atividade"));
  const selected = journey?.activities.find(
    (item) => item.id === selectedId && item.status !== "locked",
  );
  const next = journey?.activities.find((item) => item.status === "available");
  const complete = journey?.completed.length === 6;
  const closeActivity = useCallback(() => {
    setParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.delete("atividade");
      return nextParams;
    });
  }, [setParams]);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get("/journey/");
      setJourney(data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function tab(id) {
    setParams(id === "map" ? {} : { aba: id });
  }
  function open(activity) {
    if (activity.status === "locked") return;
    setParams({ atividade: String(activity.id) });
  }
  async function restart() {
    setResetBusy(true);
    try {
      const { data } = await api.delete("/journey/", { data: { confirm: true } });
      setJourney(data);
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
    <div className="app-layout">
      <aside className="app-sidebar">
        <Link className="sidebar-brand" to="/">
          <Logo />
        </Link>
        <span className="sidebar-section-label">SEU ESPAÇO DE DESCOBERTAS</span>
        <nav className="sidebar-nav" aria-label="Navegação da aventura">
          {views.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => tab(id)}>
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {view === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-story">
          <span className="sidebar-story-icon">
            <Leaf size={22} />
          </span>
          <span className="eyebrow">UM PEQUENO LEMBRETE</span>
          <p>
            Grandes descobertas
            <br />
            começam com
            <br />
            <em>pequenos passos.</em>
          </p>
          <small>— Diário de Tutti-Frutti</small>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setInfo(true)}>
            <HelpCircle size={16} /> Como explorar
          </button>
          <button onClick={logout}>
            <LogOut size={16} /> Sair da conta
          </button>
          <span>UM CONVITE À CURIOSIDADE · 2026</span>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span>
            <Compass size={16} /> Seu vale <ChevronRight size={13} />
            <strong>{views.find((item) => item.id === view).label}</strong>
          </span>
          <div className="topbar-account">
            <span className="sync-status">
              <span className="status-dot" />
              {busy ? "Carregando" : error ? "Conexão pendente" : "Progresso salvo"}
            </span>
            <button
              className="account-avatar"
              onClick={() => tab("profile")}
              aria-label="Abrir meu perfil"
            >
              {user.name?.charAt(0).toUpperCase() || "A"}
            </button>
          </div>
        </header>
        <main className="dashboard">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">
                {view === "map" ? "A PRÓXIMA DESCOBERTA É SUA" : "CADA DESCOBERTA CONTA"}
              </span>
              <h1>
                {view === "map" ? (
                  <>
                    Seu mapa. <em>Sua aventura.</em>
                  </>
                ) : view === "journal" ? (
                  <>
                    Páginas da <em>sua jornada.</em>
                  </>
                ) : view === "achievements" ? (
                  <>
                    Pequenos passos. <em>Grandes conquistas.</em>
                  </>
                ) : (
                  <>
                    Seu espaço no <em>vale.</em>
                  </>
                )}
              </h1>
              <p>
                {view === "map"
                  ? `Olá, ${user.name.split(" ")[0]}! O vale tem histórias esperando por você.`
                  : view === "journal"
                    ? "Os fragmentos que você encontrou ficam guardados aqui."
                    : view === "achievements"
                      ? "Cada destino explorado deixa uma marca na sua história."
                      : "Atualize seu nome e cuide da segurança da sua conta."}
              </p>
            </div>
            <span className="chapter-label">
              <span>JORNADA PRINCIPAL</span>
              <strong>01 — 06</strong>
            </span>
          </div>
          {error && (
            <div className="dashboard-error notice notice--error" role="alert">
              {error}
              <button className="button button--small button--outline" onClick={load}>
                Tentar novamente
              </button>
            </div>
          )}
          {busy && !journey ? (
            <div className="content-loading">
              <span className="spinner" /> Abrindo o mapa do vale…
            </div>
          ) : (
            journey && (
              <>
                {view === "map" && (
                  <>
                    <div className="dashboard-grid">
                      <section className="map-card">
                        <div className="map-card-heading">
                          <div>
                            <MapPinned size={17} />
                            <strong>Vale de Tutti-Frutti</strong>
                            <span>MAPA DE EXPLORAÇÃO</span>
                          </div>
                          <button
                            className="icon-button"
                            onClick={() => setInfo(true)}
                            aria-label="Instruções do mapa"
                          >
                            <HelpCircle size={17} />
                          </button>
                        </div>
                        <div
                          className="map-viewport"
                          tabIndex={0}
                          aria-label="Mapa navegável. Deslize ou use as setas para explorar todos os destinos."
                        >
                          <div className="map-canvas" style={{ width: `${zoom * 100}%` }}>
                            <img
                              src="/imagens/tutti-frutti-map.png"
                              alt="Mapa do vale com o pomar, bosque, lago, torre, biblioteca e grande árvore"
                              draggable="false"
                            />
                            <svg
                              className="map-route"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              aria-hidden="true"
                            >
                              <path d="M17 66 Q15 48 32 36 Q43 36 53 60 Q60 61 64 24 Q78 26 82 45 Q93 35 84 15" />
                            </svg>
                            {journey.activities.map((activity) => {
                              const Icon = destinationIcons[activity.icon];
                              return (
                                <button
                                  key={activity.id}
                                  className={`map-pin pin--${activity.status} color-${activity.color}`}
                                  style={{ left: `${activity.x}%`, top: `${activity.y}%` }}
                                  onClick={() => open(activity)}
                                  disabled={activity.status === "locked"}
                                  aria-label={`${activity.place}: ${activity.status === "locked" ? "bloqueado" : activity.status === "completed" ? "concluído" : "explorar"}`}
                                >
                                  <span className="pin-halo" />
                                  <span className="pin-head">
                                    {activity.status === "completed" ? (
                                      <Check size={17} />
                                    ) : activity.status === "locked" ? (
                                      <LockIcon />
                                    ) : (
                                      <Icon size={18} />
                                    )}
                                  </span>
                                  <small>{activity.place}</small>
                                  <b>{String(activity.id).padStart(2, "0")}</b>
                                </button>
                              );
                            })}
                            <div className="map-coordinates">
                              TUTTI-FRUTTI
                              <br />
                              <span>CARTOGRAFIA DO EXTRAORDINÁRIO</span>
                            </div>
                            <div className="map-north">
                              <span>N</span>
                              <Compass size={26} />
                            </div>
                          </div>
                        </div>
                        <p className="map-scroll-tip">
                          <MoveHorizontal size={12} /> Deslize para explorar todo o mapa
                        </p>
                        <div className="map-card-footer">
                          <div className="map-legend">
                            <span>
                              <i /> Disponível
                            </span>
                            <span>
                              <i /> Concluído
                            </span>
                            <span>
                              <i /> Bloqueado
                            </span>
                          </div>
                          <div className="zoom-controls">
                            <button
                              className="icon-button"
                              aria-label="Diminuir zoom"
                              disabled={zoom <= 1}
                              onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
                            >
                              <Minus size={15} />
                            </button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button
                              className="icon-button"
                              aria-label="Aumentar zoom"
                              disabled={zoom >= 1.75}
                              onClick={() => setZoom((value) => Math.min(1.75, value + 0.25))}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        </div>
                      </section>
                      <aside className="quest-sidebar">
                        <article className="next-quest paper-card">
                          <span className="eyebrow">
                            <span className="status-dot" />
                            {complete ? "JORNADA CONCLUÍDA" : "PRÓXIMA DESCOBERTA"}
                          </span>
                          <span className="quest-large-icon">
                            {complete ? <Trophy size={30} /> : <Compass size={30} />}
                          </span>
                          <h2>{next ? next.title : "O vale voltou a florescer."}</h2>
                          <p>
                            {next
                              ? next.story
                              : "Os seis fragmentos estão reunidos. A memória do vale vive de novo, graças à sua curiosidade."}
                          </p>
                          {next ? (
                            <>
                              <div className="quest-meta">
                                <span>0{next.id} / 06</span>
                                <span>
                                  {next.skill} · {next.minutes} min
                                </span>
                              </div>
                              <button
                                className="button button--primary button--full"
                                onClick={() => open(next)}
                              >
                                Explorar destino <ArrowRight size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="button button--dark button--full"
                              onClick={() => setCertificate(true)}
                            >
                              Ver certificado <Trophy size={16} />
                            </button>
                          )}
                        </article>
                        <article className="journey-progress paper-card">
                          <div>
                            <strong>Seu caminho até aqui</strong>
                            <span>{journey.percent}%</span>
                          </div>
                          <div
                            className="progress-track"
                            role="progressbar"
                            aria-label="Progresso da jornada"
                            aria-valuenow={journey.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <i style={{ width: `${journey.percent}%` }} />
                          </div>
                          <p>{journey.completed.length} de 6 fragmentos encontrados</p>
                          <div className="progress-stats">
                            <span>
                              <Sparkles size={15} />
                              <strong>{journey.xp}</strong> pontos
                            </span>
                            <span>
                              <Flag size={15} />
                              <strong>{journey.completed.length}</strong> destinos
                            </span>
                          </div>
                        </article>
                      </aside>
                    </div>
                    <div className="destination-section-heading">
                      <h2>Seis lugares. Uma história.</h2>
                      <span>SEU ROTEIRO DE EXPLORAÇÃO</span>
                    </div>
                    <div className="destination-grid">
                      {journey.activities.map((activity) => {
                        const Icon = destinationIcons[activity.icon];
                        return (
                          <button
                            className={`destination-card color-${activity.color} destination--${activity.status}`}
                            key={activity.id}
                            disabled={activity.status === "locked"}
                            onClick={() => open(activity)}
                          >
                            <span className="destination-card-top">
                              <span className="destination-symbol">
                                <Icon size={20} />
                              </span>
                              <small>0{activity.id}</small>
                            </span>
                            <strong>{activity.place}</strong>
                            <span className="destination-skill">{activity.skill}</span>
                            <span className="destination-state">
                              {activity.status === "completed" ? (
                                <>
                                  <Check size={12} /> Explorado
                                </>
                              ) : activity.status === "locked" ? (
                                <>
                                  <LockIcon size={12} /> Complete o anterior
                                </>
                              ) : (
                                <>
                                  Explorar agora <ArrowRight size={13} />
                                </>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {view === "journal" && (
                  <>
                    <div className="journal-banner">
                      <BookOpen size={30} />
                      <div>
                        <span className="eyebrow">O ANTIGO REGISTRO</span>
                        <h2>
                          {complete
                            ? "Juntos o vale volta a florescer."
                            : "Uma história que se revela aos poucos."}
                        </h2>
                        <div className="fragment-strip">
                          {journey.activities.map((activity) => (
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
                    <div className="journal-grid">
                      {journey.activities.map((activity) => {
                        const Icon = destinationIcons[activity.icon];
                        return (
                          <article
                            key={activity.id}
                            className={`journal-card paper-card color-${activity.color} ${activity.status === "completed" ? "" : "journal-empty"}`}
                          >
                            <span className="destination-symbol">
                              <Icon size={23} />
                            </span>
                            <span className="eyebrow">PÁGINA 0{activity.id}</span>
                            <h2>{activity.place}</h2>
                            <p>
                              {activity.status === "completed"
                                ? activity.story
                                : "Este capítulo ainda espera pela sua descoberta."}
                            </p>
                            {activity.fragment ? (
                              <span className="collected-fragment">
                                {activity.fragment}
                                <Check size={14} />
                              </span>
                            ) : (
                              <button
                                className="text-action"
                                disabled={activity.status === "locked"}
                                onClick={() => open(activity)}
                              >
                                {activity.status === "locked"
                                  ? "Ainda não revelado"
                                  : "Descobrir esta página"}{" "}
                                <ArrowRight size={14} />
                              </button>
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
                              (item) => journey.completed.length >= item.threshold,
                            ).length
                          }{" "}
                          de 3 conquistas desbloqueadas · {journey.attempts} tentativas na jornada
                        </p>
                      </div>
                      {complete && (
                        <button
                          className="button button--dark"
                          onClick={() => setCertificate(true)}
                        >
                          Meu certificado <Download size={16} />
                        </button>
                      )}
                    </div>
                    <div className="achievement-grid">
                      {achievements.map(({ id, title, text, threshold, icon: Icon }) => {
                        const unlocked = journey.completed.length >= threshold;
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
                                  {Math.min(journey.completed.length, threshold)} / {threshold}{" "}
                                  destinos
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
                  <Profile user={user} updateUser={updateUser} logout={logout} />
                )}
                <footer className="dashboard-footer">
                  <span>
                    <Leaf size={13} /> Um passo de cada vez. Uma descoberta por vez.
                  </span>
                  <button onClick={() => setReset(true)}>
                    <RotateCcw size={12} /> Reiniciar jornada
                  </button>
                </footer>
              </>
            )
          )}
        </main>
      </div>
      {selected && (
        <Challenge
          key={selected.id}
          activity={selected}
          fragments={journey.fragments}
          onClose={closeActivity}
          onUpdate={setJourney}
        />
      )}
      {info && (
        <Modal title="Como explorar o vale" onClose={() => setInfo(false)}>
          <span className="eyebrow">SEU GUIA DE EXPLORAÇÃO</span>
          <h2>
            Deixe a curiosidade
            <br />
            guiar o caminho.
          </h2>
          <p className="modal-lead">
            Comece no pomar e visite os seis destinos do mapa. Cada desafio revela uma palavra do
            antigo registro e libera o próximo lugar.
          </p>
          <ol className="guide-list">
            <li>
              <MapPinned size={20} />
              <div>
                <strong>Escolha um destino disponível</strong>
                <p>Clique no ponto colorido do mapa ou no cartão abaixo dele.</p>
              </div>
            </li>
            <li>
              <Sparkles size={20} />
              <div>
                <strong>Resolva o desafio</strong>
                <p>
                  Leia a história, observe a pista e peça uma dica quando precisar. Você pode tentar
                  novamente.
                </p>
              </div>
            </li>
            <li>
              <BookOpen size={20} />
              <div>
                <strong>Guarde suas descobertas</strong>
                <p>
                  Seu progresso fica salvo na conta. Consulte o diário, reúna os fragmentos e
                  conquiste o certificado.
                </p>
              </div>
            </li>
          </ol>
          <button className="button button--dark button--full" onClick={() => setInfo(false)}>
            Entendi. Vamos explorar! <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {reset && (
        <Modal title="Reiniciar jornada" onClose={() => setReset(false)}>
          <span className="eyebrow">COMEÇAR UMA NOVA HISTÓRIA</span>
          <h2>
            Explorar o vale
            <br />
            mais uma vez?
          </h2>
          <p className="modal-lead">
            Os fragmentos, pontos e conquistas desta conta serão reiniciados. Seu cadastro
            continuará disponível.
          </p>
          <div className="modal-actions">
            <button className="button button--outline" onClick={() => setReset(false)}>
              Manter minha jornada
            </button>
            <button className="button button--primary" disabled={resetBusy} onClick={restart}>
              {resetBusy ? "Reiniciando…" : "Sim, reiniciar"}
            </button>
          </div>
        </Modal>
      )}
      {certificate && complete && (
        <Modal title="Certificado de guardião do vale" onClose={() => setCertificate(false)} wide>
          <div className="certificate">
            <Logo compact />
            <span className="certificate-stars">✦ ✧ ✦</span>
            <span className="eyebrow">CERTIFICADO DE CONCLUSÃO DA AVENTURA</span>
            <h2>Guardião do vale.</h2>
            <p>Concedido a</p>
            <strong>{user.name}</strong>
            <p>
              por explorar os seis destinos de Tutti-Frutti,
              <br />
              reunir os fragmentos e devolver a memória ao vale.
            </p>
            <div className="certificate-seal">
              <Trophy size={28} />
              <span>6 DESTINOS · 600 PONTOS</span>
            </div>
            <small>
              {new Date(journey.finished_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </small>
            <span className="certificate-motto">Juntos o vale volta a florescer.</span>
          </div>
          <button
            className="button button--dark button--full certificate-print"
            onClick={() => window.print()}
          >
            Imprimir ou salvar em PDF <Download size={16} />
          </button>
        </Modal>
      )}
    </div>
  );
}
function LockIcon({ size = 16 }) {
  return <LockKeyhole size={size} />;
}
