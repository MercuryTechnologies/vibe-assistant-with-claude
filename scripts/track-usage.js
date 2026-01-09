#!/usr/bin/env node

/**
 * Component Usage Tracker
 * 
 * This script scans the codebase to find where each component is used
 * and updates the component-registry.json file.
 * 
 * Usage: node scripts/track-usage.js
 * 
 * Requirements: ripgrep (rg) installed on system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../src/components/component-registry.json');
const COMPONENTS = ['Header', 'AccountCard', 'TransactionRow'];

console.log('🔍 Tracking component usage...\n');

function findUsage(componentName) {
  try {
    // Use ripgrep to find imports of the component
    const command = `rg "${componentName}" --json --glob "!node_modules/**" --glob "!dist/**" --glob "!*.json"`;
    const output = execSync(command, { cwd: path.join(__dirname, '..'), encoding: 'utf-8' });
    
    const usages = [];
    const lines = output.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.type === 'match') {
          usages.push({
            file: data.data.path.text,
            line: data.data.line_number,
            context: data.data.lines.text.trim()
          });
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
    
    return usages.filter(u => !u.file.includes('component-registry.json'));
  } catch (error) {
    console.warn(`⚠️  Could not find usage for ${componentName}`);
    return [];
  }
}

function updateRegistry() {
  // Read existing registry
  let registry = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  }

  // Update usage for each component
  for (const componentName of COMPONENTS) {
    console.log(`Tracking ${componentName}...`);
    const usages = findUsage(componentName);
    
    if (registry.components && registry.components[componentName]) {
      registry.components[componentName].usedIn = usages;
      console.log(`  ✓ Found ${usages.length} usage(s)`);
    }
  }

  // Update metadata
  registry.metadata = {
    ...registry.metadata,
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  // Write back to file
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`\n✅ Registry updated at ${REGISTRY_PATH}`);
}

// Run
try {
  updateRegistry();
} catch (error) {
  console.error('❌ Error updating registry:', error.message);
  process.exit(1);
}
