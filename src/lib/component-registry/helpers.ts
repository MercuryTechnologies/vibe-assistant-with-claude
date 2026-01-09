import type { ComponentInfo } from './types';

/**
 * Convert a component name to its URL-safe ID
 * @param name - The component display name
 */
export function getComponentId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

/**
 * Get a component from the registry by its ID
 * Note: This function takes the registry as a parameter to avoid circular imports
 * @param registry - The component registry array
 * @param id - The component ID (lowercase name without spaces)
 */
export function getComponentById(registry: ComponentInfo[], id: string): ComponentInfo | undefined {
  return registry.find(
    comp => comp.name.toLowerCase().replace(/\s+/g, '') === id.toLowerCase()
  );
}
