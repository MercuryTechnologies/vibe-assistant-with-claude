import * as React from 'react';
import { Icon } from '@/components/ui/icon';
import {
  faHome,
  faChartBar,
  faCreditCard,
  faEnvelope,
  faFileText,
  faBuilding,
  faBookmark,
  faBell,
  faUser,
  faFile,
} from '@fortawesome/free-regular-svg-icons';

// Default variant demo - shows default size icons (24x24px container, 13px icon)
export function IconDefaultDemo() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <div className="text-label mb-4" style={{ color: "var(--ds-text-tertiary)" }}>
          Default Size (24x24px container, 13px icon)
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Icon icon={faHome} size="default" />
          <Icon icon={faChartBar} size="default" />
          <Icon icon={faCreditCard} size="default" />
          <Icon icon={faEnvelope} size="default" />
          <Icon icon={faFileText} size="default" />
          <Icon icon={faBuilding} size="default" />
          <Icon icon={faBookmark} size="default" />
          <Icon icon={faBell} size="default" />
          <Icon icon={faUser} size="default" />
          <Icon icon={faFile} size="default" />
        </div>
      </div>
    </div>
  );
}

// Small variant demo - shows small size icons (20x20px container, 11px icon)
export function IconSmallDemo() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <div className="text-label mb-4" style={{ color: "var(--ds-text-tertiary)" }}>
          Small Size (20x20px container, 11px icon)
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Icon icon={faHome} size="small" />
          <Icon icon={faChartBar} size="small" />
          <Icon icon={faCreditCard} size="small" />
          <Icon icon={faEnvelope} size="small" />
          <Icon icon={faFileText} size="small" />
          <Icon icon={faBuilding} size="small" />
          <Icon icon={faBookmark} size="small" />
          <Icon icon={faBell} size="small" />
          <Icon icon={faUser} size="small" />
          <Icon icon={faFile} size="small" />
        </div>
      </div>
    </div>
  );
}

// Variant components map for ComponentDetail page
export const iconVariantComponents: Record<string, React.ComponentType> = {
  'Default': IconDefaultDemo,
  'Small': IconSmallDemo,
};
