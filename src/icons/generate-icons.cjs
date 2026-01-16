/**
 * Font Awesome Pro Icon Generator
 * 
 * This script generates TypeScript icon definitions from the FA Pro icons.json metadata.
 * Run with: node src/icons/generate-icons.cjs
 */

const fs = require('fs');
const path = require('path');

// Load the icons metadata
const iconsPath = path.join(__dirname, 'icons.json');
const icons = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));

// Map from Font Awesome icon names to our camelCase export names
// Format: 'fa-icon-name': ['faIconName', 'preferredStyle']
const iconMapping = {
  // Regular style icons (far)
  'house': ['faHome', 'regular'],
  'chart-bar': ['faChartBar', 'regular'],
  'credit-card': ['faCreditCard', 'regular'],
  'building': ['faBuilding', 'regular'],
  'envelope': ['faEnvelope', 'regular'],
  'file-lines': ['faFileText', 'regular'], // was file-text in older versions
  'bookmark': ['faBookmark', 'regular'],
  'bell': ['faBell', 'regular'],
  'user': ['faUser', 'regular'],
  'file': ['faFile', 'regular'],
  'calendar': ['faCalendar', 'regular'],
  'square': ['faSquare', 'regular'],
  'circle': ['faCircle', 'regular'],
  'circle-question': ['faCircleQuestion', 'regular'],
  'clock': ['faClock', 'regular'],
  'paper-plane': ['faPaperPlane', 'regular'],
  
  // Solid style icons (fas)
  'inbox': ['faInbox', 'solid'],
  'list': ['faList', 'solid'],
  'arrow-right-arrow-left': ['faArrowRightArrowLeft', 'solid'],
  'chart-line': ['faChartLine', 'solid'],
  'rotate-right': ['faRotateRight', 'solid'],
  'book-open': ['faBookOpen', 'solid'],
  'chevron-down': ['faChevronDown', 'solid'],
  'chevron-up': ['faChevronUp', 'solid'],
  'chevron-left': ['faChevronLeft', 'solid'],
  'chevron-right': ['faChevronRight', 'solid'],
  'layer-group': ['faLayerGroup', 'solid'],
  'palette': ['faPalette', 'solid'],
  'font': ['faFont', 'solid'],
  'magnifying-glass': ['faMagnifyingGlass', 'solid'],
  'xmark': ['faXmark', 'solid'],
  'globe': ['faGlobe', 'solid'],
  'building-columns': ['faBuildingColumns', 'solid'],
  'circle-user': ['faUserCircle', 'solid'], // was user-circle in older versions
  'arrow-trend-up': ['faArrowTrendUp', 'solid'],
  'arrow-trend-down': ['faArrowTrendDown', 'solid'],
  'right-left': ['faRightLeft', 'solid'],
  'plus': ['faPlus', 'solid'],
  'ellipsis': ['faEllipsis', 'solid'],
  'snowflake': ['faSnowflake', 'solid'],
  'pencil': ['faPencil', 'solid'],
  'copy': ['faCopy', 'solid'],
  'link': ['faLink', 'solid'],
  'circle-check': ['faCircleCheck', 'solid'],
  'greater-than-equal': ['faGreaterThanEqual', 'solid'],
  'dollar-sign': ['faDollarSign', 'solid'],
  'spinner': ['faSpinner', 'solid'],
  'gavel': ['faGavel', 'solid'],
  'paperclip': ['faPaperclip', 'solid'],
  'equals': ['faEquals', 'solid'],
  'less-than-equal': ['faLessThanEqual', 'solid'],
  'tag': ['faTag', 'regular'],
  'arrow-up': ['faArrowUp', 'solid'],
  'sort': ['faSort', 'solid'],
  'sliders': ['faSliders', 'solid'],
  'download': ['faDownload', 'solid'],
  'caret-down': ['faCaretDown', 'solid'],
  'check': ['faCheck', 'solid'],
  
  // Also try legacy names / university mapping
  'university': ['faUniversity', 'solid'], // might be building-columns now
};

// Find icon by name (checking aliases too)
function findIcon(iconName) {
  // Direct lookup
  if (icons[iconName]) {
    return { name: iconName, data: icons[iconName] };
  }
  
  // Search through all icons for alias matches
  for (const [name, data] of Object.entries(icons)) {
    if (data.aliases && data.aliases.names && data.aliases.names.includes(iconName)) {
      return { name, data };
    }
  }
  
  return null;
}

