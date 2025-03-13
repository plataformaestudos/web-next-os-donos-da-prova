"use client";

import {
  FolderOpenOutlined,
  FolderOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import { ModuleTreeItemTitle } from "./module-tree-item-title.component";
import { ModuleViewModel } from "@/model/module.model";
import { Tree } from "antd";

interface ModulesTreeProps {
  modules: ModuleViewModel[];
  loadData: (key: string) => Promise<ModuleViewModel[]>;
  readonly?: boolean;
  checkable?: boolean;
  onCheck?: (nodes: Array<ModuleViewModel>) => void;
}

function SwitcherIcon({
  expanded,
  loading,
  isLeaf,
}: {
  expanded?: boolean;
  loading?: boolean;
  isLeaf?: boolean;
}) {
  if (isLeaf) return null;
  return loading ? (
    <LoadingOutlined />
  ) : expanded ? (
    <FolderOpenOutlined />
  ) : (
    <FolderOutlined />
  );
}

function mapTreeData(list: ModuleViewModel[]): ModuleViewModel[] {
  return list.map((node) => {
    return {
      ...node,
      switcherIcon: SwitcherIcon,
      children: mapTreeData(node.children ?? []),
    };
  });
}

const updateTreeData = (
  list: ModuleViewModel[],
  key: React.Key,
  children: ModuleViewModel[]
): ModuleViewModel[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children: children.map((child) => ({
          ...child,
          key: child.key,
        })),
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

export function ModulesTree(props: ModulesTreeProps) {
  const [loadedKeys, setLoadedKeys] = useState<string[]>([]);
  const [tree, setTree] = useState(props.modules);

  useEffect(() => {
    setTree(props.modules);
    setLoadedKeys([]);
  }, [props.modules]);

  return (
    <Tree
      loadedKeys={loadedKeys}
      onLoad={(lk) => setLoadedKeys(lk as string[])}
      rootStyle={{
        padding: "8px 8px 4px 8px",
      }}
      style={{ flex: 1 }}
      blockNode
      selectable={false}
      checkable={props.checkable ?? false}
      onCheck={(_, info) => {
        // Only send leaf modules or parent modules that are not yet loaded
        const checkedParentKeys = Array.from(
          new Set(
            info.checkedNodes
              .map((node) => node.parentModuleId)
              .filter(Boolean) as string[]
          )
        );
        props.onCheck?.(
          info.checkedNodes.filter(
            (node) => !checkedParentKeys.includes(node.key)
          )
        );
      }}
      treeData={mapTreeData(tree)}
      loadData={async ({ key }) => {
        const newChildren = await props.loadData(key);
        console.log(newChildren);
        setTree((origin) => updateTreeData(origin, key, newChildren));
      }}
      titleRender={({ key, title, parentModuleId }) => (
        <ModuleTreeItemTitle
          id={key}
          title={title}
          parentModuleId={parentModuleId}
          readonly={props.readonly}
        />
      )}
    />
  );
}
