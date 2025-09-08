export interface ModuleModel {
  id: string;
  name: string;
  numberQuestions: number;
  treeCode: string;
  percent: number;
  parentModuleId: string | null;
  isLeaf?: boolean;
  childModules?: ModuleModel[];
}

export interface ModuleViewModel extends ModuleModel {
  key: string;
  title: string;
  children?: ModuleViewModel[];
}
