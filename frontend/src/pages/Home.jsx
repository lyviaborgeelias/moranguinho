import { ArrowRight, Compass, Flag, Gamepad2, MapPinned, Play, Puzzle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/Home.css";

export default function Home() {
  const destination = "/aventura";
  return (
    <main className="landing">
      <header className="landing-header container">
        <Link to="/" aria-label="Início">
          <Logo />
        </Link>
        <nav aria-label="Navegação principal">
          <span className="landing-game-label">
            <Gamepad2 size={17} aria-hidden="true" /> Um mistério. Seis obstáculos.
          </span>
          <Link className="button button--small button--dark" to="/aventura">
            Jogar agora <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <section className="landing-hero container">
        <div className="landing-copy">
          <span className="eyebrow">
            <span className="status-dot" /> SUA PRÓXIMA AVENTURA COMEÇA AQUI
          </span>
          <h1>
            Um segredo
            <br />
            foi deixado no <em>jardim.</em>
          </h1>
          <p>
            O livro de receitas sumiu! Guie a Moranguinho por labirintos, decifre cadeados e vença
            seis desafios para descobrir o segredo das amigas.
          </p>
          <div className="landing-actions">
            <Link className="button button--primary" to={destination}>
              <span className="landing-play" aria-hidden="true">
                <Play size={11} fill="currentColor" strokeWidth={0} />
              </span>
              Começar investigação
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
            alt="Jardim da Moranguinho ao pôr do sol, com casas de morango e trilhas entre jardins"
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
            JARDIM DA MORANGUINHO
            <br />
            <small>O INÍCIO DE UMA GRANDE HISTÓRIA</small>
          </span>
          <Link className="floating-destination" to={destination}>
            <span aria-hidden="true">
              <Compass size={26} />
            </span>
            <div>
              <small>MISSÃO 01 · ESTRATÉGIA</small>
              <strong>O labirinto de espinhos</strong>
              <p>
                Encontre a primeira pista <ArrowRight size={12} />
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
