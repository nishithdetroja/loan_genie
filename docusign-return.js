/* docusign-return.js
 * Secure DocuSign return handler with origin handshake
 */

(function () {
  // ----------------------------
  // Read query parameters
  // ----------------------------
  const params = new URLSearchParams(window.location.search);
  const event = params.get("event") || "unknown";
  const envelopeId =
    params.get("envelopeId") || params.get("EnvelopeId") || "";

  // ----------------------------
  // Store parent origin (handshake)
  // ----------------------------
  let parentOrigin = null;

  window.addEventListener("message", (e) => {
    // Accept origin only once
    if (e.data?.type === "PARENT_ORIGIN" && !parentOrigin) {
      parentOrigin = e.origin;
      sendResult();
    }
  });

  function sendResult() {
    if (!parentOrigin) return;

    const message = {
      type: "DOCUSIGN_RETURN",
      event,
      envelopeId
    };

    try {
      // Popup case
      if (window.opener) {
        window.opener.postMessage(message, parentOrigin);
        window.close();
        return;
      }

      // Iframe case
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, parentOrigin);
        return;
      }
    } catch (e) {
      // ignore
    }

    // Fallback: redirect into SPA
    window.location.replace(
      `/settings/docusign?event=${encodeURIComponent(event)}&envelopeId=${encodeURIComponent(envelopeId)}`
    );
  }

  // Safety timeout (in case parent never sends handshake)
  setTimeout(() => {
    if (!parentOrigin) {
      console.warn("Parent origin not received");
    }
  }, 3000);
})();
