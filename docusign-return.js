/* docusign-return.js
 * Secure DocuSign return handler
 * - No postMessage("*")
 * - Restricted admin origins
 * - Supports iframe + popup
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
  // Allowed admin origins
  // (add PROD / PTE as needed)
  // ----------------------------
  const ALLOWED_ADMIN_ORIGINS = [
    "https://dev-admin.uatdev.altaone.com",
    "https://admin.altaone.com"
  ];

  // ----------------------------
  // Detect parent origin safely
  // ----------------------------
  let targetOrigin = null;

  if (document.referrer) {
    try {
      const referrerOrigin = new URL(document.referrer).origin;
      if (ALLOWED_ADMIN_ORIGINS.includes(referrerOrigin)) {
        targetOrigin = referrerOrigin;
      }
    } catch (e) {
      // ignore invalid referrer
    }
  }

  // ----------------------------
  // Message payload
  // ----------------------------
  const message = {
    type: "DOCUSIGN_RETURN",
    event,
    envelopeId
  };

  // ----------------------------
  // Send message
  // ----------------------------
  try {
    if (window.opener && targetOrigin) {
      // DocuSign opened in popup
      window.opener.postMessage(message, targetOrigin);
      window.close();
      return;
    }

    if (window.parent && window.parent !== window && targetOrigin) {
      // Embedded iframe
      window.parent.postMessage(message, targetOrigin);
      return;
    }
  } catch (err) {
    // fall through to redirect
  }

  // ----------------------------
  // Fallback: redirect back to SPA
  // ----------------------------
  const fallbackUrl =
    "/settings/docusign" +
    `?event=${encodeURIComponent(event)}` +
    `&envelopeId=${encodeURIComponent(envelopeId)}`;

  window.location.replace(fallbackUrl);
})();

