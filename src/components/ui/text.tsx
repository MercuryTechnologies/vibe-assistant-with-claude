import React from 'react';

type TextVariant =
  | 'title-hero'
  | 'title-main'
  | 'title-secondary'
  | 'title-minor'
  | 'title-eyebrow'
  | 'body-lg'
  | 'body-lg-demi'
  | 'body'
  | 'body-demi'
  | 'body-sm'
  | 'body-sm-demi'
  | 'label'
  | 'label-demi'
  | 'tiny'
  | 'tiny-demi'
  | 'micro'
  | 'micro-demi'
  | 'body-lg-underline'
  | 'body-lg-demi-underline'
  | 'body-underline'
  | 'body-demi-underline'
  | 'body-sm-underline'
  | 'body-sm-demi-underline'
  | 'label-underline'
  | 'label-demi-underline'
  | 'tiny-demi-underline'
  | 'micro-demi-underline';

type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'a';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Typography variant from the design system
   */
  variant: TextVariant;
  
  /**
   * HTML element to render
   * @default 'p'
   */
  as?: TextElement;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Text content
   */
  children: React.ReactNode;
  
  /**
   * Link href (only valid when as="a")
   */
  href?: string;
}

/**
 * Text component with design system typography styles
 * 
 * @example
 * ```tsx
 * <Text variant="title-hero" as="h1">Welcome to Mercury</Text>
 * <Text variant="body">This is body text</Text>
 * <Text variant="label-demi" as="label" htmlFor="email">Email</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant, as: Component = 'p', className = '', children, ...props }, ref) => {
    const variantClass = `text-${variant}`;
    const combinedClassName = `${variantClass} ${className}`.trim();

    return React.createElement(
      Component,
      {
        ref,
        className: combinedClassName,
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

/**
 * Recommended semantic HTML mapping for each variant
 */
export const RECOMMENDED_ELEMENTS: Record<TextVariant, TextElement> = {
  'title-hero': 'h1',
  'title-main': 'h1',
  'title-secondary': 'h2',
  'title-minor': 'h3',
  'title-eyebrow': 'p',
  'body-lg': 'p',
  'body-lg-demi': 'p',
  'body': 'p',
  'body-demi': 'p',
  'body-sm': 'p',
  'body-sm-demi': 'p',
  'label': 'label',
  'label-demi': 'label',
  'tiny': 'span',
  'tiny-demi': 'span',
  'micro': 'span',
  'micro-demi': 'span',
  'body-lg-underline': 'p',
  'body-lg-demi-underline': 'p',
  'body-underline': 'p',
  'body-demi-underline': 'p',
  'body-sm-underline': 'p',
  'body-sm-demi-underline': 'p',
  'label-underline': 'label',
  'label-demi-underline': 'label',
  'tiny-demi-underline': 'span',
  'micro-demi-underline': 'span',
};

/**
 * Helper to get the recommended element for a variant
 */
export function getRecommendedElement(variant: TextVariant): TextElement {
  return RECOMMENDED_ELEMENTS[variant];
}
