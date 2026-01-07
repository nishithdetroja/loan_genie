const params = new URLSearchParams(window.location.search);
const event = params.get("event") || "unknown";
const envelopeId = params.get("envelopeId") || params.get("EnvelopeId");

// Post message to parent window
window.parent.postMessage(
  { type: "DOCUSIGN_RETURN", event, envelopeId },
  window.location.origin
);
