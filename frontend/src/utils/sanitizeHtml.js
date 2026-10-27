// src/utils/sanitizeHtml.js
import DOMPurify from "dompurify";

export default function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "p",
      "ul",
      "ol",
      "li",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "hr",
      "a", // izinkan tag a
    ],
    ALLOWED_ATTR: ["alt", "title", "href", "target", "rel"], // izinkan atribut penting untuk <a>
    ALLOWED_URI_REGEXP: /^https?:\/\/[^\s<>"]+$/,
    FORBID_ATTR: ["style", "class", "id", "onclick", "onerror"],
    FORBID_TAGS: [
      "script",
      "object",
      "embed",
      "iframe",
      "form",
      "input",
      "img",
      // "a", // jangan blokir tag a
    ],
    KEEP_CONTENT: false,
    ALLOW_DATA_ATTR: false,
  });
}
