export interface UpsertPlanDTO {
  id?: string;
  name: string;
  description: string;
  price: number;
  modules: string[];
}
