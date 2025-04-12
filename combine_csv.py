import pandas as pd
import os
import csv
import re

# Use results directory
directory = './results'  # Directory containing CSV files

def clean_sheet_name(name, used_names):
    # Remove invalid characters and common prefixes
    name = name.replace('accessibility-results-', '')
    # Replace invalid characters with underscore
    name = re.sub(r'[^a-zA-Z0-9]', '_', name)
    # Ensure name is not longer than 31 characters (Excel limitation)
    base_name = name[:31]
    
    # If name already exists, add a number
    final_name = base_name
    counter = 1
    while final_name in used_names:
        suffix = f'_{counter}'
        final_name = f"{base_name[:31-len(suffix)]}{suffix}"
        counter += 1
    
    return final_name

def process_csv(file_path):
    sections = []
    current_section = []
    current_section_name = None
    
    with open(file_path, 'r') as f:
        csv_reader = csv.reader(f)
        for row in csv_reader:
            # Skip empty rows
            if not any(row):
                if current_section:
                    sections.append((current_section_name, current_section))
                    current_section = []
                    current_section_name = None
            else:
                # If this is a section header
                if len(row) == 1:
                    if current_section:
                        sections.append((current_section_name, current_section))
                        current_section = []
                    current_section_name = row[0]
                else:
                    current_section.append(row)
        
        if current_section:
            sections.append((current_section_name, current_section))
    
    return sections

# Create a new Excel writer
with pd.ExcelWriter('combined_accessibility_results.xlsx', engine='xlsxwriter') as writer:
    used_sheet_names = set()
    # Process all CSV files
    for filename in sorted(os.listdir(directory)):
        if filename.endswith('.csv'):
            try:
                file_path = os.path.join(directory, filename)
                sections = process_csv(file_path)
                
                # Create unique sheet name
                sheet_name = clean_sheet_name(filename.replace('.csv', ''), used_sheet_names)
                used_sheet_names.add(sheet_name)
                
                current_row = 0
                
                # Process each section
                for section_name, section_data in sections:
                    if section_name:
                        # Write section header
                        df_header = pd.DataFrame([section_name])
                        df_header.to_excel(writer, sheet_name=sheet_name, startrow=current_row, header=False, index=False)
                        current_row += 1
                    
                    # Convert section data to DataFrame
                    if section_data:
                        df_section = pd.DataFrame(section_data)
                        df_section.to_excel(writer, sheet_name=sheet_name, startrow=current_row, header=False, index=False)
                        current_row += len(df_section) + 1  # Add empty row between sections
                    
                    # Format the worksheet
                    workbook = writer.book
                    worksheet = writer.sheets[sheet_name]
                    
                    # Add header formatting
                    header_format = workbook.add_format({
                        'bold': True,
                        'bg_color': '#D9D9D9'
                    })
                    if section_name:
                        worksheet.set_row(current_row - len(df_section) - 1, None, header_format)
                
                print(f'Processed: {filename}')
                
            except Exception as e:
                print(f'Error processing {filename}: {str(e)}')

print('Excel file has been created successfully!')
print(f'Total sheets created: {len(used_sheet_names)}') 