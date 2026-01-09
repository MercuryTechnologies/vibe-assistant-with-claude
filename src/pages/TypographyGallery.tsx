import { Text } from '../components/ui/text';

export function TypographyGallery() {
  return (
    <div className="space-y-12">
        <Text variant="title-hero" as="h1" className="mb-2">
          Typography System
        </Text>
        <Text variant="body-lg" className="mb-12 opacity-70">
          Complete typography styles from the Figma Design System using Arcadia font family
        </Text>

        {/* Title Styles */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Title Styles
          </Text>
          
          <div className="space-y-8">
            <div className="border-l-4 border-[var(--color-primary)] pl-6 py-4 bg-[var(--color-bg-secondary)] rounded">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-tiny-demi opacity-60">title-hero</span>
                <span className="text-tiny opacity-40">34px / 44px · Display 380</span>
              </div>
              <Text variant="title-hero" as="div">
                The quick brown fox jumps over the lazy dog
              </Text>
            </div>

            <div className="border-l-4 border-[var(--color-primary)] pl-6 py-4 bg-[var(--color-bg-secondary)] rounded">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-tiny-demi opacity-60">title-main</span>
                <span className="text-tiny opacity-40">28px / 36px · Display 380</span>
              </div>
              <Text variant="title-main" as="div">
                The quick brown fox jumps over the lazy dog
              </Text>
            </div>

            <div className="border-l-4 border-[var(--color-primary)] pl-6 py-4 bg-[var(--color-bg-secondary)] rounded">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-tiny-demi opacity-60">title-secondary</span>
                <span className="text-tiny opacity-40">19px / 28px · Text 400</span>
              </div>
              <Text variant="title-secondary" as="div">
                The quick brown fox jumps over the lazy dog
              </Text>
            </div>

            <div className="border-l-4 border-[var(--color-primary)] pl-6 py-4 bg-[var(--color-bg-secondary)] rounded">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-tiny-demi opacity-60">title-minor</span>
                <span className="text-tiny opacity-40">17px / 28px · Text 400</span>
              </div>
              <Text variant="title-minor" as="div">
                The quick brown fox jumps over the lazy dog
              </Text>
            </div>

            <div className="border-l-4 border-[var(--color-primary)] pl-6 py-4 bg-[var(--color-bg-secondary)] rounded">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-tiny-demi opacity-60">title-eyebrow</span>
                <span className="text-tiny opacity-40">12px / 24px · Text 480 · Uppercase · 1px tracking</span>
              </div>
              <Text variant="title-eyebrow" as="div">
                The quick brown fox jumps over the lazy dog
              </Text>
            </div>
          </div>
        </section>

        {/* Body Styles */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Body Text Styles
          </Text>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body-lg</span>
                  <span className="text-tiny opacity-40">17px / 28px · 400</span>
                </div>
                <Text variant="body-lg" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body-lg-demi</span>
                  <span className="text-tiny opacity-40">17px / 28px · 480</span>
                </div>
                <Text variant="body-lg-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body (DEFAULT)</span>
                  <span className="text-tiny opacity-40">15px / 24px · 400</span>
                </div>
                <Text variant="body" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body-demi</span>
                  <span className="text-tiny opacity-40">15px / 24px · 480</span>
                </div>
                <Text variant="body-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body-sm</span>
                  <span className="text-tiny opacity-40">14px / 20px · 400</span>
                </div>
                <Text variant="body-sm" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">body-sm-demi</span>
                  <span className="text-tiny opacity-40">14px / 20px · 480</span>
                </div>
                <Text variant="body-sm-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Label & Small Text */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Labels & Small Text
          </Text>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">label</span>
                  <span className="text-tiny opacity-40">13px / 20px · 400</span>
                </div>
                <Text variant="label" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">label-demi</span>
                  <span className="text-tiny opacity-40">13px / 20px · 480</span>
                </div>
                <Text variant="label-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">tiny</span>
                  <span className="text-tiny opacity-40">12px / 20px · 400</span>
                </div>
                <Text variant="tiny" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">tiny-demi</span>
                  <span className="text-tiny opacity-40">12px / 20px · 480</span>
                </div>
                <Text variant="tiny-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">micro</span>
                  <span className="text-tiny opacity-40">10px / 20px · 400 · Uppercase</span>
                </div>
                <Text variant="micro" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>

              <div className="border border-[var(--color-border)] p-4 rounded">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-tiny-demi opacity-60">micro-demi</span>
                  <span className="text-tiny opacity-40">10px / 20px · 480 · Uppercase</span>
                </div>
                <Text variant="micro-demi" as="div">
                  The quick brown fox jumps over the lazy dog
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Underlined Variants */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Underlined Variants
          </Text>
          
          <div className="space-y-4">
            <div className="border border-[var(--color-border)] p-4 rounded">
              <Text variant="body-lg-underline" as="div">
                Body Large Underline - Great for emphasized links
              </Text>
            </div>
            <div className="border border-[var(--color-border)] p-4 rounded">
              <Text variant="body-underline" as="div">
                Body Underline - Standard link styling
              </Text>
            </div>
            <div className="border border-[var(--color-border)] p-4 rounded">
              <Text variant="body-sm-underline" as="div">
                Body Small Underline - Compact links
              </Text>
            </div>
            <div className="border border-[var(--color-border)] p-4 rounded">
              <Text variant="label-demi-underline" as="div">
                Label Demi Underline - Strong small links
              </Text>
            </div>
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Real-World Example
          </Text>
          
          <div className="border border-[var(--color-border)] rounded-lg p-8 bg-[var(--color-bg-secondary)]">
            <Text variant="title-eyebrow" className="mb-2">
              Premium Account
            </Text>
            <Text variant="title-main" as="h3" className="mb-4">
              Mercury Checking
            </Text>
            <Text variant="body" className="mb-6">
              Your primary business checking account with unlimited transactions and no monthly fees.
            </Text>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <Text variant="label" className="mb-1">
                  Available Balance
                </Text>
                <Text variant="body-lg-demi">
                  $125,750.42
                </Text>
              </div>
              <div>
                <Text variant="label" className="mb-1">
                  Account Number
                </Text>
                <Text variant="body-sm">
                  ****1234
                </Text>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <Text variant="body-underline" as="a" href="#" className="text-[var(--color-primary)]">
                View transactions
              </Text>
              <Text variant="tiny">
                Last updated today at 2:34 PM
              </Text>
            </div>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="mb-16">
          <Text variant="title-secondary" as="h2" className="mb-6">
            Usage Guide
          </Text>
          
          <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg">
            <Text variant="body-demi" className="mb-4">
              Two ways to use typography:
            </Text>
            
            <div className="space-y-6">
              <div>
                <Text variant="label-demi" className="mb-2">
                  1. Using CSS Classes
                </Text>
                <pre className="bg-[var(--color-bg-tertiary)] p-4 rounded text-tiny overflow-x-auto">
{`<h1 className="text-title-hero">Welcome</h1>
<p className="text-body">Standard text</p>
<span className="text-label">Label</span>`}
                </pre>
              </div>
              
              <div>
                <Text variant="label-demi" className="mb-2">
                  2. Using Text Component
                </Text>
                <pre className="bg-[var(--color-bg-tertiary)] p-4 rounded text-tiny overflow-x-auto">
{`<Text variant="title-hero" as="h1">Welcome</Text>
<Text variant="body">Standard text</Text>
<Text variant="label" as="label">Label</Text>`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] pt-8 mt-16">
          <Text variant="body-sm" className="opacity-60">
            For complete documentation, see <code className="text-tiny-demi bg-[var(--color-bg-tertiary)] px-2 py-1 rounded">docs/TYPOGRAPHY.md</code>
          </Text>
        </div>
    </div>
  );
}
