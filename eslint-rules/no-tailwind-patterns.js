/**
 * ESLint rule to prevent Tailwind CSS patterns in className strings.
 * 
 * This rule detects:
 * - Responsive prefixes (sm:, md:, lg:, xl:, 2xl:)
 * - State prefixes (hover:, focus:, active:, disabled:, group-hover:)
 * - data-[state=...] patterns
 * - Arbitrary bracket values ([...])
 * - Tailwind color tokens (text-gray-500, bg-slate-100, etc.)
 */

const FORBIDDEN_PATTERNS = [
  // Responsive prefixes
  {
    pattern: /\b(sm|md|lg|xl|2xl):[a-zA-Z]/,
    message: 'Responsive prefixes (sm:, md:, lg:, xl:, 2xl:) are not allowed. Use CSS media queries instead.'
  },
  // State prefixes
  {
    pattern: /\bhover:[a-zA-Z]/,
    message: 'hover: prefix is not allowed. Use CSS :hover selector instead.'
  },
  {
    pattern: /\bfocus(-visible|-within)?:[a-zA-Z]/,
    message: 'focus: prefix is not allowed. Use CSS :focus/:focus-visible selector instead.'
  },
  {
    pattern: /\bactive:[a-zA-Z]/,
    message: 'active: prefix is not allowed. Use CSS :active selector instead.'
  },
  {
    pattern: /\bdisabled:[a-zA-Z]/,
    message: 'disabled: prefix is not allowed. Use CSS :disabled selector instead.'
  },
  {
    pattern: /\bgroup-(hover|focus):[a-zA-Z]/,
    message: 'group-hover:/group-focus: is not allowed. Use CSS parent hover selectors instead.'
  },
  // data-[state=] in className
  {
    pattern: /data-\[state=/,
    message: 'data-[state=...] in className is not allowed. Use CSS [data-state="..."] selectors instead.'
  },
  // Arbitrary bracket values
  {
    pattern: /\b(bg|text|border)-\[#[a-fA-F0-9]+\]/,
    message: 'Arbitrary color values (bg-[#...], text-[#...]) are not allowed. Use CSS custom properties instead.'
  },
  {
    pattern: /\b(bg|text|border)-\[rgba\(/,
    message: 'Arbitrary rgba values are not allowed. Use CSS custom properties instead.'
  },
  {
    pattern: /\btext-\[\d+px\]/,
    message: 'Arbitrary text sizes (text-[Npx]) are not allowed. Use typography design tokens instead.'
  },
  {
    pattern: /\bleading-\[\d+/,
    message: 'Arbitrary line-height (leading-[N]) is not allowed. Use typography design tokens instead.'
  },
  {
    pattern: /\btracking-\[\d+/,
    message: 'Arbitrary letter-spacing (tracking-[N]) is not allowed. Use typography design tokens instead.'
  },
  {
    pattern: /\brounded(-[a-z]+)?-\[\d+/,
    message: 'Arbitrary border-radius (rounded-[Npx]) is not allowed. Use the 4-tier radius system (rounded-sm, rounded-md, rounded-lg, rounded-full).'
  },
  // Tailwind color tokens
  {
    pattern: /\b(text|bg|border)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    message: 'Tailwind color tokens are not allowed. Use design system CSS custom properties instead.'
  }
];

/**
 * Check if a string value contains forbidden Tailwind patterns
 */
function checkForForbiddenPatterns(value) {
  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) {
      return message;
    }
  }
  return null;
}

/**
 * Extract string value from different AST node types
 */
function getStringValue(node) {
  if (!node) return null;
  
  switch (node.type) {
    case 'Literal':
      return typeof node.value === 'string' ? node.value : null;
    case 'TemplateLiteral':
      // For template literals, check the quasi parts
      return node.quasis.map(q => q.value.raw).join('');
    default:
      return null;
  }
}

/**
 * Check if a node is a className attribute in JSX
 */
function isClassNameAttribute(node) {
  return (
    node.type === 'JSXAttribute' &&
    node.name &&
    node.name.type === 'JSXIdentifier' &&
    node.name.name === 'className'
  );
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind CSS patterns in className',
      category: 'Best Practices',
      recommended: true
    },
    messages: {
      forbiddenPattern: '{{ message }} See docs/UTILITIES.md for migration guidance.'
    },
    schema: []
  },
  
  create(context) {
    return {
      // Check className="..." attributes
      JSXAttribute(node) {
        if (!isClassNameAttribute(node)) return;
        
        // Handle className="string"
        if (node.value && node.value.type === 'Literal') {
          const value = getStringValue(node.value);
          if (value) {
            const errorMessage = checkForForbiddenPatterns(value);
            if (errorMessage) {
              context.report({
                node: node.value,
                messageId: 'forbiddenPattern',
                data: { message: errorMessage }
              });
            }
          }
        }
        
        // Handle className={...}
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          const expr = node.value.expression;
          
          // className={`template`}
          if (expr.type === 'TemplateLiteral') {
            const value = getStringValue(expr);
            if (value) {
              const errorMessage = checkForForbiddenPatterns(value);
              if (errorMessage) {
                context.report({
                  node: expr,
                  messageId: 'forbiddenPattern',
                  data: { message: errorMessage }
                });
              }
            }
          }
          
          // className={cn(...)} - check string arguments
          if (expr.type === 'CallExpression') {
            for (const arg of expr.arguments) {
              const value = getStringValue(arg);
              if (value) {
                const errorMessage = checkForForbiddenPatterns(value);
                if (errorMessage) {
                  context.report({
                    node: arg,
                    messageId: 'forbiddenPattern',
                    data: { message: errorMessage }
                  });
                }
              }
              
              // Check template literals in cn() calls
              if (arg.type === 'TemplateLiteral') {
                const templateValue = getStringValue(arg);
                if (templateValue) {
                  const errorMessage = checkForForbiddenPatterns(templateValue);
                  if (errorMessage) {
                    context.report({
                      node: arg,
                      messageId: 'forbiddenPattern',
                      data: { message: errorMessage }
                    });
                  }
                }
              }
              
              // Check conditional expressions: condition && "string"
              if (arg.type === 'LogicalExpression' && arg.right) {
                const rightValue = getStringValue(arg.right);
                if (rightValue) {
                  const errorMessage = checkForForbiddenPatterns(rightValue);
                  if (errorMessage) {
                    context.report({
                      node: arg.right,
                      messageId: 'forbiddenPattern',
                      data: { message: errorMessage }
                    });
                  }
                }
              }
              
              // Check ternary expressions: condition ? "a" : "b"
              if (arg.type === 'ConditionalExpression') {
                const consequentValue = getStringValue(arg.consequent);
                const alternateValue = getStringValue(arg.alternate);
                
                if (consequentValue) {
                  const errorMessage = checkForForbiddenPatterns(consequentValue);
                  if (errorMessage) {
                    context.report({
                      node: arg.consequent,
                      messageId: 'forbiddenPattern',
                      data: { message: errorMessage }
                    });
                  }
                }
                
                if (alternateValue) {
                  const errorMessage = checkForForbiddenPatterns(alternateValue);
                  if (errorMessage) {
                    context.report({
                      node: arg.alternate,
                      messageId: 'forbiddenPattern',
                      data: { message: errorMessage }
                    });
                  }
                }
              }
            }
          }
        }
      }
    };
  }
};

export default rule;
