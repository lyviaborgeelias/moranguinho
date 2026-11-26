import { useState } from "react";
import { ArrowRight, BookOpen, HelpCircle, Play, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Logo, { StrawberryMark } from "../components/Logo";
import { Fireflies, FullscreenButton, GameGuide } from "../components/GameChrome";
import "../styles/Home.css";

export default function Home() {
  const [guide, setGuide] = useState(false);
  return (
    <main className="landing">
      <div className="landing-visual" aria-hidden="true">
        <img src="/imagens/tutti-frutti-landscape.png" alt="" fetchPriority="high" />
        <div className="visual-vignette" />
      </div>
      <Fireflies />
      <header className="landing-header">
        <Logo light />
        <div className="game-tools">
          <button
            className="game-tool"
            aria-label="Como jogar"
            title="Como jogar"
            onClick={() => setGuide(true)}
          >
            <HelpCircle size={21} />
          </button>
          <FullscreenButton />
        </div>
      </header>
      <section className="landing-copy">
        <span className="title-ribbon">
          <Sparkles size={15} /> UMA AVENTURA DA MORANGUINHO <Sparkles size={15} />
        </span>
        <h1>
          Um segredo<span>no jardim.</span>
        </h1>
        <div className="title-flourish" aria-hidden="true">
          ✦ <i /> <StrawberryMark size={22} /> <i /> ✦
        </div>
        <p>
          O livro de receitas sumiu!
          <br />
          Uma trilha de pistas espera por você.
        </p>
        <div className="landing-actions">
          <Link className="button button--primary title-play" to="/aventura">
            <Play size={21} fill="currentColor" /> Começar investigação <ArrowRight size={20} />
          </Link>
          <button className="title-help" onClick={() => setGuide(true)}>
            <BookOpen size={17} /> Como jogar
          </button>
        </div>
        <span className="title-save">
          <span className="status-dot" /> Seu progresso é salvo automaticamente
        </span>
      </section>
      <Link className="floating-destination" to="/aventura">
        <span className="letter-pin" aria-hidden="true">
          ✦
        </span>
        <span className="eyebrow">MISSÃO 01</span>
        <strong>Você encontrou um bilhete!</strong>
        <p>Laranjinha achou um bilhete no jardim do café.</p>
        <span className="letter-action">
          Abrir a primeira pista <ArrowRight size={15} />
        </span>
      </Link>
      <footer className="landing-footer">
        <span>
          <Sparkles size={16} /> 6 fases para explorar
        </span>
        <i />
        <span>
          <Trophy size={16} /> Um mistério para resolver
        </span>
        <span className="landing-footer-note">A curiosidade é o seu superpoder.</span>
      </footer>
      {guide && <GameGuide onClose={() => setGuide(false)} />}
    </main>
  );
}
