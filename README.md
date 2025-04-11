# Axe Accessibility Test

This project runs accessibility tests using axe-core and Playwright, generating detailed reports in CSV and JSON formats.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the test:

```bash
npm test
```

## Output

The test generates two files in the `results` directory:

- `accessibility-results.csv`: Tab-separated values file containing all test results
- `accessibility-results.json`: Detailed JSON report

### CSV Format

The CSV file contains the following columns:

1. Result Type (Pass/Violation/Incomplete)
2. Rule ID
3. Impact
4. WCAG Level (A/AA/AAA)
5. Description
6. Help Text
7. Help URL
8. HTML Element
9. Target
10. Failure Summary

### Google Sheets Formatting

To better visualize the results in Google Sheets:

1. Import the CSV file using tab as delimiter
2. Apply conditional formatting:
    - Apply to range: A:J
    - Format rules > Custom formula is: =$A1="Pass"
    - Formatting style: Fill color > Light green
    - Repeat for "Violation" (red) and "Incomplete" (yellow)

## Features

- Tests WCAG 2.0 Levels A, AA, and AAA
- Interactive browser testing with manual page load confirmation
- Comprehensive reporting of passes, violations, and incomplete tests
- Detailed console summary with impact and WCAG level statistics
