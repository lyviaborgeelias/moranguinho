import { useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose, wide = false }) {
  const dialog = useRef(null);
  useLayoutEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? "modal--wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
      aria-label={title}
    >
      <button className="icon-button modal-close" aria-label="Fechar" onClick={onClose}>
        <X size={19} />
      </button>
      {children}
    </dialog>
  );
}
