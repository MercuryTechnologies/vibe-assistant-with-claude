import { DSButton, type DSButtonProps } from "@/components/ui/ds-button";
export interface AttachmentButtonProps
  extends Omit<
    DSButtonProps,
    "variant" | "size" | "iconOnly" | "leadingIcon" | "trailingIcon" | "children"
  > {
  hasAttachment: boolean;
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 1.5C3.17157 1.5 2.5 2.17157 2.5 3V13C2.5 13.8284 3.17157 14.5 4 14.5H12C12.8284 14.5 13.5 13.8284 13.5 13V3C13.5 2.17157 12.8284 1.5 12 1.5H4Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M5 5H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M5 8H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M5 11H8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function AddAttachmentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 3.5C3 2.39543 3.89543 1.5 5 1.5H9.58579C9.85097 1.5 10.1054 1.60536 10.2929 1.79289L12.7071 4.20711C12.8946 4.39464 13 4.64903 13 4.91421V12.5C13 13.6046 12.1046 14.5 11 14.5H5C3.89543 14.5 3 13.6046 3 12.5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M8 6V10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M6 8H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Attachment button component matching Figma design
 * Shows receipt icon for existing attachments, add icon otherwise
 */
export function AttachmentButton({ hasAttachment, title, ...props }: AttachmentButtonProps) {
  const resolvedTitle = title ?? (hasAttachment ? "View attachment" : "Add attachment");
  const resolvedAriaLabel = props["aria-label"] ?? resolvedTitle;

  return (
    <DSButton
      {...props}
      variant={hasAttachment ? "tertiary" : "secondary"}
      size="small"
      iconOnly
      leadingIcon={hasAttachment ? <ReceiptIcon /> : <AddAttachmentIcon />}
      title={resolvedTitle}
      aria-label={resolvedAriaLabel}
    />
  );
}
