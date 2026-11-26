import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Compass, Maximize, Minimize, Sparkles } from "lucide-react";
import Modal from "./Modal";

export function FullscreenButton() {
  const [active, setActive] = useState(Boolean(document.fullscreenElement));
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  if (!document.fullscreenEnabled) return null;
  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setNotice("");
    } catch {
      setNotice("O navegador não permitiu abrir a tela cheia.");
    }
  }
  return (
    <>
      <button
        className="game-tool"
        onClick={toggle}
        aria-label={active ? "Sair da tela cheia" : "Tela cheia"}
        title={active ? "Sair da tela cheia" : "Tela cheia"}
      >
        {active ? <Minimize size={19} /> : <Maximize size={19} />}
      </button>
      {notice && (
        <span className="fullscreen-notice" role="status">
          {notice}
        </span>
      )}
    </>
  );
}

export function Fireflies() {
  return (
    <div className="fireflies" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} style={{ "--i": i }} />
      ))}
    </div>
  );
}

export function GameGuide({ onClose }) {
  return (
    <Modal title="Como explorar o jardim" onClose={onClose}>
      <span className="eyebrow">MANUAL DO AVENTUREIRO</span>
      <h2>Todo mistério começa com uma pista.</h2>
      <p className="modal-lead">
        O livro de receitas sumiu! Explore o jardim e descubra o que as amigas estão escondendo.
      </p>
      <ol className="guide-list">
        <li>
          <Compass size={25} />
          <div>
            <strong>Caminhe pelo jardim</strong>
            <p>
              Use WASD ou as setas no teclado. Segure Shift para correr e arraste o cenário para
              olhar ao redor. No celular, use o joystick.
            </p>
          </div>
        </li>
        <li>
          <Sparkles size={25} />
          <div>
            <strong>Encontre suas amigas</strong>
            <p>
              Pressione E ou toque em “Conversar” perto de uma amiga. Pergunte sobre o bilhete, peça
              uma dica ou aceite a missão. “Mostrar caminho” apenas indica a trilha no chão. Você
              controla todos os movimentos.
            </p>
          </div>
        </li>
        <li>
          <BookOpen size={25} />
          <div>
            <strong>Complete sua coleção</strong>
            <p>
              Cada missão rende um tesouro, uma palavra e 100 XP. Reorganize as pistas no diário com
              arraste ou teclado. Resolva o enigma final para liberar a festa e o certificado.
            </p>
          </div>
        </li>
      </ol>
      <button className="button button--primary button--full" onClick={onClose}>
        Vamos explorar! <ArrowRight size={18} />
      </button>
    </Modal>
  );
}
