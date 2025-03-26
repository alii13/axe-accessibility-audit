import { chromium, type Page } from 'playwright';
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

function getWCAGLevel(tags: string[]): string {
  if (tags.includes('wcag2aaa')) return 'AAA';
  if (tags.includes('wcag2aa')) return 'AA';
  if (tags.includes('wcag2a')) return 'A';
  return 'N/A';
}

export async function runAccessibilityTest(url: string) {
  try {
    console.log('Running accessibility test...');
    
    // Launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
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
    
    // Save results to CSV file
    const csvPath = path.join(resultsDir, 'accessibility-results.csv');
    const csvHeader = 'Result Type\tRule ID\tImpact\tWCAG Level\tDescription\tHelp Text\tHelp URL\tHTML Element\tTarget\tFailure Summary\n';
    
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
        ].map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join('\t')
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
        ].map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join('\t')
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
        ].map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join('\t')
      )
    );
    
    const csvRows = [...violationRows, ...incompleteRows, ...passRows].join('\n');
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    console.log(`Accessibility test results saved to: ${csvPath}`);
    
    // Also save a detailed JSON report
    const jsonPath = path.join(resultsDir, 'accessibility-results.json');
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
    
    // Close browser
    await browser.close();
    
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
  } catch (error) {
    console.error('Error running accessibility test:', error);
    throw error;
  }
}