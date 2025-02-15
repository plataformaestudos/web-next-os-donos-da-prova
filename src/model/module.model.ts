export interface ModuleModel {
  id: string;
  name: string;
  parent_module?: string;
}

export interface ModuleViewModel {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: ModuleViewModel[];
}
