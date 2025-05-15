import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import os

# Predefined category mapping
category_mapping = {
    'Airlines': 'Airfare/Transportation',
    'PAYROLL': 'Other Income',
    'Deposit': 'Transfer',
    'Transfer': 'Transfer',
    'Fee': 'Fees/Interest',
    'Tax': 'Taxes',
    'Thank You': 'CC Payment',
    'METER': 'Commute/Parking',
    'VENMO': 'Venmo/Zelle/Paypal',
    'Zelle': 'Venmo/Zelle/Paypal',
    'Restaurants & Bars': 'Dining',
    'Groceries': 'Groceries'
}

def process_categories(file_path):
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
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
        
        # Add new column with mapped categories
        df['New Category'] = df.apply(map_category, axis=1)
        
        # Save to new file
        output_path = os.path.splitext(file_path)[0] + '_processed.csv'
        df.to_csv(output_path, index=False)
        
        # Generate summary with amounts
        summary_df = df.groupby('New Category')['Amount'].agg(['count', 'sum']).round(2)
        summary_df.columns = ['Number of Transactions', 'Total Amount']
        summary = summary_df.to_string()
        
        return output_path, summary
        
    except Exception as e:
        raise Exception(f"An error occurred: {str(e)}")

class CategoryMapperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Category Mapper")
        self.root.geometry("800x600")
        
        # Configure style
        style = ttk.Style()
        style.configure('TButton', padding=10)
        style.configure('TLabel', padding=5)
        
        # Create main frame
        main_frame = ttk.Frame(root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(
            main_frame, 
            text="Transaction Category Mapper",
            font=('Helvetica', 20, 'bold')
        )
        title_label.pack(pady=10)
        
        # Description
        desc_label = ttk.Label(
            main_frame,
            text="Select a transaction CSV file to process categories",
            font=('Helvetica', 12)
        )
        desc_label.pack(pady=5)
        
        # Select file button
        self.select_button = ttk.Button(
            main_frame,
            text="Select CSV File",
            command=self.select_file
        )
        self.select_button.pack(pady=20)
        
        # Status text
        self.status_text = tk.Text(
            main_frame,
            height=20,
            width=70,
            font=('Courier', 12)
        )
        self.status_text.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
        self.status_text.config(state=tk.DISABLED)
        
    def update_status(self, message):
        self.status_text.config(state=tk.NORMAL)
        self.status_text.delete(1.0, tk.END)
        self.status_text.insert(tk.END, message)
        self.status_text.config(state=tk.DISABLED)
        self.root.update()
        
    def select_file(self):
        file_path = filedialog.askopenfilename(
            title="Select CSV File",
            filetypes=[("CSV files", "*.csv")]
        )
        
        if file_path:
            try:
                self.update_status(f"Processing file: {file_path}")
                
                output_path, summary = process_categories(file_path)
                
                success_message = f"""
File processed successfully!
Output saved as: {os.path.basename(output_path)}

Category Summary (with transaction counts and amounts):
{summary}
"""
                self.update_status(success_message)
                
            except Exception as e:
                self.update_status(f"Error: {str(e)}")
                messagebox.showerror("Error", str(e))

def main():
    root = tk.Tk()
    app = CategoryMapperApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 