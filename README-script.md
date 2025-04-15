# CSV to Excel Converter

This script combines multiple CSV files containing accessibility test results into a single Excel workbook, with each CSV file becoming a separate sheet in the workbook.

## Prerequisites

1. Python 3.x installed on your system
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
    pip install pandas xlsxwriter
    ```

## Directory Structure

Your directory should look like this:

```
.
├── results/
│   ├── combine_csv.py
│   ├── README.md
│   └── *.csv files
```

## Running the Script

1. Make sure you are in the parent directory of the `results` folder:

    ```bash
    cd /path/to/axe-accessibility-test
    ```

2. Run the script:
    ```bash
    python3 results/combine_csv.py
    ```

The script will:

- Process all CSV files in the `results` directory
- Create a new Excel file named `combined_accessibility_results.xlsx`
- Each CSV file will become a sheet in the Excel workbook
- Sheet names will be simplified versions of the CSV filenames
- The script will print progress as it processes each file

## Output

After successful execution, you will find:

- A new file named `combined_accessibility_results.xlsx` in your current directory
- Each sheet in the Excel file will contain:
    - Section headers in bold with gray background
    - Data organized in sections with proper formatting
    - Empty rows between sections for better readability

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

## Notes

- The script expects CSV files to be in a specific format with sections
- Large CSV files may take longer to process
- The Excel sheet names are limited to 31 characters as per Excel's limitations
