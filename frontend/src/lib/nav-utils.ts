/** Active state for module sub-nav links (exact match on module root). */
export function isModuleChildActive(pathname: string, href: string): boolean {
  const isModuleRoot = href.split("/").filter(Boolean).length === 1;

  if (isModuleRoot) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavNode = {
  labelKey: string;
  href: string;
  children?: readonly NavNode[];
};

/** Flatten nested nav items for label lookup. */
export function flattenNavItems(items: readonly NavNode[]): NavNode[] {
  const result: NavNode[] = [];
  for (const item of items) {
    result.push({ labelKey: item.labelKey, href: item.href });
    if (item.children?.length) {
      result.push(...flattenNavItems(item.children));
    }
  }
  return result;
}

/** Resolve breadcrumb trail for nested module nav. */
export function resolveNavTrail(
  pathname: string,
  items: readonly NavNode[],
  t: (key: string) => string
): { label: string; href?: string }[] | null {
  for (const item of items) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    if (!matches) continue;

    const trail = [{ label: t(item.labelKey), href: item.href }];

    if (item.children?.length) {
      const nested = resolveNavTrail(pathname, item.children, t);
      if (nested) return [...trail, ...nested];
    }

    if (pathname === item.href) {
      return [{ label: t(item.labelKey) }];
    }

    return trail.map((crumb, index) =>
      index === trail.length - 1 ? { label: crumb.label } : crumb
    );
  }

  return null;
}
