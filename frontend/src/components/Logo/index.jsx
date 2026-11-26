const strawberrySrc = `${import.meta.env.BASE_URL}imagens/marca-moranguinho.png`;

export function StrawberryMark({ size, className }) {
  return <img src={strawberrySrc} className={className} width={size} height={size} alt="" />;
}

export default function Logo({ compact = false, light = false }) {
  return (
    <span
      className={`brand ${compact ? "brand--compact" : ""} ${light ? "brand--light" : ""}`}
    >
      <StrawberryMark size={compact ? 34 : 44} className="brand-mark" />
      <span className="brand-copy">
        <small>SEGREDOS DE</small>
        <strong>Moranguinho</strong>
      </span>
    </span>
  );
}
