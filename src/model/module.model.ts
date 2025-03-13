export interface ModuleModel {
  id: string;
  name: string;
  numberQuestions: number;
  treeCode: string;
  parentModuleId?: string;
  isLeaf?: boolean;
  children?: ModuleModel[];
}

export interface ModuleViewModel extends ModuleModel {
  key: string;
  title: string;
  children?: ModuleViewModel[];
}
