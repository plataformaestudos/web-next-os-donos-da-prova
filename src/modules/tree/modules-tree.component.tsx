"use client";

import {
  FolderOpenOutlined,
  FolderOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import { ModuleTreeItemTitle } from "./module-tree-item-title.component";
import { Tree } from "antd";

export interface Module {
  key: string;
  title: string;
  parentModuleId?: string;
  isLeaf?: boolean;
  children?: Module[];
}

interface ModulesTreeProps {
  modules: Module[];
  loadData: (key: string) => Promise<Module[]>;
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

function mapTreeData(list: Module[]): Module[] {
  return list.map((node) => {
    return {
      ...node,
      switcherIcon: SwitcherIcon,
      children: mapTreeData(node.children ?? []),
    };
  });
}

const updateTreeData = (
  list: Module[],
  key: React.Key,
  children: Module[]
): Module[] =>
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
      treeData={mapTreeData(tree)}
      loadData={async ({ key }) => {
        const newChildren = await props.loadData(key);
        setTree((origin) => updateTreeData(origin, key, newChildren));
      }}
      titleRender={({ key, title, parentModuleId }) => (
        <ModuleTreeItemTitle
          id={key}
          title={title}
          parentModuleId={parentModuleId}
        />
      )}
    />
  );
}
