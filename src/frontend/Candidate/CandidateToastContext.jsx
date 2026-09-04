import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let idCounter = 0;

export function CandidateToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration = 3200) => {
      const id = ++idCounter;
      setToasts((cur) => [...cur, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="co-toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`co-toast co-toast-${toast.type}`} key={toast.id}>
            {toast.type === "success" && <CheckCircle2 size={17} />}
            {toast.type === "error" && <XCircle size={17} />}
            {toast.type === "info" && <Info size={17} />}
            <span>{toast.message}</span>
            <button className="co-toast-dismiss" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useCandidateToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useCandidateToast must be used inside CandidateToastProvider");
  return ctx;
}
