import { useState } from "react";
import { ArrowRight, BookOpen, Download, Heart, Sparkles, Trophy } from "lucide-react";
import { FRIENDS } from "../game/world";
import { FriendPortrait } from "./Exploration";
import Logo from "./Logo";
import Modal from "./Modal";

const confetti = Array.from({ length: 24 }, (_, index) => ({
  x: (index * 37 + 11) % 100,
  dx: ((index * 17) % 133) - 66,
  delay: ((index * 13) % 17) / 50,
  color: ["#e5789e", "#f4c46c", "#aebd7d", "#c39bcd"][index % 4],
}));

export function Finale({ journey, onCertificate, onClose }) {
  const [bookOpen, setBookOpen] = useState(false);
  return (
    <Modal title="Festa das amigas" className="modal--finale" wide onClose={onClose}>
      <div className="festival-hero">
        <div className="festival-bunting" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <span className="festival-medal">
          <Trophy size={29} />
        </span>
        <p className="eyebrow">GUARDIÃO DO JARDIM</p>
        <h2>A Festa das Amigas</h2>
        <p>As seis pistas trouxeram você até a clareira. A surpresa está pronta!</p>
      </div>
      <div className="festival-content">
        <ul className="festival-friends" aria-label="Amigas reunidas">
          {FRIENDS.map((friend) => (
            <li key={friend.id} style={{ "--friend-color": friend.color }}>
              <FriendPortrait friend={friend} />
              <span>{friend.name}</span>
            </li>
          ))}
        </ul>
        <div className="festival-stamps" aria-label="Palavras encontradas">
          {journey.fragments.map((fragment) => (
            <span key={fragment}>{fragment}</span>
          ))}
        </div>
        <div className={`festival-book ${bookOpen ? "is-open" : ""}`}>
          {!bookOpen ? (
            <>
              <BookOpen size={26} aria-hidden="true" />
              <div>
                <strong>O livro de receitas</strong>
                <p>As amigas deixaram uma mensagem para você.</p>
              </div>
              <button className="button button--primary" onClick={() => setBookOpen(true)}>
                Abrir o livro <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="festival-message" role="status">
              <Heart size={20} fill="currentColor" aria-hidden="true" />
              <div>
                <strong>A receita da amizade</strong>
                <p>
                  As amigas esconderam o livro para preparar a festa surpresa. Na última página,
                  elas anotaram a receita de hoje: morango, alegria e carinho. O ingrediente que
                  nunca pode faltar é dividir tudo com os amigos.
                </p>
                <small>Com carinho, suas amigas de Tutti-Frutti.</small>
              </div>
            </div>
          )}
        </div>
        <footer className="festival-actions">
          <span>
            <Sparkles size={16} /> {journey.xp} XP · {journey.completed.length} encontros
          </span>
          <button className="button button--dark" onClick={onCertificate}>
            Ver certificado <Download size={17} />
          </button>
        </footer>
      </div>
      {bookOpen && (
        <div className="festival-confetti" aria-hidden="true">
          {confetti.map(({ x, dx, delay, color }, index) => (
            <i
              key={index}
              style={{
                "--x": `${x}%`,
                "--dx": `${dx}px`,
                "--delay": `${delay}s`,
                background: color,
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

export function Certificate({ name, journey, onClose, onFinale }) {
  return (
    <Modal title="Certificado da aventura" className="modal--diploma" wide onClose={onClose}>
      <article className="certificate">
        <Logo compact />
        <span className="certificate-stars" aria-hidden="true">
          ✦ ✧ ✦
        </span>
        <p className="eyebrow">CERTIFICADO DE CONCLUSÃO</p>
        <h2>Guardião do Jardim</h2>
        <p>Concedido a</p>
        <strong>{name}</strong>
        <p>
          Por reunir as seis amigas, encontrar o livro de receitas e celebrar a amizade em
          Tutti-Frutti.
        </p>
        <div className="certificate-seal">
          <Trophy size={28} />
          <span>
            {journey.completed.length} ENCONTROS · {journey.xp} XP
          </span>
        </div>
        {journey.finished_at && (
          <time dateTime={journey.finished_at}>
            {new Date(journey.finished_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        )}
        <span className="certificate-motto">A amizade faz tudo florescer.</span>
      </article>
      <div className="certificate-actions">
        <button className="button button--outline" onClick={onFinale}>
          Voltar à festa
        </button>
        <button className="button button--dark" onClick={() => window.print()}>
          Imprimir ou salvar em PDF <Download size={17} />
        </button>
      </div>
    </Modal>
  );
}
