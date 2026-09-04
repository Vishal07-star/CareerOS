import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export function Modal({ title, subtitle, onClose, children, width = 560, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="co-modal-backdrop" onClick={onClose}>
      <div className="co-modal-card" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="co-modal-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="co-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="co-modal-body">{children}</div>
        {footer && <div className="co-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="co-modal-backdrop" onClick={onClose}>
      <div className="co-drawer-card" onClick={(e) => e.stopPropagation()}>
        <div className="co-modal-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="co-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="co-drawer-body">{children}</div>
        {footer && <div className="co-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="co-modal-backdrop" onClick={onCancel}>
      <div className="co-modal-card co-confirm-dialog" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className={`co-confirm-icon co-confirm-${tone}`}>
          <AlertTriangle size={20} />
        </div>
        <h2>{title}</h2>
        {message && <p className="co-confirm-message">{message}</p>}
        <div className="co-modal-footer">
          <button className="outline-button" onClick={onCancel}>{cancelLabel}</button>
          <button className={tone === "danger" ? "co-danger-button" : "primary-button"} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
