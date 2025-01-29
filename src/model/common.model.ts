export interface ResponseModel<T> {
  statusCode: number;
  message?: string;
  data: T;
  page?: number;
  error?: string;
  itemsPerPage?: number;
  total?: number;
  totalPages?: number;
}
