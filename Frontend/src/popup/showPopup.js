export function showPopup({ title, message, kind } = {}) {
  // Centralized popup dispatcher to avoid using `window.alert`.
  // eslint-disable-next-line no-restricted-globals
  window.dispatchEvent(
    new CustomEvent("neuralfort:popup", {
      detail: {
        title: title || "NeuralFort",
        message: message || "",
        kind: kind || "info",
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
    })
  );
}

