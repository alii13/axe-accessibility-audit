# Accessibility Test Results Processing Scripts

This repository contains two Python scripts for processing accessibility test results:

1. `combine_csv.py`: Combines multiple CSV files containing accessibility test results into a single Excel workbook
2. `extract_violations.py`: Extracts and consolidates accessibility violations from multiple CSV files into a single CSV file

## Prerequisites

1. Python 3.6 or higher installed on your system
2. pip (Python package installer)

## Installation Steps

1. First, create a virtual environment to avoid conflicts with system packages:

    ```bash
    python3 -m venv venv
    ```

2. Activate the virtual environment:

    - On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
    - On Windows:
        ```bash
        .\venv\Scripts\activate
        ```

3. Install required packages:
    ```bash
    pip install -r requirements.txt
    ```

## Directory Structure

Your directory should look like this:

```
.
├── results/
│   └── *.csv files
├── combine_csv.py
├── extract_violations.py
├── requirements.txt
└── README-script.md
```

## Running the Scripts

1. Make sure you are in the project directory:

    ```bash
    cd /path/to/axe-accessibility-audit
    ```

2. Run the scripts:
    ```bash
    # Combine CSV files into Excel
    python combine_csv.py
    
    # Extract violations into a single CSV
    python extract_violations.py
    ```

## Script Details

### combine_csv.py

This script:
- Processes all CSV files in the `results` directory
- Creates a new Excel file named `combined_accessibility_results.xlsx`
- Each CSV file becomes a sheet in the Excel workbook
- Sheet names are simplified versions of the CSV filenames
- Maintains section headers and formatting
- Prints progress as it processes each file

### extract_violations.py

This script:
- Processes all CSV files in the `results` directory
- Extracts accessibility violations from the "Test Results" section
- Excludes "nested-interactive" violations
- Creates a consolidated CSV file named `all_violations_except_nested_interactive.csv`
- Maintains the original column structure
- Prints progress as it processes each file

## Output Files

After successful execution, you will find:

1. `combined_accessibility_results.xlsx`:
    - Each sheet contains data from a corresponding CSV file
    - Section headers in bold with gray background
    - Data organized in sections with proper formatting
    - Empty rows between sections for better readability

2. `all_violations_except_nested_interactive.csv`:
    - Consolidated list of all accessibility violations
    - Excludes "nested-interactive" violations
    - Maintains original column structure
    - Useful for analyzing patterns in violations

## Troubleshooting

If you encounter any errors:

1. Make sure all required packages are installed:
    ```bash
    pip list | grep pandas
    pip list | grep xlsxwriter
    ```

2. Verify you're in the correct directory with the CSV files
3. Check if you have write permissions in the current directory
4. Ensure the CSV files are not currently open in another program
5. Verify that the CSV files follow the expected format with sections

## Notes

- The scripts expect CSV files to be in a specific format with sections
- Large CSV files may take longer to process
- The Excel sheet names are limited to 31 characters as per Excel's limitations
- The `extract_violations.py` script specifically looks for the "Test Results" section in each CSV file
