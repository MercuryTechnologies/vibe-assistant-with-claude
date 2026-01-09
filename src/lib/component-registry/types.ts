import type React from 'react';

export interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, unknown>;
}

export interface ComponentInfo {
  name: string;
  category: 'core' | 'ui';
  description: string;
  usedIn: string[];
  variants: ComponentVariant[];
  component: React.ComponentType<unknown>;
}
