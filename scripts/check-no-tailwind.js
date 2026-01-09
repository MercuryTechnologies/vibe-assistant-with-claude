#!/usr/bin/env node

/**
 * No-Tailwind Scan Script
 * 
 * This script scans the codebase for forbidden Tailwind patterns and fails
 * if any are found. Use this as a CI check or pre-commit hook.
 * 
 * Usage:
 *   node scripts/check-no-tailwind.js
 *   npm run check:tailwind
 * 
 * Exit codes:
 *   0 - No Tailwind patterns found
 *   1 - Tailwind patterns detected (will list violations)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_KIND = {
  CODE: 'code',
  CSS: 'css',
};

function getFileKind(filePath) {
  const ext = extname(filePath);
  return ext === '.css' ? FILE_KIND.CSS : FILE_KIND.CODE;
}

// Patterns to search for
// NOTE: Many Tailwind-ish regexes are only meaningful in JSX/TS strings.
// In CSS, they can false-positive on legitimate selectors like `:hover` or `.button-sm`.
const FORBIDDEN_PATTERNS = [
  // Responsive prefixes
  {
    name: 'Responsive prefixes (sm:, md:, lg:, xl:, 2xl:)',
    pattern: /\b(sm|md|lg|xl|2xl):[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  // State prefixes  
  {
    name: 'Hover prefix (hover:)',
    pattern: /\bhover:[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Focus prefix (focus:, focus-visible:, focus-within:)',
    pattern: /\bfocus(-visible|-within)?:[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Active prefix (active:)',
    pattern: /\bactive:[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Disabled prefix (disabled:)',
    pattern: /\bdisabled:[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Group hover/focus (group-hover:, group-focus:)',
    pattern: /\bgroup-(hover|focus):[a-zA-Z]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  // Data state in className
  {
    name: 'data-[state=] in className',
    pattern: /data-\[state=/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'data-[highlighted] in className',
    pattern: /data-\[highlighted\]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  // Arbitrary values in className (but not in style props or CSS)
  {
    name: 'Arbitrary color values (bg-[#], text-[#], border-[#])',
    pattern: /\b(bg|text|border)-\[#[a-fA-F0-9]+\]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary rgba values (bg-[rgba(, text-[rgba()',
    pattern: /\b(bg|text|border)-\[rgba\(/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary size/position values ([Npx], [N%])',
    pattern: /\b(w|h|min-w|min-h|max-w|max-h|top|right|bottom|left|inset|gap|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-\[\d+/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary text size (text-[Npx])',
    pattern: /\btext-\[\d+px\]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary leading (leading-[N])',
    pattern: /\bleading-\[\d+/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary tracking (tracking-[N])',
    pattern: /\btracking-\[\d+/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary rounded (rounded-[Npx])',
    pattern: /\brounded(-[a-z]+)?-\[\d+/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary z-index (z-[N])',
    pattern: /\bz-\[\d+\]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  {
    name: 'Arbitrary shadow (shadow-[...])',
    pattern: /\bshadow-\[[^\]]+\]/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE],
  },
  // CSS variable in brackets (sometimes valid, warn only)
  {
    name: 'CSS variable in brackets (bg-[var(--), text-[var(--)])',
    pattern: /\b(bg|text|border)-\[var\(--/g,
    severity: 'warn',
    fileKinds: [FILE_KIND.CODE],
  },
  // Tailwind-only color tokens
  {
    name: 'Tailwind color tokens (text-gray-*, bg-slate-*, etc.)',
    pattern: /\b(text|bg|border)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CODE, FILE_KIND.CSS],
  },
  // Tailwind imports in CSS
  {
    name: '@import "tailwindcss" in CSS',
    pattern: /@import\s+["']tailwindcss["']/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CSS],
  },
  {
    name: '@tailwind directive in CSS',
    pattern: /@tailwind\s+(base|components|utilities)/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CSS],
  },
  // Tailwind theme block
  {
    name: '@theme inline block',
    pattern: /@theme\s+inline/g,
    severity: 'error',
    fileKinds: [FILE_KIND.CSS],
  }
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css'];

// Directories to skip
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'playwright-report', 'test-results'];

// Files to skip
const SKIP_FILES = ['check-no-tailwind.js']; // Skip this script itself

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.includes(item)) {
        getAllFiles(fullPath, files);
      }
    } else if (stat.isFile()) {
      const ext = extname(item);
      if (SCAN_EXTENSIONS.includes(ext) && !SKIP_FILES.includes(item)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Scan a file for forbidden patterns
 */
function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const violations = [];
  const fileKind = getFileKind(filePath);
  
  for (const { name, pattern, severity, fileKinds } of FORBIDDEN_PATTERNS) {
    if (Array.isArray(fileKinds) && !fileKinds.includes(fileKind)) continue;
    // Reset pattern state
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Get line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
      
      // Get line content
      const lines = content.split('\n');
      const lineContent = lines[lineNumber - 1]?.trim() || '';
      
      violations.push({
        pattern: name,
        match: match[0],
        line: lineNumber,
        lineContent: lineContent.substring(0, 100) + (lineContent.length > 100 ? '...' : ''),
        severity
      });
    }
  }
  
  return violations;
}

/**
 * Main function
 */
function main() {
  const rootDir = join(__dirname, '..');
  const srcDir = join(rootDir, 'src');
  
  console.log('🔍 Scanning for Tailwind patterns...\n');
  
  const files = getAllFiles(srcDir);
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];
  
  for (const filePath of files) {
    const violations = scanFile(filePath);
    
    if (violations.length > 0) {
      const relativePath = filePath.replace(rootDir + '/', '');
      const errors = violations.filter(v => v.severity === 'error');
      const warnings = violations.filter(v => v.severity === 'warn');
      
      totalErrors += errors.length;
      totalWarnings += warnings.length;
      
      results.push({
        file: relativePath,
        violations
      });
    }
  }
  
  // Print results
  if (results.length === 0) {
    console.log('✅ No Tailwind patterns found! Codebase is clean.\n');
    process.exit(0);
  }
  
  console.log(`Found issues in ${results.length} file(s):\n`);
  
  for (const { file, violations } of results) {
    console.log(`📄 ${file}`);
    
    for (const v of violations) {
      const icon = v.severity === 'error' ? '❌' : '⚠️';
      console.log(`   ${icon} Line ${v.line}: ${v.pattern}`);
      console.log(`      Match: "${v.match}"`);
      console.log(`      Context: ${v.lineContent}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files with issues: ${results.length}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    console.log(`\n❌ Scan failed with ${totalErrors} error(s).`);
    console.log('   See docs/UTILITIES.md for migration guidance.\n');
    process.exit(1);
  } else {
    console.log(`\n⚠️  Scan passed with ${totalWarnings} warning(s).`);
    console.log('   Consider addressing warnings for cleaner code.\n');
    process.exit(0);
  }
}

main();
