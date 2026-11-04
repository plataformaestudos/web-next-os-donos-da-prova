import { importImageSize } from "./import-image-size";

const tags = new Set("p br strong b em i u s sup sub blockquote pre code ul ol li hr table thead tbody tfoot tr th td a span".split(" "));

/** Resolve only authorized import images, then let the platform editor render the HTML. */
export function prepareImportContent(html: string, imageUrls: Record<string, string>): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  const output = document.createElement("div");
  function copy(node: ChildNode, parent: Element) {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ""));
      return;
    }
    if (!(node instanceof Element)) return;
    const tag = node.tagName.toLowerCase();
    if (["script", "style", "iframe", "object", "svg"].includes(tag)) return;
    if (tag === "img") {
      const reference = node.getAttribute("src") || "";
      const url = /^import-image:\/\/[0-9a-f]{64}$/.test(reference) ? imageUrls[reference] : undefined;
      if (!url || !/^https?:\/\//i.test(url)) {
        parent.appendChild(document.createTextNode("[Imagem indisponível]"));
        return;
      }
      const image = document.createElement("img");
      image.src = url;
      image.alt = node.getAttribute("alt") || "Imagem da questão";
      image.referrerPolicy = "no-referrer";
      Object.assign(image.style, importImageSize(node.getAttribute("style")));
      parent.appendChild(image);
      return;
    }
    if (!tags.has(tag)) {
      Array.from(node.childNodes).forEach(child => copy(child, parent));
      return;
    }
    const element = document.createElement(tag);
    if (tag === "td" || tag === "th") {
      for (const attr of ["colspan", "rowspan"]) element.setAttribute(attr, String(Math.min(100, Math.max(1, Number.parseInt(node.getAttribute(attr) || "1", 10) || 1))));
    }
    if (tag === "ol") element.setAttribute("start", String(Number(node.getAttribute("start")) || 1));
    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      if (/^(https?:\/\/|mailto:)/i.test(href)) element.setAttribute("href", href);
      element.setAttribute("rel", "noopener noreferrer");
    }
    if ((tag === "p" || tag === "span") && node instanceof HTMLElement && /^(left|right|center|justify)$/.test(node.style.textAlign)) element.style.textAlign = node.style.textAlign;
    Array.from(node.childNodes).forEach(child => copy(child, element));
    parent.appendChild(element);
  }
  Array.from(document.body.childNodes).forEach(node => copy(node, output));
  return output.innerHTML;
}
