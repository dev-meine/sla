const ALLOWED_ELEMENTS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
]);

const DROP_SUBTREE_ELEMENTS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'template',
  'noscript',
  'form',
  'head',
  'meta',
  'link',
  'base',
]);

function stripAsciiControlAndWhitespace(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    if (code > 0x20) {
      out += input.charAt(i);
    }
  }
  return out;
}

/**
 * Validates that a URL strictly uses http: or https: protocol.
 * Blocks javascript:, data:, vbscript:, file:, and malformed schemes.
 */
export function isSafeHttpsUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return false;
  }
  const cleaned = stripAsciiControlAndWhitespace(rawUrl);
  if (!cleaned) {
    return false;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function sanitizeAnchorHref(rawHref: string | null): string | null {
  if (!rawHref) {
    return null;
  }
  const cleaned = stripAsciiControlAndWhitespace(rawHref);
  if (!cleaned) {
    return null;
  }
  try {
    const parsed = new URL(cleaned, window.location.origin);
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:'
    ) {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

function hardenAnchorsInSubtree(root: ParentNode): void {
  const anchors = root.querySelectorAll('a');
  anchors.forEach((anchor) => {
    const safeHref = sanitizeAnchorHref(anchor.getAttribute('href'));
    // Remove all attributes first to prevent DOM clobbering (id/name) or event handlers
    Array.from(anchor.attributes).forEach((attr) => {
      anchor.removeAttribute(attr.name);
    });
    if (safeHref) {
      anchor.setAttribute('href', safeHref);
      anchor.setAttribute('rel', 'noopener noreferrer');
      if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
        anchor.setAttribute('target', '_blank');
      }
    }
  });
}

function buildCleanNodes(sourceNode: Node, doc: Document): Node[] {
  if (sourceNode.nodeType === Node.TEXT_NODE) {
    return [doc.createTextNode(sourceNode.textContent ?? '')];
  }

  if (sourceNode.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const el = sourceNode as Element;
  const tag = el.tagName.toLowerCase();

  if (DROP_SUBTREE_ELEMENTS.has(tag)) {
    return [];
  }

  // Unwrap unknown formatting containers while keeping safe text/children
  if (!ALLOWED_ELEMENTS.has(tag)) {
    const unwrappedChildren: Node[] = [];
    el.childNodes.forEach((child) => {
      unwrappedChildren.push(...buildCleanNodes(child, doc));
    });
    return unwrappedChildren;
  }

  const cleanEl = doc.createElement(tag);

  if (tag === 'a') {
    const safeHref = sanitizeAnchorHref(el.getAttribute('href'));
    if (safeHref) {
      cleanEl.setAttribute('href', safeHref);
      cleanEl.setAttribute('rel', 'noopener noreferrer');
      if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
        cleanEl.setAttribute('target', '_blank');
      }
    }
  }

  if (tag !== 'br') {
    el.childNodes.forEach((child) => {
      const sanitizedChildren = buildCleanNodes(child, doc);
      sanitizedChildren.forEach((c) => cleanEl.appendChild(c));
    });
  }

  return [cleanEl];
}

type ElementWithSetHTML = HTMLElement & {
  setHTML?: (
    input: string,
    options?: {
      sanitizer?: {
        elements?: string[];
        attributes?: string[];
      };
    }
  ) => void;
};

/**
 * Safely renders untrusted rich article HTML directly into a DOM container
 * without re-serializing strings into `innerHTML` (preventing mutation XSS).
 */
export function setSanitizedHtml(container: HTMLElement, rawHtml: string): void {
  if (!rawHtml) {
    container.replaceChildren();
    return;
  }

  const candidate = container as ElementWithSetHTML;
  if ('setHTML' in Element.prototype && typeof candidate.setHTML === 'function') {
    try {
      candidate.setHTML(rawHtml, {
        sanitizer: {
          elements: Array.from(ALLOWED_ELEMENTS),
          attributes: ['href'],
        },
      });
      hardenAnchorsInSubtree(container);
      return;
    } catch {
      // Fall through to strict DOMParser node builder if Sanitizer options differ
    }
  }

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(rawHtml, 'text/html');
  const cleanNodes: Node[] = [];
  parsedDoc.body.childNodes.forEach((node) => {
    cleanNodes.push(...buildCleanNodes(node, document));
  });
  container.replaceChildren(...cleanNodes);
}
