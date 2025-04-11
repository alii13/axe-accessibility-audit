import { type Page, type BrowserContext } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

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
  if (tags.includes("wcag2aaa")) return "AAA";
  if (tags.includes("wcag2aa")) return "AA";
  if (tags.includes("wcag2a")) return "A";
  return "N/A";
}

function generateFilename(url: string, extension: string): string {
  // Remove protocol (http:// or https://)
  let filename = url.replace(/^https?:\/\//, "");
  // Remove trailing slash
  filename = filename.replace(/\/$/, "");
  // Replace special characters with dashes
  filename = filename.replace(/[^a-zA-Z0-9]/g, "-");
  return `accessibility-results-${filename}.${extension}`;
}

function escapeCSV(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  // If the field contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
  if (
    stringField.includes('"') ||
    stringField.includes(",") ||
    stringField.includes("\n")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

function generateMetadataSection(metadata: TestMetadata): string {
  const orientationInfo =
    metadata.testEnvironment.orientationAngle !== undefined
      ? `${metadata.testEnvironment.orientationType} (${metadata.testEnvironment.orientationAngle}°)`
      : metadata.testEnvironment.orientationType;

  return [
    "Test Information",
    `Test Engine,${escapeCSV(`${metadata.testEngine.name} v${metadata.testEngine.version}`)}`,
    `Test Runner,${escapeCSV(metadata.testRunner.name)}`,
    `Test URL,${escapeCSV(metadata.url)}`,
    `Timestamp,${escapeCSV(metadata.timestamp)}`,
    "",
    "Environment Information",
    `User Agent,${escapeCSV(metadata.testEnvironment.userAgent)}`,
    `Window Size,${escapeCSV(`${metadata.testEnvironment.windowWidth}x${metadata.testEnvironment.windowHeight}`)}`,
    `Orientation,${escapeCSV(orientationInfo || "N/A")}`,
    "",
    "Test Results",
    "",
  ].join("\n");
}

export async function runAccessibilityTest(url: string, page: Page) {
  try {
    console.log("Running accessibility test...");

    try {
      // Navigate to URL
      console.log("Waiting for page to fully load...");

      await Promise.all([
        page.waitForURL(url, { waitUntil: "networkidle" }),
        page.goto(url),
      ]);

      // Wait 8 seconds for the page to be fully loaded
      // await page.waitForTimeout(8000);

      // Run accessibility test
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      // Extract metadata
      const metadata: TestMetadata = {
        testEngine: accessibilityScanResults.testEngine,
        testRunner: accessibilityScanResults.testRunner,
        testEnvironment: accessibilityScanResults.testEnvironment,
        timestamp: accessibilityScanResults.timestamp,
        url: accessibilityScanResults.url,
      };

      // Process violations
      const violations: AccessibilityResult[] =
        accessibilityScanResults.violations.map((violation) => ({
          impact: violation.impact,
          description: violation.description,
          helpUrl: violation.helpUrl,
          helpText: violation.help,
          nodes: violation.nodes.map((node) => ({
            html: node.html,
            target: node.target.join(", "),
            failureSummary: node.failureSummary,
          })),
          rule: violation.id,
          wcagLevel: getWCAGLevel(violation.tags),
        }));

      // Create results directory if it doesn't exist
      const resultsDir = path.join(process.cwd(), "results");
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
      }

      // Generate filenames based on URL
      const csvFilename = generateFilename(url, "csv");
      const jsonFilename = generateFilename(url, "json");

      // Save results to CSV file
      const csvPath = path.join(resultsDir, csvFilename);
      const headers = [
        "Rule ID",
        "Impact",
        "WCAG Level",
        "Description",
        "Help Text",
        "Help URL",
        "HTML Element",
        "Target",
        "Failure Summary",
      ];
      const csvHeader = headers.map(escapeCSV).join(",") + "\n";

      // Create CSV rows for violations only
      const violationRows = violations.flatMap((violation) =>
        violation.nodes.map((node) =>
          [
            violation.rule,
            violation.impact || "N/A",
            violation.wcagLevel,
            violation.description,
            violation.helpText,
            violation.helpUrl,
            node.html,
            node.target,
            node.failureSummary || "N/A",
          ]
            .map(escapeCSV)
            .join(","),
        ),
      );

      // Combine metadata and violations in CSV
      const metadataSection = generateMetadataSection(metadata);
      const csvRows = violationRows.join("\n");
      fs.writeFileSync(csvPath, metadataSection + csvHeader + csvRows);
      console.log(`Accessibility test results saved to: ${csvPath}`);

      // Also save a detailed JSON report with only violations
      const jsonPath = path.join(resultsDir, jsonFilename);
      const jsonReport = {
        ...accessibilityScanResults,
        passes: [],
        incomplete: [],
      };
      fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
      console.log(`Detailed JSON report saved to: ${jsonPath}`);

      // Print summary to console
      console.log("\nAccessibility Test Summary:");
      console.log(`Total violations found: ${violations.length}`);

      console.log("\nViolations by impact:");
      const impactCounts = violations.reduce(
        (acc, v) => {
          const impact = v.impact || "unknown";
          acc[impact] = (acc[impact] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(impactCounts).forEach(([impact, count]) => {
        console.log(`${impact}: ${count}`);
      });

      console.log("\nViolations by WCAG Level:");
      const wcagCounts = violations.reduce(
        (acc, v) => {
          const level = v.wcagLevel;
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(wcagCounts).forEach(([level, count]) => {
        console.log(`${level}: ${count}`);
      });

      console.log("\nFailed Rules:");
      const uniqueFailedRules = [...new Set(violations.map((v) => v.rule))];
      console.log(`Total unique rules failed: ${uniqueFailedRules.length}`);

      return {
        violations,
        summary: {
          violationCount: violations.length,
          uniqueFailedRules: uniqueFailedRules.length,
        },
      };
    } finally {
      // Close only the page, not the entire browser
      //      await page.close();
    }
  } catch (error) {
    console.error("Error running accessibility test:", error);
    throw error;
  }
}

