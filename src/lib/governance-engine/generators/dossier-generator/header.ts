import { type Product } from '../../types/entities';

export function buildHeader(product: Product): string {
  return `# DOSSIER-${product.id}`;
}
