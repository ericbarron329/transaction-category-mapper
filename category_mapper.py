import pandas as pd
import os

def load_category_mapping(mapping_file='cleaned_categories.csv'):
    # Read the mapping file
    mapping_df = pd.read_csv(mapping_file)
    # Convert to dictionary using Category as key and Assigned as value
    return dict(zip(mapping_df['Category'], mapping_df['Assigned']))

def process_categories(input_file='input.csv'):
    try:
        print(f"Reading file: {input_file}")
        # Read the CSV file
        df = pd.read_csv(input_file)
        
        # Load category mapping
        category_mapping = load_category_mapping()
        
        # Check if required columns exist
        required_columns = ['Category', 'Description']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Function to map categories
        def map_category(row):
            # First check if the category directly maps
            category = str(row['Category']).strip()
            if category in category_mapping:
                return category_mapping[category]
            
            # If no direct mapping, check the description
            description = str(row['Description']).upper()
            for key in category_mapping:
                if key.upper() in description:
                    return category_mapping[key]
            
            # If no mapping found, keep the original category
            return category
        
        print("Processing categories...")
        # Add new column with mapped categories
        df['New Category'] = df.apply(map_category, axis=1)
        
        # Save to new file
        output_file = 'output.csv'
        df.to_csv(output_file, index=False)
        print(f"\nFile processed successfully! Saved as: {output_file}")
        
        # Print summary of mappings
        summary = df.groupby('New Category').agg({
            'Amount': ['count', 'sum']
        }).round(2)
        summary.columns = ['Number of Transactions', 'Total Amount']
        print("\nCategory Summary:")
        print(summary.to_string())
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    process_categories() 