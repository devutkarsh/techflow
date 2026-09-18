import type { ArchitectureItem } from '../types/architecture';

// Automatically import all JSON files in the architectures directory using Vite's glob import
const architectureModules = import.meta.glob<Record<string, unknown>>(
  './architectures/*.json',
  { eager: true, import: 'default' }
);

// Map globbed modules into ArchitectureItem array, filter enabled, and sort chronologically by date
export const ARCHITECTURES: ArchitectureItem[] = Object.entries(architectureModules)
  .map(([filePath, content]) => {
    const item = content as unknown as ArchitectureItem;
    // Derive slug and ID if not provided
    const fileName = filePath.split('/').pop()?.replace('.json', '') || 'arch';
    return {
      ...item,
      id: item.id || `arch-${fileName}`,
      slug: item.slug || fileName,
      enabled: item.enabled !== false, // default true unless explicitly set to false
    };
  })
  .filter((item) => item.enabled !== false)
  .sort((a, b) => {
    const dateA = new Date(a.publishedDate || a.lastUpdated || '1970-01-01').getTime();
    const dateB = new Date(b.publishedDate || b.lastUpdated || '1970-01-01').getTime();
    // Latest chapter first (newest date at index 0)
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return a.title.localeCompare(b.title);
  });

export function getAllArchitectures(): ArchitectureItem[] {
  return ARCHITECTURES;
}

export function getArchitectureByIndex(index: number): ArchitectureItem | undefined {
  return ARCHITECTURES[index];
}

export function getArchitectureBySlug(slug: string): ArchitectureItem | undefined {
  return ARCHITECTURES.find((a) => a.slug === slug);
}
