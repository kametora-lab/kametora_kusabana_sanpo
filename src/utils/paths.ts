const escapeForRegex = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * Prefixes an asset path with the configured BASE_URL while avoiding duplicate prefixes.
 * Accepts paths that may already include a base segment (e.g. "/amamikusabana_2/images/0001.jpg")
 * and normalises them to the current deployment base.
 */
export const resolveImageUrl = (path: string) => {
  if (!path) return '';

  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
  const escapedBase = base ? escapeForRegex(base) : '';

  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  const pathWithoutBase = escapedBase
    ? normalisedPath.replace(new RegExp(`^${escapedBase}`), '')
    : normalisedPath;

  const finalPath = pathWithoutBase.startsWith('/') ? pathWithoutBase : `/${pathWithoutBase}`;
  return `${base}${finalPath}`;
};
