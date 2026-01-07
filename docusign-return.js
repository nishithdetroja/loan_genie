/* docusign-return.js
 * Secure DocuSign return handler (Q2)
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
  // Parent origin handshake
  // ----------------------------
  let parentOrigin = null;

  window.addEventListener("message", (e) => {
    debugger;
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
      debugger;
      // Popup
      if (window.opener) {
        window.opener.postMessage(message, parentOrigin);
        window.close();
        return;
      }

      // Iframe
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, parentOrigin);
      }
    } catch (e) {
      // intentionally silent
    }
  }

  // Optional safety log (can remove in prod)
  setTimeout(() => {
    if (!parentOrigin) {
      console.warn("Parent origin handshake not received");
    }
  }, 3000);
})();
