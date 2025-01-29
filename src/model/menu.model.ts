export interface MenuModel {
  id: string;
  description: string;
  icon: string;
  parent?: string;
  level: number;
  order: number;
  link: string;
  active_regex: string;
}
