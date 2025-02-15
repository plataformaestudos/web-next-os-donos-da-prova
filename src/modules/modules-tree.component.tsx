"use client";

import { useEffect, useState } from "react";

import { ModuleTitle } from "./module-title.component";
import { Tree } from "antd";

export interface Module {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: Module[];
}

interface ModulesTreeProps {
  modules: Module[];
  loadData: (key: string) => Promise<Module[]>;
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
        children,
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
      treeData={tree}
      loadData={async ({ key, children }) => {
        if (children) {
          return Promise.resolve();
        } else {
          const newChildren = await props.loadData(key);
          setTree((origin) => updateTreeData(origin, key, newChildren));
        }
      }}
      titleRender={({ key, title }) => <ModuleTitle id={key} title={title} />}
    />
  );
}
