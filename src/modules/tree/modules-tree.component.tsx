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
import { useSearchParams } from "next/navigation";

interface ModulesTreeProps {
  modules: ModuleViewModel[];
  loadData: (key: string) => Promise<ModuleViewModel[]>;
  readonly?: boolean;
  checkable?: boolean;
  defaultCheckedKeys?: string[];
  onCheck?: (checked: {
    checkedLeaves: Array<ModuleViewModel>;
    checkedRoots: Array<ModuleViewModel>;
    allChecked: Array<ModuleViewModel>;
  }) => void;
  autoExpand?: boolean;
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

// TODO: If /modules return full tree, we can use this to initially setup the tree
// function setupTree(
//   modules: ModuleViewModel[],
//   parentModuleId: ModuleViewModel["parentModuleId"]
// ): ModuleViewModel[] {
//   return modules
//     .filter((module) => module.parentModuleId === parentModuleId)
//     .map((module) => {
//       return {
//         ...module,
//         children: setupTree(modules, module.id),
//       };
//     });
// }

function setupTree(
  modules: ModuleViewModel[],
  skip = false
): ModuleViewModel[] {
  if (skip) return modules;
  const modulesIds = modules.map(({ id }) => id);
  const rootModules: ModuleViewModel[] = [];
  const childModules: ModuleViewModel[] = [];

  modules.forEach((module) => {
    if (!module.parentModuleId || !modulesIds.includes(module.parentModuleId)) {
      rootModules.push(module);
    } else {
      childModules.push(module);
    }
  });

  return rootModules.map((module) => {
    return {
      ...module,
      children: setupTree(childModules).filter(
        (mod) => mod.parentModuleId === module.id
      ),
    };
  });
}

export function ModulesTree(props: ModulesTreeProps) {
  const searchParams = useSearchParams();
  const autoExpand = searchParams.has("nome") || props.autoExpand;

  const [loadedKeys, setLoadedKeys] = useState<string[]>([]);
  const [expandadedKeys, setExpandedKeys] = useState<string[]>(
    autoExpand
      ? props.defaultCheckedKeys ?? props.modules.map(({ id }) => id)
      : []
  );
  const [tree, setTree] = useState(setupTree(props.modules, props.autoExpand));

  useEffect(() => {
    setTree(setupTree(props.modules, props.autoExpand));
    setExpandedKeys(
      autoExpand
        ? props.defaultCheckedKeys ?? props.modules.map(({ id }) => id)
        : []
    );
    setLoadedKeys([]);
  }, [props.modules, autoExpand, props.autoExpand, props.defaultCheckedKeys]);

  return (
    <Tree
      showLine={true}
      autoExpandParent
      defaultCheckedKeys={props.defaultCheckedKeys}
      expandedKeys={expandadedKeys}
      onExpand={(keys) => setExpandedKeys(keys as string[])}
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
        const checkedRoots = info.checkedNodes
          .filter((node) => !node.isLeaf && !node.parentModuleId)
          .concat(
            ...info.checkedNodes.filter((node) =>
              info.halfCheckedKeys?.includes(node.parentModuleId as string)
            )
          );

        const checkedParentKeys = Array.from(
          new Set(
            info.checkedNodes
              .map((node) => node.parentModuleId)
              .filter(Boolean) as string[]
          )
        );
        const checkedLeaves = info.checkedNodes.filter(
          (node) => !checkedParentKeys.includes(node.key)
        );

        props.onCheck?.({
          checkedLeaves,
          checkedRoots,
          allChecked: info.checkedNodes,
        });
      }}
      treeData={mapTreeData(tree)}
      loadData={async ({ key }) => {
        const newChildren = await props.loadData(key);
        setTree((origin) => updateTreeData(origin, key, newChildren));
      }}
      titleRender={({ key, title, parentModuleId, isLeaf }) => (
        <ModuleTreeItemTitle
          onClick={() => {
            setExpandedKeys(
              expandadedKeys.includes(key)
                ? expandadedKeys.filter((expandedKey) => expandedKey !== key)
                : expandadedKeys.concat(key)
            );
          }}
          id={key}
          title={title}
          isLeaf={isLeaf}
          parentModuleId={parentModuleId}
          readonly={props.readonly}
        />
      )}
    />
  );
}
