import { Leaf } from "lucide-react";

export default function Logo({ compact = false, light = false }) {
  return (
    <span
      className={`brand ${compact ? "brand--compact" : ""} ${light ? "brand--light" : ""}`}
      aria-label="Segredos de Tutti-Frutti"
    >
      <span className="brand-mark" aria-hidden="true">
        <Leaf size={18} />
        <i />
        <i />
        <i />
      </span>
      <span className="brand-copy">
        <small>SEGREDOS DE</small>
        <strong>
          Tutti-Frutti<span>®</span>
        </strong>
      </span>
    </span>
  );
}
