const BUTTON_ID = "cgpt-pdf-export-button";
const TOAST_ID = "cgpt-pdf-toast";

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.className = "cgpt-pdf-export-button";
  button.type = "button";
  button.title = "Export this ChatGPT conversation as a PDF";
  button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M14 2v5h5M9 15h6M9 18h4M9 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
    <span>Export PDF</span>
  `;
  button.addEventListener("click", exportConversationToPdf);
  document.body.appendChild(button);
}

function showToast(message) {
  document.getElementById(TOAST_ID)?.remove();

  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.className = "cgpt-pdf-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => toast.remove(), 4500);
}

function exportConversationToPdf() {
  const messages = collectConversationMessages();

  if (!messages.length) {
    showToast("I couldn't find any conversation messages on this page yet.");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Please allow popups for ChatGPT so the PDF preview can open.");
    return;
  }

  const title = document.title.replace(/\s*\|\s*ChatGPT\s*$/i, "") || "ChatGPT Conversation";
  const exportedAt = new Date().toLocaleString();

  printWindow.document.open();
  printWindow.document.write(buildPrintDocument({ title, exportedAt, messages }));
  printWindow.document.close();

  printWindow.addEventListener("load", () => {
    printWindow.focus();
    printWindow.setTimeout(() => printWindow.print(), 250);
  });
}

function collectConversationMessages() {
  const messageNodes = Array.from(document.querySelectorAll("[data-message-author-role]"));

  if (messageNodes.length > 0) {
    return messageNodes
      .map((node) => {
        const role = node.getAttribute("data-message-author-role") || "message";
        const content = node.querySelector(".markdown") || node;
        return {
          role: normalizeRole(role),
          html: sanitizeClone(content)
        };
      })
      .filter((message) => hasMeaningfulContent(message.html));
  }

  const fallbackNodes = Array.from(document.querySelectorAll("main article"));
  return fallbackNodes
    .map((node, index) => ({
      role: index % 2 === 0 ? "User" : "ChatGPT",
      html: sanitizeClone(node)
    }))
    .filter((message) => hasMeaningfulContent(message.html));
}

function normalizeRole(role) {
  const lower = role.toLowerCase();
  if (lower === "assistant") return "ChatGPT";
  if (lower === "user") return "You";
  if (lower === "system") return "System";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function sanitizeClone(sourceNode) {
  const clone = sourceNode.cloneNode(true);

  clone.querySelectorAll([
    "button",
    "form",
    "nav",
    "menu",
    "svg",
    "[role='button']",
    "[aria-hidden='true']",
    "[data-testid*='copy']",
    "[data-testid*='feedback']"
  ].join(",")).forEach((node) => node.remove());

  clone.querySelectorAll("a[href]").forEach((link) => {
    link.href = new URL(link.getAttribute("href"), window.location.href).href;
  });

  clone.querySelectorAll("img[src]").forEach((image) => {
    image.src = new URL(image.getAttribute("src"), window.location.href).href;
  });

  return clone.innerHTML.trim();
}

function hasMeaningfulContent(html) {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0 || /<img\b/i.test(html);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function buildPrintDocument({ title, exportedAt, messages }) {
  const messageHtml = messages.map((message) => `
    <section class="message">
      <h2>${escapeHtml(message.role)}</h2>
      <div class="content">${message.html}</div>
    </section>
  `).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - PDF Export</title>
  <style>
    @page {
      margin: 18mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #111827;
      background: #ffffff;
      font: 15px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    header {
      padding-bottom: 18px;
      border-bottom: 1px solid #d1d5db;
      margin-bottom: 22px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 26px;
      line-height: 1.2;
    }

    .meta {
      color: #4b5563;
      font-size: 12px;
    }

    .message {
      break-inside: avoid;
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .message h2 {
      margin: 0 0 8px;
      color: #0f766e;
      font-size: 13px;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .content > :first-child {
      margin-top: 0;
    }

    .content > :last-child {
      margin-bottom: 0;
    }

    p, ul, ol, blockquote, pre, table {
      margin: 0 0 12px;
    }

    ul, ol {
      padding-left: 22px;
    }

    pre {
      overflow-wrap: anywhere;
      white-space: pre-wrap;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      font-size: 12px;
    }

    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
    }

    blockquote {
      padding-left: 12px;
      border-left: 3px solid #9ca3af;
      color: #374151;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th, td {
      padding: 7px;
      border: 1px solid #d1d5db;
      vertical-align: top;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    a {
      color: #0f766e;
      overflow-wrap: anywhere;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Exported from ${escapeHtml(window.location.href)} on ${escapeHtml(exportedAt)}</div>
  </header>
  <main>${messageHtml}</main>
</body>
</html>`;
}

injectButton();

const observer = new MutationObserver(injectButton);
observer.observe(document.documentElement, { childList: true, subtree: true });
