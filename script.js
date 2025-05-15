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
        fileName.textContent = file.name;
        processButton.disabled = false;
        fileData = file;
    } else {
        fileName.textContent = '';
        processButton.disabled = true;
        fileData = null;
    }
});

processButton.addEventListener('click', () => {
    if (!fileData) return;

    Papa.parse(fileData, {
        complete: processData,
        header: true,
        skipEmptyLines: true
    });
});

function processData(results) {
    if (results.errors.length > 0) {
        summary.textContent = 'Error processing file: ' + results.errors[0].message;
        return;
    }

    const data = results.data;
    
    // Process each row
    const processedData = data.map(row => {
        const category = row.Category?.trim() || '';
        return {
            ...row,
            'New Category': categoryMapping[category] || category
        };
    });

    // Generate summary
    const categorySummary = {};
    processedData.forEach(row => {
        const category = row['New Category'];
        const amount = parseFloat(row.Amount) || 0;
        
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
    
    summary.textContent = summaryText;

    // Create download link
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'processed_' + fileData.name;
    downloadLink.style.display = 'inline-block';
} 