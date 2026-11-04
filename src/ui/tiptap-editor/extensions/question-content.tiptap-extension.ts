import { Extension, Mark, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import ListKeymap from "@tiptap/extension-list-keymap";
import ImageResize from "tiptap-extension-resize-image";
import { Mathematics } from "@tiptap-pro/extension-mathematics";
import { FontSize } from "./font-size.tiptap-extension";
import { tableExtensions } from "./table.tiptap-extension";

function script(name: string, tag: string) {
  return Mark.create({ name, parseHTML: () => [{ tag }], renderHTML: () => [tag, 0] });
}

const link = Mark.create({
  name: "questionLink",
  inclusive: false,
  addAttributes: () => ({
    href: {
      default: null,
      parseHTML: (element) => /^(https?:\/\/|mailto:)/i.test(element.getAttribute("href") || "")
        ? element.getAttribute("href") : null,
    },
  }),
  parseHTML: () => [{ tag: "a[href]" }],
  renderHTML: ({ HTMLAttributes }) => ["a", mergeAttributes(HTMLAttributes, { rel: "noopener noreferrer" }), 0],
});

const alignment = Extension.create({
  name: "questionAlignment",
  addGlobalAttributes: () => [{
    types: ["paragraph", "textStyle"],
    attributes: {
      textAlign: {
        default: null,
        parseHTML: (element) => /^(left|right|center|justify)$/.test(element.style.textAlign) ? element.style.textAlign : null,
        renderHTML: (attrs) => attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {},
      },
    },
  }],
});

// Canonical import images and permanent images share attributes and parsing rules.
// The import editor overrides only the node view, resolving the private URL map.
export const QuestionImage = ImageResize.configure({ inline: true });

export function questionContentExtensions() {
  return [
    StarterKit.configure({
      bulletList: { HTMLAttributes: { class: "list-disc pl-8" } },
      orderedList: { HTMLAttributes: { class: "list-decimal pl-8" } },
    }),
    TextStyle, Underline, ListKeymap, FontSize, alignment,
    ...tableExtensions,
    script("questionSup", "sup"), script("questionSub", "sub"), link,
    Mathematics.configure({
      shouldRender: (_state, _pos, node) => Boolean(node.text?.match(/(?<![R\\])\$(.*?)(?<![R\\])\$/g)),
    }),
  ];
}
