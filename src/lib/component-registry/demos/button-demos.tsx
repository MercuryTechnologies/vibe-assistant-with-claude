import { DSButton } from '@/components/ui/ds-button';
import { CircleIcon, EllipsisIcon } from './shared-icons';

export function DSButtonSmallDemo() {
  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-md border"
      style={{ borderColor: "var(--color-border-emphasized)" }}
    >
      {/* Primary - Small */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Primary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="primary" size="small">Label</DSButton>
          <DSButton variant="primary" size="small" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="primary" size="small" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="primary" size="small" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="primary" size="small" loading>Label</DSButton>
          <DSButton variant="primary" size="small" disabled>Label</DSButton>
        </div>
      </div>

      {/* Secondary - Small */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Secondary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="secondary" size="small">Label</DSButton>
          <DSButton variant="secondary" size="small" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="secondary" size="small" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="secondary" size="small" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="secondary" size="small" loading>Label</DSButton>
          <DSButton variant="secondary" size="small" disabled>Label</DSButton>
        </div>
      </div>

      {/* Tertiary - Small */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Tertiary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="tertiary" size="small">Label</DSButton>
          <DSButton variant="tertiary" size="small" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="tertiary" size="small" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="tertiary" size="small" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="tertiary" size="small" loading>Label</DSButton>
          <DSButton variant="tertiary" size="small" disabled>Label</DSButton>
        </div>
      </div>

      {/* Destructive - Small */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Destructive
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="destructive" size="small">Label</DSButton>
          <DSButton variant="destructive" size="small" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="destructive" size="small" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="destructive" size="small" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="destructive" size="small" loading>Label</DSButton>
          <DSButton variant="destructive" size="small" disabled>Label</DSButton>
        </div>
      </div>

      {/* Floating - Small (shown on dark background) */}
      <div
        className="flex flex-col gap-3 p-4 rounded-md -mx-2"
        style={{ backgroundColor: "var(--ds-bg-inverted)" }}
      >
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-title)" }}>
          Floating (on dark background)
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="floating" size="small">Label</DSButton>
          <DSButton variant="floating" size="small" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="floating" size="small" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="floating" size="small" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="floating" size="small" loading>Label</DSButton>
          <DSButton variant="floating" size="small" disabled>Label</DSButton>
        </div>
      </div>
    </div>
  );
}

export function DSButtonLargeDemo() {
  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-md border"
      style={{ borderColor: "var(--color-border-emphasized)" }}
    >
      {/* Primary - Large */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Primary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="primary" size="large">Label</DSButton>
          <DSButton variant="primary" size="large" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="primary" size="large" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="primary" size="large" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="primary" size="large" loading>Label</DSButton>
          <DSButton variant="primary" size="large" disabled>Label</DSButton>
        </div>
      </div>

      {/* Secondary - Large */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Secondary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="secondary" size="large">Label</DSButton>
          <DSButton variant="secondary" size="large" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="secondary" size="large" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="secondary" size="large" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="secondary" size="large" loading>Label</DSButton>
          <DSButton variant="secondary" size="large" disabled>Label</DSButton>
        </div>
      </div>

      {/* Tertiary - Large */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Tertiary
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="tertiary" size="large">Label</DSButton>
          <DSButton variant="tertiary" size="large" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="tertiary" size="large" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="tertiary" size="large" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="tertiary" size="large" loading>Label</DSButton>
          <DSButton variant="tertiary" size="large" disabled>Label</DSButton>
        </div>
      </div>

      {/* Destructive - Large */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-default)" }}>
          Destructive
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="destructive" size="large">Label</DSButton>
          <DSButton variant="destructive" size="large" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="destructive" size="large" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="destructive" size="large" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="destructive" size="large" loading>Label</DSButton>
          <DSButton variant="destructive" size="large" disabled>Label</DSButton>
        </div>
      </div>

      {/* Floating - Large (shown on dark background) */}
      <div
        className="flex flex-col gap-3 p-4 rounded-md -mx-2"
        style={{ backgroundColor: "var(--ds-bg-inverted)" }}
      >
        <h3 className="text-label-demi" style={{ color: "var(--ds-text-title)" }}>
          Floating (on dark background)
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <DSButton variant="floating" size="large">Label</DSButton>
          <DSButton variant="floating" size="large" leadingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="floating" size="large" trailingIcon={<CircleIcon />}>Label</DSButton>
          <DSButton variant="floating" size="large" iconOnly><EllipsisIcon /></DSButton>
          <DSButton variant="floating" size="large" loading>Label</DSButton>
          <DSButton variant="floating" size="large" disabled>Label</DSButton>
        </div>
      </div>
    </div>
  );
}

export const dsButtonVariantComponents: Record<string, React.ComponentType<unknown>> = {
  'Small Variants': DSButtonSmallDemo,
  'Large Variants': DSButtonLargeDemo,
};
