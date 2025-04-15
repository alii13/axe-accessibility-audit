import pandas as pd
import os
import csv

# Use results directory
directory = './results'  # Directory containing CSV files

def process_csv_for_violations(file_path):
    violations = []
    current_section = []
    in_violations_section = False
    headers = None
    
    with open(file_path, 'r') as f:
        csv_reader = csv.reader(f)
        for row in csv_reader:
            # Skip empty rows
            if not any(row):
                continue
                
            # Check if this is the Test Results section header
            if len(row) == 1 and row[0] == 'Test Results':
                in_violations_section = True
                continue
                
            # If we're in the violations section and this is a header row
            if in_violations_section and not headers and 'Rule ID' in row:
                headers = row
                continue
                
            # If we have headers and this is a data row
            if in_violations_section and headers and len(row) == len(headers):
                # Find the index of the Rule ID column
                rule_id_index = headers.index('Rule ID')
                # Only process if it's not a nested-interactive violation
                if row[rule_id_index] != 'nested-interactive':
                    violations.append(row)
    
    return headers, violations

# Create a list to store all violations
all_violations = []
headers = None

# Process all CSV files
for filename in sorted(os.listdir(directory)):
    if filename.endswith('.csv'):
        try:
            file_path = os.path.join(directory, filename)
            file_headers, file_violations = process_csv_for_violations(file_path)
            
            # Store headers from the first file that has them
            if not headers and file_headers:
                headers = file_headers
            
            # Add violations to our list
            all_violations.extend(file_violations)
            
            print(f'Processed: {filename}')
            
        except Exception as e:
            print(f'Error processing {filename}: {str(e)}')

# Create the output CSV file
output_file = 'all_violations_except_nested_interactive.csv'

# Write the consolidated violations to a new CSV file
if headers and all_violations:
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(all_violations)
    
    print(f'\nCreated {output_file} with {len(all_violations)} violations')
else:
    print('No violations found or no headers available') 