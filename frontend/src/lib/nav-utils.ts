/** Active state for module sub-nav links (exact match on module root). */
export function isModuleChildActive(pathname: string, href: string): boolean {
  const isModuleRoot = href.split("/").filter(Boolean).length === 1;

  if (isModuleRoot) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
