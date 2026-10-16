import { useState } from "react";

export function MazeGame({ activity, onAnswer }) {
  const [path, setPath] = useState([activity.start]);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState(
    "Pegue a chave e chegue ao envelope. Use as setas ou toque em uma casa vizinha.",
  );
  const size = activity.board.length;
  const current = path[path.length - 1];
  const hasKey = path.some(([r, c]) => activity.board[r][c] === "K");
  const won = activity.board[current[0]][current[1]] === "E" && hasKey;
  function move(r, c) {
    if (!lives || won || r < 0 || c < 0 || r >= size || c >= size) return;
    if (Math.abs(r - current[0]) + Math.abs(c - current[1]) !== 1) return;
    const tile = activity.board[r][c];
    if (tile === "#") {
      setMessage("Uma cerca bloqueia essa passagem. Procure outra rota.");
      return;
    }
    if (tile === "X") {
      setLives(lives - 1);
      setMessage(
        lives === 1
          ? "Os espinhos fecharam o caminho. Recomece a fase."
          : "Espinhos! Você perdeu um coração. Escolha outro caminho.",
      );
      return;
    }
    if (tile === "E" && !hasKey) {
      setMessage("O envelope está trancado. Encontre a chave primeiro!");
      return;
    }
    const next = [...path, [r, c]];
    setPath(next);
    setMessage(
      tile === "K"
        ? "Chave encontrada! Agora leve-a até o envelope."
        : tile === "E"
          ? "Envelope recuperado! Confirme a pista para continuar."
          : "Siga com cuidado: os espinhos tiram corações.",
    );
    onAnswer(tile === "E" ? next : "");
  }
  function restart() {
    setPath([activity.start]);
    setLives(3);
    onAnswer("");
    setMessage("Nova tentativa. Planeje uma rota até a chave.");
  }
  return (
    <section className="game-console" aria-label="Labirinto do jardim">
      <div className="game-hud">
        <span>♥ {lives}/3 corações</span>
        <span>{hasKey ? "🗝️ Chave coletada" : "🗝️ Encontre a chave"}</span>
      </div>
      <div
        className="garden-maze"
        style={{ "--columns": size }}
        tabIndex={0}
        aria-label="Labirinto: use as setas para mover"
        onKeyDown={(event) => {
          const direction = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
          }[event.key];
          if (direction) {
            event.preventDefault();
            move(current[0] + direction[0], current[1] + direction[1]);
          }
        }}
      >
        {activity.board.flatMap((row, r) =>
          [...row].map((tile, c) => {
            const player = current[0] === r && current[1] === c;
            return (
              <button
                type="button"
                key={`${r}-${c}`}
                className={`maze-tile ${tile === "#" ? "maze-wall" : tile === "X" ? "maze-danger" : ""} ${player ? "maze-player" : ""}`}
                aria-label={`Casa ${r + 1}, ${c + 1}: ${player ? "Moranguinho" : tile === "#" ? "cerca" : tile === "X" ? "espinhos" : tile === "K" ? "chave" : tile === "E" ? "envelope" : "caminho"}`}
                onClick={() => move(r, c)}
              >
                {player
                  ? "🍓"
                  : tile === "#"
                    ? "🌳"
                    : tile === "X"
                      ? "✹"
                      : tile === "K" && !hasKey
                        ? "🗝️"
                        : tile === "E"
                          ? "✉️"
                          : "·"}
              </button>
            );
          }),
        )}
      </div>
      <div className="maze-controls" aria-label="Controles de movimento">
        {[
          ["↑", -1, 0, "Mover para cima"],
          ["←", 0, -1, "Mover para a esquerda"],
          ["↓", 1, 0, "Mover para baixo"],
          ["→", 0, 1, "Mover para a direita"],
        ].map(([label, dr, dc, name]) => (
          <button
            type="button"
            key={name}
            aria-label={name}
            disabled={!lives || won}
            onClick={() => move(current[0] + dr, current[1] + dc)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="game-message" role="status">
        {message}
      </p>
      <button type="button" className="game-restart" onClick={restart}>
        ↻ Reiniciar labirinto
      </button>
    </section>
  );
}

export function DialGame({ activity, onAnswer }) {
  const alphabet = activity.kind === "cipher" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
  const [values, setValues] = useState(
    Array(activity.kind === "cipher" ? activity.cipher.length : 3).fill(0),
  );
  function rotate(index, direction) {
    const next = values.map((value, i) =>
      i === index ? (value + direction + alphabet.length) % alphabet.length : value,
    );
    setValues(next);
    onAnswer(next.map((value) => alphabet[value]).join(""));
  }
  return (
    <section className="game-console safe-console" aria-label="Discos do cofre">
      <div className="game-hud">
        <span>🔐 {activity.kind === "cipher" ? "COFRE FINAL" : "CADEADO DA DESPENSA"}</span>
        <span>{values.length} discos</span>
      </div>
      {activity.lock_clues && (
        <ul className="lock-clues">
          {activity.lock_clues.map((clue) => (
            <li key={clue}>{clue}</li>
          ))}
        </ul>
      )}
      <div className="safe-dials">
        {values.map((value, i) => (
          <div className="safe-dial" key={i}>
            <button
              type="button"
              onClick={() => rotate(i, 1)}
              aria-label={`Avançar disco ${i + 1}`}
            >
              ▲
            </button>
            <output aria-label={`Disco ${i + 1}`}>{alphabet[value]}</output>
            <button
              type="button"
              onClick={() => rotate(i, -1)}
              aria-label={`Voltar disco ${i + 1}`}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <p className="game-message">
        Gire os discos para montar {activity.kind === "cipher" ? "a palavra decifrada" : "o código"}
        . Depois confirme a pista.
      </p>
    </section>
  );
}

export function LightsGame({ activity, onAnswer }) {
  const [cells, setCells] = useState(activity.lights);
  const [moves, setMoves] = useState([]);
  const won = cells.every((value) => value === 0);
  const failed = !won && moves.length >= activity.move_limit;
  function press(index) {
    if (won || failed) return;
    const next = cells.map((value, i) =>
      Math.abs(Math.floor(i / 3) - Math.floor(index / 3)) + Math.abs((i % 3) - (index % 3)) <= 1
        ? 1 - value
        : value,
    );
    const nextMoves = [...moves, index];
    setCells(next);
    setMoves(nextMoves);
    onAnswer(next.every((value) => value === 0) ? nextMoves : "");
  }
  return (
    <section className="game-console" aria-label="Painel de lanternas">
      <div className="game-hud">
        <span>⚡ {cells.filter(Boolean).length} lanternas acesas</span>
        <span>
          {moves.length}/{activity.move_limit} movimentos
        </span>
      </div>
      <div className="lights-board">
        {cells.map((value, i) => (
          <button
            type="button"
            key={i}
            className={`light-switch ${value ? "is-on" : ""}`}
            aria-label={`Lanterna ${i + 1}: ${value ? "acesa" : "apagada"}`}
            aria-pressed={Boolean(value)}
            disabled={won || failed}
            onClick={() => press(i)}
          >
            {value ? "✦" : "○"}
          </button>
        ))}
      </div>
      <p className="game-message" role="status">
        {won
          ? "Passagem liberada! Todas as lanternas estão apagadas."
          : failed
            ? "O painel travou. Reinicie e tente uma estratégia diferente."
            : "Cada botão inverte sua lanterna e as vizinhas de cima, baixo e lados. Apague todas."}
      </p>
      <button
        type="button"
        className="game-restart"
        onClick={() => {
          setCells(activity.lights);
          setMoves([]);
          onAnswer("");
        }}
      >
        ↻ Reiniciar painel
      </button>
    </section>
  );
}
