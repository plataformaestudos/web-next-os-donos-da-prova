import { ModuleModel, ModuleViewModel } from "@/model/module.model";

export function moduleModelToViewModelAdapter(
  module: ModuleModel
): ModuleViewModel {
  return {
    ...module,
    key: module.id,
    title: module.name,
    parentModuleId: module.parentModuleId ?? null,
    isLeaf: module.childModules?.length === 0,
    children: module.childModules?.map(moduleModelToViewModelAdapter),
  };
}

export function mergeModulesTree(
  tree1: ModuleViewModel[],
  tree2: ModuleViewModel[]
): ModuleViewModel[] {
  const modulesById = new Map<string, ModuleViewModel>();

  tree1.forEach((module) => modulesById.set(module.id, module));

  tree2.forEach((module) => {
    const module1 = modulesById.get(module.id);
    if (module1) {
      module.children = mergeModulesTree(
        module1.children ?? [],
        module.children ?? []
      );
    }
    modulesById.set(module.id, module);
  });

  return Array.from(modulesById.values());
}
