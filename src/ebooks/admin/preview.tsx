"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Segmented, Space, Typography } from "antd";
import { EbookLanding, EbookLandingProps } from "../landing";

/** An iframe gives CSS media queries a real viewport, with the same React renderer. */
export function LandingPreview({ expanded, onExpand, ...props }: EbookLandingProps & { expanded: boolean; onExpand: () => void }) {
  const [mobile, setMobile] = useState(false);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const frameWidth = mobile ? 390 : 1200;
  const frameHeight = 760;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => {
      const availableWidth = Math.max(0, element.clientWidth - 16);
      setScale(expanded ? 1 : Math.min(1, availableWidth / frameWidth));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, frameWidth]);

  useEffect(() => {
    if (!frame) return;
    let doc: Document | null = null;
    let observer: MutationObserver | null = null;
    let styleClones = new Map<Element, Element>();

    const syncStyles = () => {
      if (!doc) return;
      const sources = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'));
      const currentSources = new Set(sources);

      for (const [source, clone] of styleClones) {
        if (!currentSources.has(source)) {
          clone.remove();
          styleClones.delete(source);
        }
      }

      for (const source of sources) {
        let clone = styleClones.get(source);
        if (!clone) {
          clone = source.cloneNode(true) as Element;
          clone.setAttribute("data-preview-style", "true");
          styleClones.set(source, clone);
          doc.head.appendChild(clone);
          continue;
        }

        // Keep existing stylesheet links mounted so an in-flight CSS request
        // is not cancelled by unrelated head updates in the parent document.
        for (const attribute of Array.from(clone.attributes)) {
          if (attribute.name !== "data-preview-style" && !source.hasAttribute(attribute.name)) {
            clone.removeAttribute(attribute.name);
          }
        }
        for (const attribute of Array.from(source.attributes)) {
          if (clone.getAttribute(attribute.name) !== attribute.value) {
            clone.setAttribute(attribute.name, attribute.value);
          }
        }
        if (source.tagName === "STYLE" && clone.textContent !== source.textContent) {
          clone.textContent = source.textContent;
        }
      }
    };

    const load = () => {
      doc = frame.contentDocument;
      if (!doc) return;
      observer?.disconnect();
      styleClones = new Map();
      doc.head.replaceChildren();
      const viewportMeta = doc.createElement("meta");
      viewportMeta.name = "viewport";
      viewportMeta.content = "width=device-width, initial-scale=1";
      doc.head.appendChild(viewportMeta);
      doc.documentElement.lang = "pt-BR";
      doc.title = "Prévia da página de venda";
      // Inherit the same Next font variables used by the public page.
      doc.body.className = document.body.className;
      syncStyles();
      setTarget(doc.body);
      observer = new MutationObserver(syncStyles);
      observer.observe(document.head, { childList: true, subtree: true, characterData: true });
      doc.body.style.margin = "0";
      doc.documentElement.style.height = "100%";
      doc.documentElement.style.overflowY = "auto";
      doc.body.style.minHeight = "100%";
    };
    frame.addEventListener("load", load);
    load();
    return () => { observer?.disconnect(); frame.removeEventListener("load", load); };
  }, [frame]);
  return <Space direction="vertical" style={{ width: "100%" }}>
    <Space wrap><Button onClick={onExpand} aria-pressed={expanded}>{expanded ? "Voltar ao editor" : "Expandir prévia"}</Button><Segmented aria-label="Largura da prévia" options={[{ label: "Computador", value: "desktop" }, { label: "Celular", value: "mobile" }]} value={mobile ? "mobile" : "desktop"} onChange={(value) => setMobile(value === "mobile")} /></Space>
    <Typography.Text type="secondary">Prévia das alterações atuais. A compra fica desabilitada.</Typography.Text>
    <div
      ref={viewport}
      style={{
        width: "100%",
        maxHeight: expanded ? "min(75vh, 760px)" : "min(65vh, 620px)",
        overflow: "auto",
        background: "#EDEFF0",
        padding: 8,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          width: frameWidth * scale,
          height: frameHeight * scale,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <iframe
          ref={setFrame}
          title={mobile ? "Prévia da landing no celular" : "Prévia da landing no computador"}
          scrolling="yes"
          style={{
            width: frameWidth,
            height: frameHeight,
            border: 0,
            display: "block",
            position: "absolute",
            inset: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
      {target && createPortal(
        <div onClickCapture={(event) => {
          event.stopPropagation();
          const element = event.target;
          if ("closest" in element && typeof element.closest === "function") {
            const link = element.closest("a");
            const href = link?.getAttribute("href");
            if (href?.startsWith("#") && link) {
              event.preventDefault();
              link.ownerDocument
                .getElementById(href.slice(1))
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (href) {
              event.preventDefault();
            }
          }
        }}>
          <EbookLanding {...props} preview />
        </div>,
        target,
      )}
    </div>
  </Space>;
}
