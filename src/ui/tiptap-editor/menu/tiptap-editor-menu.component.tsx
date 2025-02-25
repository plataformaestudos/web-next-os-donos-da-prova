import * as Styled from "./tiptap-editor-menu.style";

import { Fragment, useEffect, useRef } from "react";

import { Divider } from "antd";
import { optionGroups } from "./options/menu-option-groups.constant";

export function TiptapEditorMenu() {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      const ref = menuRef.current;

      const observer = new IntersectionObserver(
        ([e]) => {
          e.target.classList.toggle("stuck", e.intersectionRatio < 1);
        },
        { threshold: [1], rootMargin: "-1px 0px 0px 0px" }
      );

      observer.observe(ref);

      return () => {
        observer.unobserve(ref);
      };
    }
  }, []);

  return (
    <Styled.MenuContainer ref={menuRef}>
      {optionGroups.map((group, index) => (
        <Fragment key={index}>
          {group}
          {index < optionGroups.length - 1 && (
            <Divider type="vertical" style={{ height: "100%" }} />
          )}
        </Fragment>
      ))}
    </Styled.MenuContainer>
  );
}
