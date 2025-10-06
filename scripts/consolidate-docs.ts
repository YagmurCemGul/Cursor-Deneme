#!/usr/bin/env node
/**
 * Documentation Consolidation Script
 * Merges all markdown files into single DOCUMENTATION.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DocSection {
  title: string;
  anchor: string;
  content: string[];
}

const sections: DocSection[] = [
  { title: 'Project Overview', anchor: 'project-overview', content: [] },
  { title: 'Quick Start', anchor: 'quick-start', content: [] },
  { title: 'Features', anchor: 'features', content: [] },
  { title: 'Architecture', anchor: 'architecture', content: [] },
  { title: 'Configuration & Permissions', anchor: 'configuration-permissions', content: [] },
  { title: 'AI Providers & Models', anchor: 'ai-providers-models', content: [] },
  { title: 'ATS Platforms & Adapters', anchor: 'ats-platforms-adapters', content: [] },
  { title: 'UI Components', anchor: 'ui-components', content: [] },
  { title: 'Security & Privacy', anchor: 'security-privacy', content: [] },
  { title: 'QA & Testing', anchor: 'qa-testing', content: [] },
  { title: 'CI/CD & Release', anchor: 'cicd-release', content: [] },
  { title: 'Chrome Web Store Listing', anchor: 'chrome-web-store-listing', content: [] },
  { title: 'Troubleshooting', anchor: 'troubleshooting', content: [] },
  { title: 'Development Guide', anchor: 'development-guide', content: [] },
  { title: 'Migration Notes', anchor: 'migration-notes', content: [] },
];

const docMap: { [key: string]: string } = {};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function categorizeContent(filename: string, content: string): number {
  const lower = filename.toLowerCase();
  
  // Quick Start
  if (lower.includes('quick') || lower.includes('setup') || lower.includes('install') || lower.includes('kurulum')) {
    return 1;
  }
  // Features
  if (lower.includes('feature') || lower.includes('ozellik') || lower.includes('implementation')) {
    return 2;
  }
  // Architecture
  if (lower.includes('architecture') || lower.includes('structure') || lower.includes('design')) {
    return 3;
  }
  // Config
  if (lower.includes('config') || lower.includes('permission') || lower.includes('manifest')) {
    return 4;
  }
  // AI
  if (lower.includes('ai_') || lower.includes('openai') || lower.includes('gemini') || lower.includes('provider')) {
    return 5;
  }
  // ATS
  if (lower.includes('ats') || lower.includes('merge_completion')) {
    return 6;
  }
  // UI
  if (lower.includes('ui') || lower.includes('popup') || lower.includes('newtab') || lower.includes('component')) {
    return 7;
  }
  // Security/Privacy
  if (lower.includes('security') || lower.includes('privacy')) {
    return 8;
  }
  // Testing
  if (lower.includes('test') || lower.includes('qa') || lower.includes('verification')) {
    return 9;
  }
  // CI/CD
  if (lower.includes('ci_cd') || lower.includes('deployment') || lower.includes('release')) {
    return 10;
  }
  // Store Listing
  if (lower.includes('store_listing') || lower.includes('store')) {
    return 11;
  }
  // Troubleshooting
  if (lower.includes('troubleshoot') || lower.includes('error') || lower.includes('fix') || lower.includes('sorun')) {
    return 12;
  }
  // Developer Guide
  if (lower.includes('developer') || lower.includes('guide') || lower.includes('reference')) {
    return 13;
  }
  // Migration
  if (lower.includes('migration') || lower.includes('upgrade') || lower.includes('changelog')) {
    return 14;
  }
  
  // Default to features
  return 2;
}

function processMarkdownFile(filepath: string) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const filename = path.basename(filepath);
  const relativePath = path.relative(process.cwd(), filepath);
  
  console.log(`Processing: ${relativePath}`);
  
  // Determine section
  const sectionIndex = categorizeContent(filename, content);
  const section = sections[sectionIndex];
  
  // Add source reference
  section.content.push(`\n### ${filename.replace('.md', '')}\n`);
  section.content.push(`*Source: \`${relativePath}\`*\n\n`);
  section.content.push(content);
  section.content.push('\n---\n');
  
  // Add to doc map
  docMap[relativePath] = `#${section.anchor}`;
}

function generateTOC(): string {
  let toc = '## Table of Contents\n\n';
  sections.forEach((section, index) => {
    toc += `${index + 1}. [${section.title}](#${section.anchor})\n`;
  });
  toc += '\n---\n\n';
  return toc;
}

function generateChangelog(): string {
  try {
    const log = execSync('git log --pretty=format:"- %h %ad %s" --date=short -n 50', { encoding: 'utf-8' });
    return `## Changelog\n\n${log}\n\n---\n\n`;
  } catch (error) {
    return `## Changelog\n\n*Unable to generate changelog*\n\n---\n\n`;
  }
}

function generateDocMap(): string {
  let map = '## Documentation Map\n\n';
  map += '*Original files → New locations in this document*\n\n';
  
  const sortedPaths = Object.keys(docMap).sort();
  sortedPaths.forEach(filepath => {
    map += `- \`${filepath}\` → [${docMap[filepath]}](${docMap[filepath]})\n`;
  });
  
  return map;
}

function main() {
  console.log('📚 Starting documentation consolidation...\n');
  
  // Find all markdown files (excluding node_modules, archive, README, LICENSE)
  const files = execSync(
    'find . -type f -name "*.md" -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./extension/node_modules/*" -not -path "./backend/node_modules/*" -not -path "./archive/*" -not -name "README.md" -not -name "LICENSE" -not -name "DOCUMENTATION.md"',
    { encoding: 'utf-8' }
  )
    .split('\n')
    .filter(f => f.trim().length > 0);
  
  console.log(`Found ${files.length} documentation files\n`);
  
  // Process each file
  files.forEach(file => {
    try {
      processMarkdownFile(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
  
  // Build final document
  let finalDoc = '# AI CV & Cover Letter Optimizer - Complete Documentation\n\n';
  finalDoc += '*Generated: ' + new Date().toISOString() + '*\n\n';
  finalDoc += '*This document consolidates all project documentation into a single reference.*\n\n';
  finalDoc += generateTOC();
  
  // Project Overview
  finalDoc += `## Project Overview\n\n`;
  finalDoc += `**AI CV & Cover Letter Optimizer** is a unified Chrome Extension (MV3) that combines:\n\n`;
  finalDoc += `- **CV Optimization**: AI-powered resume optimization with ATS scoring\n`;
  finalDoc += `- **ATS Auto-Fill**: Automatic form filling on major job application platforms\n\n`;
  finalDoc += `### Turkish / Türkçe\n\n`;
  finalDoc += `**AI CV & Niyet Mektubu Optimize Edici** şunları içeren birleşik bir Chrome Eklentisidir:\n\n`;
  finalDoc += `- **CV Optimizasyonu**: ATS puanlama ile yapay zeka destekli özgeçmiş optimizasyonu\n`;
  finalDoc += `- **ATS Otomatik Doldurma**: Büyük iş başvuru platformlarında otomatik form doldurma\n\n`;
  finalDoc += `---\n\n`;
  
  // Add all sections
  sections.forEach(section => {
    if (section.content.length > 0) {
      finalDoc += `## ${section.title}\n\n`;
      finalDoc += section.content.join('\n');
      finalDoc += '\n';
    }
  });
  
  // Add changelog
  finalDoc += generateChangelog();
  
  // Add doc map
  finalDoc += generateDocMap();
  
  // Write to DOCUMENTATION.md
  fs.writeFileSync('DOCUMENTATION.md', finalDoc);
  
  console.log('\n✅ Documentation consolidated successfully!');
  console.log(`📄 Output: DOCUMENTATION.md (${finalDoc.length} characters)`);
  console.log(`📊 Sections: ${sections.filter(s => s.content.length > 0).length}/${sections.length}`);
  console.log(`🗺️  Doc map entries: ${Object.keys(docMap).length}`);
}

main();
