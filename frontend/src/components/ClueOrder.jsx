import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { orderedClues, reorder } from "../services/progress";

// Native drag and drop + buttons usable by keyboard, touch and assistive technology.
export default function ClueOrder({ activities, order, onOrder, disabled = false, hints = [] }) {
  const clues = orderedClues(activities, order);
  const instructionsId = useId();
  const [message, setMessage] = useState("");
  const [grabbed, setGrabbed] = useState(null);
  const dragId = useRef(null);
  function move(source, target) {
    if (disabled || source === target) return;
    const ids = clues.map((clue) => clue.id);
    const next = reorder(ids, source, target);
    onOrder(next);
    setMessage(
      `${clues.find((clue) => clue.id === source)?.fragment} movida para a posição ${next.indexOf(source) + 1} de ${next.length}.`,
    );
  }
  return (
    <section className="clue-order" aria-label="Organização das pistas">
      <p id={instructionsId}>
        Arraste as pistas ou use os botões Subir e Descer. Pelo teclado, use Tab e Enter ou Espaço;
        nos cartões, Alt + seta também reorganiza.
      </p>
      {clues.length === 0 && <p>Nenhuma pista completa ainda. Conclua o primeiro encontro.</p>}
      <ol aria-describedby={instructionsId}>
        {clues.map((clue, index) => (
          <li
            key={clue.id}
            className={`clue-sort-card ${grabbed === clue.id ? "is-grabbed" : ""}`}
            draggable={!disabled}
            onKeyDown={(event) => {
              if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
              event.preventDefault();
              const target = clues[index + (event.key === "ArrowUp" ? -1 : 1)];
              if (target) move(clue.id, target.id);
            }}
            onDragStart={(event) => {
              dragId.current = clue.id;
              event.dataTransfer.setData("text/plain", String(clue.id));
              event.dataTransfer.effectAllowed = "move";
              setGrabbed(clue.id);
            }}
            onDragEnd={() => {
              dragId.current = null;
              setGrabbed(null);
            }}
            onDragOver={(event) => {
              if (!disabled) {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const source = dragId.current;
              if (source != null) move(source, clue.id);
              dragId.current = null;
              setGrabbed(null);
            }}
          >
            <div className="clue-sort-label">
              <span aria-hidden="true" className="clue-grip">
                <GripVertical size={17} />
              </span>
              <span>
                <small>
                  Posição {index + 1}
                  {hints[index] ? ` · ${hints[index]}` : ""}
                </small>
                <strong>{clue.fragment}</strong>
                <small>{clue.treasure}</small>
              </span>
            </div>
            <div className="clue-sort-actions" role="group" aria-label={`Mover ${clue.fragment}`}>
              <button
                type="button"
                className="button button--outline button--small"
                aria-label={`Subir ${clue.fragment}`}
                aria-disabled={disabled || index === 0}
                onClick={() => {
                  if (index > 0) move(clue.id, clues[index - 1].id);
                }}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="button button--outline button--small"
                aria-label={`Descer ${clue.fragment}`}
                aria-disabled={disabled || index === clues.length - 1}
                onClick={() => {
                  if (index < clues.length - 1) move(clue.id, clues[index + 1].id);
                }}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <p className="clue-announcement" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
