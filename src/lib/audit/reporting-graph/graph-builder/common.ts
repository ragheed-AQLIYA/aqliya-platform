export function edgeId(
  sourceId: string,
  targetId: string,
  suffix: string,
): string {
  return `e-${sourceId}-${targetId}-${suffix}`;
}
