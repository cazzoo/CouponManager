#!/usr/bin/env node

/**
 * Script to extract Mermaid diagrams from Markdown files and generate PNG images
 * This allows diagrams to be viewed in environments that don't support Mermaid rendering
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOCS_DIR = path.join(path.resolve(), 'docs');
const DIAGRAMS_DIR = path.join(DOCS_DIR, 'diagrams');
const THEME = 'neutral'; // Theme for the generated diagrams

console.log('Starting diagram generation process...');

// Create diagrams directory if it doesn't exist
if (!fs.existsSync(DIAGRAMS_DIR)) {
  console.log(`Creating diagrams directory: ${DIAGRAMS_DIR}`);
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

// Find all md files in the docs directory
const docFiles = fs.readdirSync(DOCS_DIR).filter(file => file.endsWith('.md'));
console.log(`Found ${docFiles.length} Markdown files in docs directory`);

let totalDiagramsGenerated = 0;

docFiles.forEach(file => {
  const filePath = path.join(DOCS_DIR, file);
  console.log(`Processing file: ${file}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract Mermaid code blocks
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
    let match;
    let diagramCount = 0;
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      const mermaidCode = match[1].trim();
      const fileBaseName = file.replace('.md', '');
      const outputFile = path.join(DIAGRAMS_DIR, `${fileBaseName}-diagram-${diagramCount}.png`);
      
      // Write temp mermaid file
      const tempFile = path.join(process.cwd(), 'temp.mmd');
      fs.writeFileSync(tempFile, mermaidCode);
      
      // Generate PNG
      try {
        console.log(`Generating diagram ${diagramCount + 1} from ${file}`);
        execSync(`npx mmdc -i ${tempFile} -o ${outputFile} -t ${THEME}`, { stdio: 'inherit' });
        diagramCount++;
        totalDiagramsGenerated++;
      } catch (error) {
        console.error(`Error generating diagram for ${file}:`, error.message);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }
    
    console.log(`Generated ${diagramCount} diagrams from ${file}`);
    
    // If diagrams were found, update the markdown to include image references
    if (diagramCount > 0) {
      // This is optional - only uncomment if you want to automatically add image links
      // let updatedContent = content;
      // for (let i = 0; i < diagramCount; i++) {
      //   const diagramRef = `\n\n![Diagram ${i+1}](./diagrams/${file.replace('.md', '')}-diagram-${i}.png)\n`;
      //   const mermaidEnd = "```\n";
      //   const position = findNthOccurrence(updatedContent, mermaidEnd, i+1);
      //   if (position !== -1) {
      //     updatedContent = updatedContent.slice(0, position + mermaidEnd.length) + diagramRef + updatedContent.slice(position + mermaidEnd.length);
      //   }
      // }
      // fs.writeFileSync(filePath, updatedContent);
      // console.log(`Updated ${file} with image references`);
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error.message);
  }
});

console.log(`Diagram generation complete. Generated ${totalDiagramsGenerated} diagrams in total.`);

/**
 * Find the nth occurrence of a substring in a string
 * @param {string} string - The string to search in
 * @param {string} substring - The substring to find
 * @param {number} n - Which occurrence to find (1-based)
 * @returns {number} - The position of the nth occurrence, or -1 if not found
 */
function findNthOccurrence(string, substring, n) {
  let i = -1;
  
  while (n-- && i++ < string.length) {
    i = string.indexOf(substring, i);
    if (i < 0) break;
  }
  
  return i;
} 