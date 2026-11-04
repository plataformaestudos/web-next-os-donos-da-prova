import { Node } from "@tiptap/core";

function span(value: string | null): number {
  return Math.min(100, Math.max(1, Number.parseInt(value || "1", 10) || 1));
}

// The review editor and the published question editor use the same table schema.
// Text, merged cells and nested block content survive an edit/save round trip.
const Table = Node.create({
  name: "table",
  group: "block",
  content: "tableRow+",
  isolating: true,
  parseHTML: () => [{ tag: "table" }],
  renderHTML: () => ["table", ["tbody", 0]],
});

const Row = Node.create({
  name: "tableRow",
  content: "(tableCell | tableHeader)+",
  parseHTML: () => [{ tag: "tr" }],
  renderHTML: () => ["tr", 0],
});

function cell(name: string, tag: string) {
  return Node.create({
    name,
    content: "block+",
    isolating: true,
    addAttributes: () => ({
      colspan: { default: 1, parseHTML: (el) => span(el.getAttribute("colspan")) },
      rowspan: { default: 1, parseHTML: (el) => span(el.getAttribute("rowspan")) },
    }),
    parseHTML: () => [{ tag }],
    renderHTML: ({ HTMLAttributes }) => [tag, HTMLAttributes, 0],
  });
}

export const tableExtensions = [Table, Row, cell("tableCell", "td"), cell("tableHeader", "th")];
