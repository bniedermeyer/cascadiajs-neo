/**
 * A markdown page's meta description: the explicit `description`, else the
 * `excerpt` (legacy reads `excerpt` as a description fallback). Undefined when
 * neither is set, so the layout applies its own default.
 */
export function pageDescription(data: {
  description?: string;
  excerpt?: string;
}): string | undefined {
  return data.description ?? data.excerpt;
}