// Get style prefix
function getPrefix(style) {
  const prefixMap = {
    'solid': 'fas',
    'regular': 'far',
    'light': 'fal',
    'thin': 'fat',
    'duotone': 'fad',
  };
  return prefixMap[style] || 'fas';
}

// Generate icon definition
function generateIconDef(exportName, iconName, iconData, style) {
  const svg = iconData.svg[style];
  if (!svg) {
    console.warn(`  Warning: Style '${style}' not available for '${iconName}', trying 'solid'`);
    const fallbackSvg = iconData.svg['solid'];
    if (!fallbackSvg) {
      console.error(`  Error: No fallback style available for '${iconName}'`);
      return null;
    }
    return generateIconDef(exportName, iconName, iconData, 'solid');
  }
  
  const prefix = getPrefix(style);
  const width = svg.width;
  const height = svg.height;
  const unicode = iconData.unicode;
  const pathData = Array.isArray(svg.path) ? svg.path : svg.path;
  
  return {
    exportName,
    prefix,
    iconName,
    width,
    height,
    unicode,
    path: pathData,
  };
}

// Generate TypeScript output
function generateTypeScript(iconDefs) {
  let output = `/**
 * Font Awesome Pro 7.1.0 Icon Definitions
 * 
 * This file is auto-generated from the FA Pro metadata.
 * Run \`node src/icons/generate-icons.cjs\` to regenerate.
 * 
 * @fortawesome/fontawesome-pro License - Commercial License
 * Copyright 2025 Fonticons, Inc.
 */

import type { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';

// Helper to create icon definitions
function createIcon(
  prefix: IconPrefix,
  iconName: IconName,
  width: number,
  height: number,
  ligatures: string[],
  unicode: string,
  svgPathData: string | string[]
): IconDefinition {
  return {
    prefix,
    iconName,
    icon: [width, height, ligatures, unicode, svgPathData],
  };
}

`;

  // Group by prefix for organization
  const byPrefix = {};
  for (const def of iconDefs) {
    if (!byPrefix[def.prefix]) byPrefix[def.prefix] = [];
    byPrefix[def.prefix].push(def);
  }
  
  // Generate exports
  for (const [prefix, defs] of Object.entries(byPrefix)) {
    const prefixName = prefix === 'far' ? 'Regular' : prefix === 'fas' ? 'Solid' : prefix === 'fal' ? 'Light' : 'Other';
    output += `// ${prefixName} Style Icons (${prefix})\n`;
    
    for (const def of defs) {
      const pathStr = Array.isArray(def.path) 
        ? JSON.stringify(def.path)
        : `"${def.path}"`;
      
      output += `export const ${def.exportName}: IconDefinition = createIcon('${def.prefix}' as IconPrefix, '${def.iconName}' as IconName, ${def.width}, ${def.height}, [], '${def.unicode}', ${pathStr});\n`;
    }
    output += '\n';
  }
  
  // Add re-exports for compatibility
  output += `// Re-export types from fontawesome-svg-core for convenience
export type { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
`;

  return output;
}

// Main
function main() {
  console.log('Generating Font Awesome Pro icon definitions...\n');
  
  const iconDefs = [];
  const missing = [];
  
  for (const [faName, [exportName, style]] of Object.entries(iconMapping)) {
    const found = findIcon(faName);
    
    if (found) {
      console.log(`✓ Found '${faName}' (actual: '${found.name}') -> ${exportName}`);
      const def = generateIconDef(exportName, found.name, found.data, style);
      if (def) {
        iconDefs.push(def);
      }
    } else {
      console.log(`✗ Missing '${faName}' -> ${exportName}`);
      missing.push(faName);
    }
  }
  
  console.log(`\nGenerated ${iconDefs.length} icon definitions.`);
  if (missing.length > 0) {
    console.log(`Missing icons: ${missing.join(', ')}`);
  }
  
  // Write output
  const outputPath = path.join(__dirname, 'index.ts');
  const typescript = generateTypeScript(iconDefs);
  fs.writeFileSync(outputPath, typescript);
  console.log(`\nWritten to ${outputPath}`);
}

main();
