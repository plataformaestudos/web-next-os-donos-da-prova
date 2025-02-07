import { Fragment } from "react";
import { optionGroups } from "./menu-option-groups.constant";

export function TiptapEditorMenu() {
  return (
    <div className="flex gap-1 items-center px-1 h-6 mb-4">
      {optionGroups.map((group, index) => (
        <Fragment key={index}>
          {group}
          {index < optionGroups.length - 1 && (
            <div className="mx-1 border-l border-l-gray-300 h-full" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
