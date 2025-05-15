// Load the category mapping
const categoryMapping = {
    "Paychecks": "Paycheck",
    "Interest": "Fees/Interest",
    "Business Income": "Business Income",
    "Other Income": "Other Income",
    "Charity": "Charity",
    "Gifts": "Shopping - General",
    "Auto Payment": "Car Payment",
    "Public Transit": "Commute/Parking",
    "Gas": "Gas/Convenience Stores",
    "Auto Maintenance": "Automotive",
    "Parking & Tolls": "Commute/Parking",
    "Taxi & Ride Shares": "Taxi/Rideshare",
    "Mortgage": "Mortgage or Rent",
    "Rent": "Mortgage or Rent",
    "Home Improvement": "Home Improvement/Shopping",
    "Garbage": "Garbage",
    "Water": "Water",
    "Gas & Electric": "Gas and Electric",
    "Internet & Cable": "Internet",
    "Phone": "Phone",
    "Groceries": "Groceries",
    "Restaurants & Bars": "Restaurants/Delivery/Take Out",
    "Coffee Shops": "Restaurants/Delivery/Take Out",
    "Travel & Vacation": "Lodging",
    "Entertainment & Recreation": "Entertainment - General",
    "Personal": "Personal Care",
    "Pets": "Pets",
    "Fun Money": "Entertainment - General",
    "Shopping": "Shopping - General",
    "Clothing": "Clothing",
    "Furniture & Housewares": "Home Improvement/Shopping",
    "Electronics": "Electronics",
    "Child Care": "Aftercare/Childcare/Tuition",
    "Child Activities": "Kids Activities",
    "Student Loans": "Student Loans",
    "Education": "Education",
    "Medical": "Doctor/Medical",
    "Dentist": "Doctor/Medical",
    "Fitness": "Gym/Fitness",
    "Loan Repayment": "Debt Payment",
    "Financial & Legal Services": "Business Services",
    "Financial Fees": "Fees/Interest",
    "Cash & ATM": "Cash/ATM",
    "Insurance": "Insurance",
    "Taxes": "Taxes",
    "Uncategorized": "Unknown",
    "Check": "Checks",
    "Miscellaneous": "Unknown",
    "Advertising & Promotion": "Business Services",
    "Business Utilities & Communication": "Business Services",
    "Employee Wages & Contract Labor": "Business Services",
    "Business Travel & Meals": "Unknown",
    "Business Auto Expenses": "Unknown",
    "Business Insurance": "Unknown",
    "Office Supplies & Expenses": "Shopping - General",
    "Office Rent": "Unknown",
    "Postage & Shipping": "Business Services",
    "Transfer": "Transfer",
    "Credit Card Payment": "CC Payment",
    "Balance Adjustments": "Transfer"
};

// File input handling
const fileInput = document.getElementById('csvFile');
const fileName = document.getElementById('fileName');
const processButton = document.getElementById('processButton');
const summary = document.getElementById('summary');
const downloadLink = document.getElementById('downloadLink');

let fileData = null;

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        fileName.textContent = file.name;
        processButton.disabled = false;
        fileData = file;
    } else {
        console.log('No file selected');
        fileName.textContent = '';
        processButton.disabled = true;
        fileData = null;
    }
});

processButton.addEventListener('click', () => {
    console.log('Process button clicked');
    if (!fileData) {
        console.log('No file data available');
        return;
    }
    console.log('Processing file...');

    Papa.parse(fileData, {
        complete: processData,
        header: true,
        skipEmptyLines: true
    });
});

function processData(results) {
    console.log('Parse results:', results);
    
    if (results.errors.length > 0) {
        const errorMsg = 'Error processing file: ' + results.errors[0].message;
        console.error(errorMsg);
        summary.textContent = errorMsg;
        return;
    }

    const data = results.data;
    if (data.length === 0) {
        console.error('No data rows found in file');
        summary.textContent = 'Error: No data rows found in file';
        return;
    }

    console.log('CSV Headers:', Object.keys(data[0]));
    console.log('First row:', data[0]);
    
    // Process each row
    const processedData = data.map(row => {
        const category = row.Category?.trim() || '';
        const newCategory = categoryMapping[category] || category;
        console.log(`Mapping category: "${category}" -> "${newCategory}"`);
        return {
            ...row,
            'New Category': newCategory
        };
    });

    // Generate summary
    const categorySummary = {};
    processedData.forEach(row => {
        const category = row['New Category'];
        const amount = parseFloat(row.Amount) || 0;
        console.log(`Processing amount for ${category}: ${row.Amount} -> ${amount}`);
        
        if (!categorySummary[category]) {
            categorySummary[category] = {
                count: 0,
                total: 0
            };
        }
        
        categorySummary[category].count++;
        categorySummary[category].total += amount;
    });

    // Display summary
    let summaryText = 'Category Summary:\n\n';
    Object.entries(categorySummary)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, stats]) => {
            summaryText += `${category}:\n`;
            summaryText += `  Transactions: ${stats.count}\n`;
            summaryText += `  Total: $${stats.total.toFixed(2)}\n\n`;
        });
    
    console.log('Summary:', summaryText);
    summary.textContent = summaryText;

    // Create download link
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'processed_' + fileData.name;
    downloadLink.style.display = 'inline-block';
} 