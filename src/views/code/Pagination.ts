// Common pagination helpers for page counting

export function resolveTotalPages(
  totalCount: number | undefined,
  pageSize: number | undefined
): number {
  const safeTotal =
    typeof totalCount === "number" && totalCount >= 0 ? totalCount : 0;
  const safeSize =
    typeof pageSize === "number" && pageSize! > 0 ? pageSize! : 10;
  const pages = Math.ceil(safeTotal / safeSize);
  return pages > 0 ? pages : 1;
}

export function clampPage(targetPage: number, totalPages: number): number {
  if (!Number.isFinite(targetPage)) return 1;
  if (targetPage < 1) return 1;
  if (targetPage > totalPages) return totalPages;
  return targetPage;
}
