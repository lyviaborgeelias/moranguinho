import { ArrowRight, Compass, Flag, Gamepad2, MapPinned, Play, Puzzle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

export default function Home() {
  const { user } = useAuth();
  const destination = user ? "/aventura" : "/cadastro";
  return (
    <main className="landing">
      <header className="landing-header container">
        <Link to="/" aria-label="Início">
          <Logo />
        </Link>
        <nav aria-label="Navegação principal">
          <span className="landing-game-label">
            <Gamepad2 size={17} aria-hidden="true" /> Uma aventura de descobertas
          </span>
          {user ? (
            <Link className="button button--small button--dark" to="/aventura">
              Meu mapa <ArrowRight size={16} />
            </Link>
          ) : (
            <Link className="button button--small button--outline" to="/login">
              Entrar <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      </header>
      <section className="landing-hero container">
        <div className="landing-copy">
          <span className="eyebrow">
            <span className="status-dot" /> SUA PRÓXIMA AVENTURA COMEÇA AQUI
          </span>
          <h1>
            Todo lugar
            <br />
            guarda um <em>segredo.</em>
          </h1>
          <p>
            Entre no vale de Tutti-Frutti. Siga pistas, desperte sua curiosidade e reconstrua uma
            história que o tempo quase apagou.
          </p>
          <div className="landing-actions">
            <Link className="button button--primary" to={destination}>
              <span className="landing-play" aria-hidden="true">
                <Play size={11} fill="currentColor" strokeWidth={0} />
              </span>
              {user ? "Continuar minha jornada" : "Começar minha aventura"}
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-details">
            <span>
              <MapPinned size={17} />
              <strong>6</strong> destinos
            </span>
            <i />
            <span>
              <Puzzle size={17} />
              <strong>6</strong> desafios
            </span>
            <i />
            <span>
              <Trophy size={17} /> conquistas
            </span>
          </div>
        </div>
        <div className="landing-visual">
          <img
            src="/imagens/tutti-frutti-landscape.png"
            alt="Vale de Tutti-Frutti ao pôr do sol, com casas de morango e trilhas entre jardins"
            fetchPriority="high"
          />
          <div className="visual-vignette" />
          <div className="landing-trail" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                className="trail-shadow"
                d="M 22 57 C 16 48, 34 50, 40 40 S 48 29, 61 22"
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="trail-line"
                d="M 22 57 C 16 48, 34 50, 40 40 S 48 29, 61 22"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="trail-point trail-point--start">
              <Flag size={17} fill="currentColor" />
              <small>INÍCIO</small>
            </span>
            <span className="trail-point trail-point--second">02</span>
            <span className="trail-point trail-point--third">03</span>
          </div>
          <span className="image-coordinate">
            VALE DE TUTTI-FRUTTI
            <br />
            <small>O INÍCIO DE UMA GRANDE HISTÓRIA</small>
          </span>
          <Link className="floating-destination" to={destination}>
            <span aria-hidden="true">
              <Compass size={26} />
            </span>
            <div>
              <small>{user ? "O VALE ESPERA POR VOCÊ" : "MISSÃO 01 · OBSERVAÇÃO"}</small>
              <strong>O portão do pomar</strong>
              <p>
                {user ? "Voltar ao meu mapa" : "Encontre a primeira pista"} <ArrowRight size={12} />
              </p>
            </div>
            <span className="destination-number" aria-hidden="true">
              01
            </span>
          </Link>
          <div className="image-tag">
            <MapPinned size={15} /> Mapa de aventura
          </div>
        </div>
      </section>
    </main>
  );
}
