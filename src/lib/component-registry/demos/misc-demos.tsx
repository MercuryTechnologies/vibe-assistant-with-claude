import { Badge } from '@/components/ui/badge';
import { TopNav } from '@/components/core';

// Badge is already a simple component, so we just re-export it
// The registry will use Badge directly with different props for variants

// TopNav is also simple enough to use directly
// We just export references for the registry

export { Badge, TopNav };
