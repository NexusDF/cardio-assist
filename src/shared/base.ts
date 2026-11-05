/** Нормализует `base` Vite для GitHub Pages: всегда с ведущим и завершающим слэшем. */
export function resolveAppBase(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '' || trimmed === '/') return '/'

  const slug = trimmed.replace(/^\/+|\/+$/g, '')
  if (slug === '') return '/'

  return `/${slug}/`
}
