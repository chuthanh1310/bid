import React, { useEffect } from "react";
import "./Toast.css";

function Toast({ message, duration = 3000, onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return <div className="custom-toast">{message}</div>;
}

export default Toast;