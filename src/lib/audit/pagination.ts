export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export const DEFAULT_PAGE_SIZE = 20

export function paginate<T>(items: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE))
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  }
}

export function offsetFromPage(page: number, pageSize: number): number {
  return (Math.max(1, page) - 1) * Math.max(1, pageSize)
}
