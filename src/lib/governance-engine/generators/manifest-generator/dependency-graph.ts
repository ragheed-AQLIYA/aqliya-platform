import {
  type GovernanceRegistries,
  type Product,
} from '../../types/entities';
import { ExecutionContext } from '../../context/execution-context';

function buildTree(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string[] {
  const result: string[] = [];

  result.push(product.id);

  const allProducts = [...ctx.products.byId.values()];
  const parentLines: string[] = [];
  if (product.parentSystem) {
    const parent = ctx.products.byId.get(product.parentSystem) ?? registries.products.find((p) => p.id === product.parentSystem);
    if (parent) {
      parentLines.push(`└── Parent: ${parent.id}`);
      const siblings = allProducts
        .filter((p) => p.parentSystem === product.parentSystem && p.id !== product.id)
        .sort((a, b) => a.id.localeCompare(b.id));
      for (const sibling of siblings) {
        parentLines.push(`    ├── Sibling: ${sibling.id}`);
      }
    }
  }

  const children = allProducts
    .filter((p) => p.parentSystem === product.id)
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const child of children) {
    parentLines.push(`├── Child: ${child.id}`);
  }

  const ka = registries.knowledgeAreas.find((k) => k.id === product.knowledgeArea);
  if (ka) {
    parentLines.push(`└── KA: ${ka.id} (${ka.name})`);
  }

  if (parentLines.length > 0) {
    result.push(parentLines.join('\n'));
  }

  return result;
}

export function buildDependencyGraph(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): string {
  const lines: string[] = [];
  lines.push('## Dependency Graph');
  lines.push('');

  const treeLines = buildTree(product, registries, ctx);
  lines.push(...treeLines);

  return lines.join('\n');
}
