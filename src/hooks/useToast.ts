import { useState, useCallback, useRef } from "react";

export interface ToastNotice {
  message: string;
  visible: boolean;
}

export function useToast() {
  const [toastNotice, setToastNotice] = useState<ToastNotice>({
    message: "",
    visible: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, durationMs = 3500) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToastNotice({
      message,
      visible: true,
    });

    timerRef.current = setTimeout(() => {
      setToastNotice((prev) => ({ ...prev, visible: false }));
      timerRef.current = null;
    }, durationMs);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToastNotice((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toastNotice,
    showToast,
    hideToast,
  };
}
