import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import Modal from "./Modal";
import ClueOrder from "./ClueOrder";
import api, { errorMessage } from "../services/api";
import { orderedClues } from "../services/progress";

const hints = [
  "Atenção para proteger alguém",
  "Afeto em gestos",
  "Vínculo que une as amigas",
  "Pessoas que compartilham a jornada",
  "Fruta da receita",
  "Sentimento de felicidade",
];
export default function FinalRiddle({ journey, order, onOrder, onSolved, onClose, online }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function validate(event) {
    event.preventDefault();
    if (busy || !online) return;
    setBusy(true);
    setNotice("");
    try {
      const { data } = await api.post("/journey/final/", {
        order: orderedClues(journey.activities, order).map((clue) => clue.id),
      });
      if (data.correct) onSolved(data.journey);
      else
        setNotice(
          "Ainda não é a sequência do livro. Leia as definições e reorganize as pistas para tentar novamente.",
        );
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Enigma final" wide className="modal--finale" onClose={onClose}>
      <div className="festival-hero">
        <span className="festival-medal">
          <BookOpen size={29} />
        </span>
        <p className="eyebrow">ÚLTIMO DESAFIO</p>
        <h2>O segredo do livro de receitas</h2>
        <p>
          As seis palavras revelam a receita da amizade. Organize cada pista ao lado de sua
          definição.
        </p>
      </div>
      <form className="final-riddle-form" onSubmit={validate}>
        <ClueOrder
          activities={journey.activities}
          order={order}
          onOrder={onOrder}
          disabled={busy}
          hints={hints}
        />
        {!online && (
          <p role="status">
            Você está offline. A ordem fica salva; conecte-se para validar a solução.
          </p>
        )}
        {notice && (
          <p className="notice notice--error" role="alert">
            {notice}
          </p>
        )}
        <button className="button button--primary" disabled={busy || !online}>
          {busy ? "Validando…" : "Validar solução"} <Sparkles size={17} />
        </button>
      </form>
    </Modal>
  );
}
