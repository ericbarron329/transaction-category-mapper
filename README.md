# Transaction Category Mapping Tool

A versatile tool for mapping financial transactions to standardized categories, available in both Python script and web-based versions.

## Features

- Automated category mapping for financial transactions
- Support for CSV file processing
- Configurable category mappings via `cleaned_categories.csv`
- Two implementation options:
  - Python script with command-line interface
  - Web-based interface with browser-side processing

## Project Structure

```
jessepythonscript/
├── Python Version
│   ├── category_mapper.py       # Core Python implementation
│   ├── category_mapper_gui.py   # PyQt5 GUI implementation (deprecated)
│   ├── requirements.txt         # Python dependencies
│   └── test_gui.py             # GUI tests
├── Web Version
│   ├── index.html              # Web interface
│   ├── styles.css              # CSS styling
│   └── script.js               # JavaScript implementation
└── Data
    └── cleaned_categories.csv   # Category mapping definitions
```

## Setup and Usage

### Python Version

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the script:
   ```bash
   python category_mapper.py input.csv output.csv
   ```

### Web Version

1. Open `index.html` in a web browser
2. Upload your transaction CSV file
3. Download the processed file with mapped categories

## Category Mapping

The tool supports various financial categories including:
- Income (Paychecks, Interest, etc.)
- Expenses (Groceries, Utilities, etc.)
- Financial Transactions (Transfers, Credit Card Payments)
- Business Expenses

Category mappings are defined in `cleaned_categories.csv` and can be customized as needed.

## Testing

Sample test files are included:
- `test.csv`: Input test data
- `test_processed.csv`: Example of processed output

## Notes

- The web version uses Papa Parse for CSV processing
- All processing is done client-side in the web version
- The PyQt5 GUI version is deprecated due to macOS display issues 