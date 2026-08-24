import { ArrowRight, LockKeyhole, Map, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="page home">
      <header className="topbar">
        <Logo compact />
        <button className="text-button" onClick={() => navigate("/login")}>Já tenho uma conta <ArrowRight size={16} /></button>
      </header>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={15} /> Uma aventura espera por você</div>
        <h1>Os segredos de<br /><em>Tutti-Frutti</em><br />precisam de você!</h1>
        <p>Explore lugares encantados, resolva desafios e encontre os seis fragmentos perdidos antes que seja tarde.</p>
        <button className="primary-button" onClick={() => navigate("/login")}>Começar aventura <ArrowRight size={19} /></button>
        <div className="features">
          <span><Map size={18} /> 6 lugares</span>
          <span><Star size={18} /> Desafios e pistas</span>
          <span><LockKeyhole size={18} /> Um mistério final</span>
        </div>
      </section>

      <div className="story-card">
        <span className="story-card__icon"><Map size={22} /></span>
        <div><small>SUA MISSÃO</small><strong>Reconstrua o antigo registro</strong><p>Cada fase guarda um fragmento e uma nova pista.</p></div>
        <span className="progress-orbs"><i /><i /><i /><i /><i /><i /></span>
      </div>
    </main>
  );
}
