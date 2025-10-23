import { useCallback, useState } from "react";
import { createHistoryId } from "../utils/wizard";

const MAX_TOASTS = 5;

function useToasts(initialToasts = []) {
  const [toasts, setToasts] = useState(initialToasts);

  const pushToast = useCallback((toast) => {
    if (!toast?.message) {
      return "";
    }
    const id = toast.id || createHistoryId();
    setToasts((prev) => {
      const next = [
        ...prev.filter((item) => item.id !== id),
        {
          id,
          variant: toast.variant || "info",
          title: toast.title || "",
          message: toast.message,
          duration:
            typeof toast.duration === "number" ? toast.duration : 5000,
        },
      ];
      return next.slice(-MAX_TOASTS);
    });
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}

export default useToasts;
