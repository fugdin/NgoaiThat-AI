import { useEffect } from "react";

function ToastItem({ id, message, title, variant = "info", duration = 5000, onDismiss }) {
  useEffect(() => {
    if (!duration) return undefined;
    const timer = window.setTimeout(() => onDismiss(id), duration);
    return () => window.clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const icon = variant === "error" ? "⚠️" : variant === "success" ? "✅" : "ℹ️";

  return (
    <div className={`toast toast--${variant}`} role={variant === "error" ? "alert" : "status"}>
      <div className="toast__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="toast__content">
        {title ? <p className="toast__title">{title}</p> : null}
        <p className="toast__message">{message}</p>
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  );
}

function ToastList({ toasts, onDismiss }) {
  if (!Array.isArray(toasts) || toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Thông báo hệ thống">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastList;
