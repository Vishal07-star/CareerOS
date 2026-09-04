import { useEffect, useId } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card confirm-dialog"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={`confirm-icon confirm-icon-${tone}`}>
          <AlertTriangle size={20} />
        </div>

        <h2 id={titleId}>{title}</h2>
        {message && <p className="confirm-message">{message}</p>}

        <div className="modal-actions">
          <button className="secondary-button" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button
            className={tone === "danger" ? "danger-button" : "primary-button"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
