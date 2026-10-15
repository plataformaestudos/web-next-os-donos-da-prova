"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button } from "antd";

// The protected layout scrolls an ancestor, rather than the document itself.
export function scrollToReviewTarget(target: HTMLElement, end = false) {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
  let parent = target.parentElement;
  while (parent && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      const container = parent.getBoundingClientRect();
      const destination = target.getBoundingClientRect();
      parent.scrollTo({
        top: parent.scrollTop + (end
          ? destination.bottom - container.top - parent.clientTop - parent.clientHeight + 12
          : destination.top - container.top - parent.clientTop - 12),
        behavior,
      });
      return;
    }
    parent = parent.parentElement;
  }
  const destination = target.getBoundingClientRect();
  window.scrollTo({
    top: window.scrollY + (end
      ? destination.bottom - window.innerHeight + 12
      : destination.top - 12),
    behavior,
  });
}

export function useReviewPageNavigation(requestKey: string, ready: boolean) {
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const requestScroll = useCallback((key: string) => { pending.current = key; }, []);
  const cancelScroll = useCallback(() => { pending.current = null; }, []);
  const redirectScroll = useCallback((key: string) => {
    if (pending.current !== null) pending.current = key;
  }, []);

  useEffect(() => {
    if (!ready || pending.current !== requestKey) return;
    const frame = window.requestAnimationFrame(() => {
      if (pending.current !== requestKey || !startRef.current) return;
      pending.current = null;
      scrollToReviewTarget(startRef.current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requestKey, ready]);

  return {
    startRef,
    endRef,
    requestScroll,
    cancelScroll,
    redirectScroll,
  };
}

export function ImportReviewNavigation({ startRef, endRef }: {
  startRef: RefObject<HTMLDivElement | null>;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <nav className="import-review-navigation" aria-label="Navegar pelas questões">
      <Button
        shape="circle"
        aria-label="Ir ao início da lista de questões"
        icon={<ArrowUpOutlined aria-hidden="true" />}
        onClick={() => startRef.current && scrollToReviewTarget(startRef.current)}
      />
      <Button
        shape="circle"
        aria-label="Ir ao final da lista e paginação"
        icon={<ArrowDownOutlined aria-hidden="true" />}
        onClick={() => endRef.current && scrollToReviewTarget(endRef.current, true)}
      />
    </nav>
  );
}
