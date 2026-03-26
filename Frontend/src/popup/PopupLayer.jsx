import React, { useEffect, useState } from "react";
import "./PopupLayer.css";

function PopupLayer() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onPopup = (e) => {
      const next = e?.detail || null;
      if (!next) return;
      setPopup(next);
      setVisible(true);
    };

    window.addEventListener("neuralfort:popup", onPopup);
    return () => window.removeEventListener("neuralfort:popup", onPopup);
  }, []);

  const close = () => {
    // Let CSS fade-out run before clearing.
    setVisible(false);
    setTimeout(() => setPopup(null), 220);
  };

  if (!popup) return null;

  return (
    <div
      className={`popupOverlay ${visible ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || "Popup"}
      onMouseDown={(e) => {
        // Click outside to dismiss.
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="popupCard" data-kind={popup.kind || "info"}>
        <div className="popupHeader">
          <div className="popupTitle">{popup.title || "NeuralFort"}</div>
          <button className="popupCloseBtn" type="button" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        {popup.message ? <div className="popupMessage">{popup.message}</div> : null}
        <div className="popupActions">
          <button className="popupOkBtn" type="button" onClick={close}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupLayer;

