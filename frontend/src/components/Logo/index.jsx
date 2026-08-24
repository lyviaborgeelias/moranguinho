export default function Logo({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Segredos de Tutti-Frutti">
      <span className="berry" aria-hidden="true"><i /><b>• •</b></span>
      <span className="brand__copy">
        <small>UMA AVENTURA EM</small>
        <strong>Segredos de<br />Tutti-Frutti</strong>
      </span>
    </div>
  );
}
