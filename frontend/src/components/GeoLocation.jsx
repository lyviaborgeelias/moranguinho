import { useState } from "react";
import { Compass } from "lucide-react";
export default function GeoLocation() {
  const [status, setStatus] = useState("");
  const [point, setPoint] = useState(null);
  const [busy, setBusy] = useState(false);
  function locate() {
    if (!navigator.geolocation) {
      setStatus("Geolocalização indisponível neste navegador.");
      return;
    }
    setBusy(true);
    setStatus("Solicitando localização…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPoint({
          latitude: coords.latitude.toFixed(4),
          longitude: coords.longitude.toFixed(4),
          accuracy: Math.round(coords.accuracy),
        });
        setStatus("Localização real identificada. Ela não altera sua posição no jardim virtual.");
        setBusy(false);
      },
      (error) => {
        setPoint(null);
        setStatus(
          error.code === 1
            ? "Permissão negada. A aventura continua normalmente."
            : "Não foi possível obter sua localização. Tente novamente.",
        );
        setBusy(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }
  return (
    <article className="paper-card geo-card">
      <Compass size={22} />
      <h2>Bússola do mundo real</h2>
      <p>
        Opcional: descubra suas coordenadas reais. A localização não é enviada ao servidor nem
        salva.
      </p>
      <button className="button button--outline" onClick={locate} disabled={busy}>
        {busy ? "Localizando…" : "Usar minha localização"}
      </button>
      {status && <p role="status">{status}</p>}
      {point && (
        <>
          <p>
            Latitude: {point.latitude} · Longitude: {point.longitude} · Precisão: {point.accuracy} m
          </p>
          <button
            className="text-action"
            onClick={() => {
              setPoint(null);
              setStatus("Localização removida.");
            }}
          >
            Limpar localização
          </button>
        </>
      )}
    </article>
  );
}
