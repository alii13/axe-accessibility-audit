import { type Page, type BrowserContext } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface AccessibilityResult {
  impact: string | null | undefined;
  description: string;
  helpUrl: string;
  helpText: string;
  nodes: {
    html: string;
    target: string;
    failureSummary: string | undefined;
  }[];
  rule: string;
  wcagLevel: string;
}

interface TestMetadata {
  testEngine: {
    name: string;
    version: string;
  };
  testRunner: {
    name: string;
  };
  testEnvironment: {
    userAgent: string;
    windowWidth: number;
    windowHeight: number;
    orientationAngle?: number;
    orientationType?: string;
  };
  timestamp: string;
  url: string;
}

function getWCAGLevel(tags: string[]): string {
  if (tags.includes('wcag2aaa')) return 'AAA';
  if (tags.includes('wcag2aa')) return 'AA';
  if (tags.includes('wcag2a')) return 'A';
  return 'N/A';
}

function generateFilename(url: string, extension: string): string {
  // Remove protocol (http:// or https://)
  let filename = url.replace(/^https?:\/\//, '');
  // Remove trailing slash
  filename = filename.replace(/\/$/, '');
  // Replace special characters with dashes
  filename = filename.replace(/[^a-zA-Z0-9]/g, '-');
  return `accessibility-results-${filename}.${extension}`;
}

function escapeCSV(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  // If the field contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

function generateMetadataSection(metadata: TestMetadata): string {
  const orientationInfo = metadata.testEnvironment.orientationAngle !== undefined
    ? `${metadata.testEnvironment.orientationType} (${metadata.testEnvironment.orientationAngle}°)`
    : metadata.testEnvironment.orientationType;

  return [
    'Test Information',
    `Test Engine,${escapeCSV(`${metadata.testEngine.name} v${metadata.testEngine.version}`)}`,
    `Test Runner,${escapeCSV(metadata.testRunner.name)}`,
    `Test URL,${escapeCSV(metadata.url)}`,
    `Timestamp,${escapeCSV(metadata.timestamp)}`,
    '',
    'Environment Information',
    `User Agent,${escapeCSV(metadata.testEnvironment.userAgent)}`,
    `Window Size,${escapeCSV(`${metadata.testEnvironment.windowWidth}x${metadata.testEnvironment.windowHeight}`)}`,
    `Orientation,${escapeCSV(orientationInfo || 'N/A')}`,
    '',
    'Test Results',
    ''
  ].join('\n');
}

export async function runAccessibilityTest(url: string, context: BrowserContext) {
  try {
    console.log('Running accessibility test...');
    
    // Create a new page in the existing context
    const page = await context.newPage();
    
    try {
      // Navigate to URL
      await page.goto(url);
      console.log('Please confirm when the page is fully loaded...');
      
      // Wait for user confirmation before proceeding
      await new Promise(resolve => {
        process.stdin.once('data', () => {
          resolve(true);
        });
      });

      // Run accessibility test
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
        .analyze();
      
      // Extract metadata
      const metadata: TestMetadata = {
        testEngine: accessibilityScanResults.testEngine,
        testRunner: accessibilityScanResults.testRunner,
        testEnvironment: accessibilityScanResults.testEnvironment,
        timestamp: accessibilityScanResults.timestamp,
        url: accessibilityScanResults.url
      };

      // Process violations
      const violations: AccessibilityResult[] = accessibilityScanResults.violations.map(violation => ({
        impact: violation.impact,
        description: violation.description,
        helpUrl: violation.helpUrl,
        helpText: violation.help,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          target: node.target.join(', '),
          failureSummary: node.failureSummary
        })),
        rule: violation.id,
        wcagLevel: getWCAGLevel(violation.tags)
      }));

      // Process passes
      const passes: AccessibilityResult[] = accessibilityScanResults.passes.map(pass => ({
        impact: 'N/A',
        description: pass.description,
        helpUrl: pass.helpUrl,
        helpText: pass.help,
        nodes: pass.nodes.map(node => ({
          html: node.html,
          target: node.target.join(', '),
          failureSummary: undefined
        })),
        rule: pass.id,
        wcagLevel: getWCAGLevel(pass.tags)
      }));

      // Process incomplete tests with impact
      const incomplete: AccessibilityResult[] = accessibilityScanResults.incomplete
        .filter(inc => inc.impact)
        .map(inc => ({
          impact: inc.impact,
          description: inc.description,
          helpUrl: inc.helpUrl,
          helpText: inc.help,
          nodes: inc.nodes.map(node => ({
            html: node.html,
            target: node.target.join(', '),
            failureSummary: node.failureSummary
          })),
          rule: inc.id,
          wcagLevel: getWCAGLevel(inc.tags)
        }));

      // Create results directory if it doesn't exist
      const resultsDir = path.join(process.cwd(), 'results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
      }
      
      // Generate filenames based on URL
      const csvFilename = generateFilename(url, 'csv');
      const jsonFilename = generateFilename(url, 'json');
      
      // Save results to CSV file
      const csvPath = path.join(resultsDir, csvFilename);
      const headers = [
        'Result Type',
        'Rule ID',
        'Impact',
        'WCAG Level',
        'Description',
        'Help Text',
        'Help URL',
        'HTML Element',
        'Target',
        'Failure Summary'
      ];
      const csvHeader = headers.map(escapeCSV).join(',') + '\n';
      
      // Create CSV rows
      const violationRows = violations.flatMap(violation => 
        violation.nodes.map(node => 
          [
            'Violation',
            violation.rule,
            violation.impact || 'N/A',
            violation.wcagLevel,
            violation.description,
            violation.helpText,
            violation.helpUrl,
            node.html,
            node.target,
            node.failureSummary || 'N/A'
          ].map(escapeCSV)
          .join(',')
        )
      );
      
      const passRows = passes.flatMap(pass => 
        pass.nodes.map(node => 
          [
            'Pass',
            pass.rule,
            pass.impact,
            pass.wcagLevel,
            pass.description,
            pass.helpText,
            pass.helpUrl,
            node.html,
            node.target,
            'N/A'
          ].map(escapeCSV)
          .join(',')
        )
      );

      const incompleteRows = incomplete.flatMap(inc => 
        inc.nodes.map(node => 
          [
            'Incomplete',
            inc.rule,
            inc.impact || 'N/A',
            inc.wcagLevel,
            inc.description,
            inc.helpText,
            inc.helpUrl,
            node.html,
            node.target,
            node.failureSummary || 'N/A'
          ].map(escapeCSV)
          .join(',')
        )
      );
      
      // Combine metadata and test results in CSV
      const metadataSection = generateMetadataSection(metadata);
      const csvRows = [...violationRows, ...incompleteRows, ...passRows].join('\n');
      fs.writeFileSync(csvPath, metadataSection + csvHeader + csvRows);
      console.log(`Accessibility test results saved to: ${csvPath}`);
      
      // Also save a detailed JSON report
      const jsonPath = path.join(resultsDir, jsonFilename);
      fs.writeFileSync(jsonPath, JSON.stringify(accessibilityScanResults, null, 2));
      console.log(`Detailed JSON report saved to: ${jsonPath}`);
      
      // Print summary to console
      console.log('\nAccessibility Test Summary:');
      console.log(`Total checks performed: ${passes.length + violations.length + incomplete.length}`);
      console.log(`Passes: ${passes.length}`);
      console.log(`Violations: ${violations.length}`);
      console.log(`Incomplete (with impact): ${incomplete.length}`);
      
      console.log('\nIssues by impact:');
      const allIssues = [...violations, ...incomplete];
      const impactCounts = allIssues.reduce((acc, v) => {
        const impact = v.impact || 'unknown';
        acc[impact] = (acc[impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(impactCounts).forEach(([impact, count]) => {
        console.log(`${impact}: ${count}`);
      });

      console.log('\nIssues by WCAG Level:');
      const wcagCounts = allIssues.reduce((acc, v) => {
        const level = v.wcagLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(wcagCounts).forEach(([level, count]) => {
        console.log(`${level}: ${count}`);
      });

      console.log('\nPassed Rules:');
      const uniquePassedRules = [...new Set(passes.map(p => p.rule))];
      console.log(`Total unique rules passed: ${uniquePassedRules.length}`);

      console.log('\nFailed Rules:');
      const uniqueFailedRules = [...new Set([...violations, ...incomplete].map(v => v.rule))];
      console.log(`Total unique rules failed: ${uniqueFailedRules.length}`);
      
      return {
        violations,
        passes,
        incomplete,
        summary: {
          totalChecks: passes.length + violations.length + incomplete.length,
          passCount: passes.length,
          violationCount: violations.length,
          incompleteCount: incomplete.length,
          uniquePassedRules: uniquePassedRules.length,
          uniqueFailedRules: uniqueFailedRules.length
        }
      };
    } finally {
      // Close only the page, not the entire browser
      await page.close();
    }
  } catch (error) {
    console.error('Error running accessibility test:', error);
    throw error;
  }
}