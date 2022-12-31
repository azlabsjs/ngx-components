/**
 * Paginate query result type definition
 */
export type PaginateResult<T> = {
  total: number;
  data: T[];
  lastPage?: number;
  nextPageURL?: string;
  lastPageURL?: string;
  page?: number;
};

/**
 * paginate result single item type definition. To make it easy for developpers
 * for identify paginate result items
 */
export type PaginateItem = { id: string | number } & Record<string, unknown>;

/**
 * Project query function query filters type
 */
export type QueryFiltersType = { [index: string]: any }[];


/**
 * Parameter type for projectPaginateQuery() query function
 */
export type ProjectPaginateQueryParamType<T = any> = {
  page?: {
    from?: number;
    to?: number;
    size?: number;
    current?: number;
  };
  sort?: {
    by: string | { compare: (a: T, b: T) => number };
    reverse: boolean;
  };
  filters?: any[];
};

/**
 * projectPaginateQuery() query function output type
 */
export type ProjectPaginateQueryOutputType = {
  page: number;
  per_page: number | undefined;
  _query: string | object;
  [index: string]: any;
};
