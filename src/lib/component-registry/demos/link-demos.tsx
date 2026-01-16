import * as React from "react"
import { DSLink } from "@/components/ui/ds-link"
import { faCircle } from "@/icons"

function DemoRow({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 16 }}>
      <span className="text-label" style={{ color: "var(--ds-text-tertiary)" }}>
        {title}
      </span>
      <div className="flex items-center" style={{ gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

export function DSLinkAllStatesDemo() {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <DemoRow title="Primary / Default">
        <DSLink href="#" variant="primary" icon={faCircle} iconPosition="right" label="Link Label" />
      </DemoRow>

      <DemoRow title="Primary / Hovered">
        <DSLink
          href="#"
          variant="primary"
          icon={faCircle}
          iconPosition="right"
          label="Link Label"
          className="ds-link--force-hover"
        />
      </DemoRow>

      <DemoRow title="Primary / Focused">
        <DSLink
          href="#"
          variant="primary"
          icon={faCircle}
          iconPosition="right"
          label="Link Label"
          className="ds-link--force-focus"
        />
      </DemoRow>

      <DemoRow title="Primary / Disabled">
        <DSLink href="#" variant="primary" icon={faCircle} iconPosition="right" label="Link Label" disabled />
      </DemoRow>

      <DemoRow title="Secondary / Default">
        <DSLink href="#" variant="secondary" icon={faCircle} iconPosition="right" label="Link Label" />
      </DemoRow>

      <DemoRow title="Secondary / Left icon">
        <DSLink href="#" variant="secondary" icon={faCircle} iconPosition="left" label="Link Label" />
      </DemoRow>

      <DemoRow title="Small size">
        <DSLink href="#" size="small" variant="primary" icon={faCircle} iconPosition="right" label="Link Label" />
      </DemoRow>
    </div>
  )
}

