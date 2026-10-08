import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Compass,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
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
          <a href="#historia">A história</a>
          <a href="#como-jogar">Como jogar</a>
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
            <span className="status-dot" /> A CURIOSIDADE TEM UM NOVO DESTINO
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
              {user ? "Continuar minha jornada" : "Começar minha aventura"}
              <ArrowRight size={18} />
            </Link>
            <a className="quiet-link" href="#como-jogar">
              Conhecer a jornada <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-details">
            <span>
              <MapPinned size={17} />
              <strong>6</strong> destinos
            </span>
            <i />
            <span>
              <PuzzleMark />
              <strong>6</strong> desafios
            </span>
            <i />
            <span>
              <Leaf size={17} /> infinitas descobertas
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
          <span className="image-coordinate">
            VALE DE TUTTI-FRUTTI
            <br />
            <small>O INÍCIO DE UMA GRANDE HISTÓRIA</small>
          </span>
          <div className="floating-destination">
            <span>
              <Compass size={26} />
            </span>
            <div>
              <small>SEU PRIMEIRO DESTINO</small>
              <strong>O portão do pomar</strong>
              <p>A primeira pista está esperando.</p>
            </div>
            <ArrowRight size={18} />
          </div>
          <div className="image-tag">
            <Sparkles size={15} /> Um mundo para descobrir
          </div>
        </div>
      </section>
      <div className="landing-divider container">
        <span>DESACELERE. OBSERVE. DESCUBRA.</span>
        <div />
        <Compass size={20} />
      </div>
      <section className="how-section container" id="como-jogar">
        <div className="section-intro">
          <div>
            <span className="eyebrow">SIMPLES DE COMEÇAR. DIFÍCIL DE ESQUECER.</span>
            <h2>
              O caminho é seu.
              <br />
              <em>A descoberta também.</em>
            </h2>
          </div>
          <p>
            Um mapa interativo, pequenas pistas e uma vontade enorme de descobrir o que vem depois.
          </p>
        </div>
        <div className="how-grid">
          {[
            [
              MapPinned,
              "01",
              "Encontre seu caminho",
              "Explore o mapa do vale. Cada lugar tem uma história e um desafio esperando por você.",
            ],
            [
              BookOpen,
              "02",
              "Dê vida às pistas",
              "Resolva enigmas, teste sua memória e use a lógica para encontrar os fragmentos perdidos.",
            ],
            [
              Trophy,
              "03",
              "Reconstrua o segredo",
              "Guarde suas descobertas no diário e reúna os seis fragmentos para revelar o coração do vale.",
            ],
          ].map(([Icon, number, title, text]) => (
            <article className="how-card" key={number}>
              <div className="how-card-top">
                <Icon size={26} strokeWidth={1.5} />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="story-section container" id="historia">
        <div className="story-illustration">
          <img
            src="/imagens/tutti-frutti-map.png"
            alt="Mapa aéreo dos seis destinos do vale"
            loading="lazy"
          />
          <span className="story-seal">
            <Compass size={32} />
            <small>
              EXPLORE
              <br />O EXTRAORDINÁRIO
            </small>
          </span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">UMA CARTA DO VALE</span>
          <h2>
            Algumas histórias
            <br />
            precisam de você
            <br />
            para <em>continuar.</em>
          </h2>
          <p>
            Há muito tempo, seis lugares guardavam a memória de Tutti-Frutti. Agora, seus fragmentos
            estão espalhados pelo vale. E existe um mapa que só revela seus caminhos a quem está
            disposto a olhar com atenção.
          </p>
          <p className="story-note">A próxima página ainda está em branco.</p>
          <Link className="button button--dark" to={destination}>
            Escrever minha história <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="landing-callout container">
        <span>
          <ShieldCheck size={18} /> Sua jornada fica salva na sua conta.
        </span>
        <Link to={destination}>
          O vale espera por você <ArrowRight size={17} />
        </Link>
      </section>
      <footer className="landing-footer container">
        <Logo compact />
        <p>Feito para quem nunca perdeu a curiosidade.</p>
        <small>© 2026 · Segredos de Tutti-Frutti</small>
      </footer>
    </main>
  );
}
function PuzzleMark() {
  return <Sparkles size={17} />;
}
