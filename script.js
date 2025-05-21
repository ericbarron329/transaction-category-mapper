// Initialize mappings
let categoryMapping = {
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

let descriptionMapping = {};

// Load mappings from localStorage
function loadMappings() {
    const savedCategoryMappings = localStorage.getItem('categoryMapping');
    const savedDescriptionMappings = localStorage.getItem('descriptionMapping');
    
    if (savedCategoryMappings) {
        categoryMapping = JSON.parse(savedCategoryMappings);
    }
    if (savedDescriptionMappings) {
        descriptionMapping = JSON.parse(savedDescriptionMappings);
    }
    
    updateMappingTable();
    updateDescriptionTable();
}

// Function to save category mapping to localStorage
function saveMapping(original, newCategory) {
    categoryMapping[original] = newCategory;
    localStorage.setItem('categoryMapping', JSON.stringify(categoryMapping));
    updateMappingTable();
}

// Function to save description mapping to localStorage
function saveDescriptionMapping(original, newDescription) {
    descriptionMapping[original] = newDescription;
    localStorage.setItem('descriptionMapping', JSON.stringify(descriptionMapping));
    updateDescriptionTable();
}

// Function to delete category mapping from localStorage
function deleteMapping(original) {
    delete categoryMapping[original];
    localStorage.setItem('categoryMapping', JSON.stringify(categoryMapping));
    updateMappingTable();
}

// Function to delete description mapping from localStorage
function deleteDescriptionMapping(original) {
    delete descriptionMapping[original];
    localStorage.setItem('descriptionMapping', JSON.stringify(descriptionMapping));
    updateDescriptionTable();
}

// Function to update category mapping in localStorage
function updateMapping(original, newCategory) {
    categoryMapping[original] = newCategory;
    localStorage.setItem('categoryMapping', JSON.stringify(categoryMapping));
    updateMappingTable();
}

// Function to update description mapping in localStorage
function updateDescriptionMapping(original, newDescription) {
    descriptionMapping[original] = newDescription;
    localStorage.setItem('descriptionMapping', JSON.stringify(descriptionMapping));
    updateDescriptionTable();
}

// Function to handle adding new category mappings
function addNewMapping() {
    const original = prompt('Enter original category:');
    if (original) {
        const newCategory = prompt('Enter new category:');
        if (newCategory) {
            saveMapping(original, newCategory);
        }
    }
}

// Function to handle adding new description mappings
function addNewDescriptionMapping() {
    const original = prompt('Enter original description:');
    if (original) {
        const newDescription = prompt('Enter new description:');
        if (newDescription) {
            saveDescriptionMapping(original, newDescription);
        }
    }
}

// Function to handle editing category mappings
function editMapping(original, currentValue) {
    const newCategory = prompt(`Enter new value for ${original}:`, currentValue);
    if (newCategory !== null) {
        updateMapping(original, newCategory);
    }
}

// Function to handle editing description mappings
function editDescriptionMapping(original, currentValue) {
    const newDescription = prompt(`Enter new value for ${original}:`, currentValue);
    if (newDescription !== null) {
        updateDescriptionMapping(original, newDescription);
    }
}

// Function to update the category mapping table UI
function updateMappingTable() {
    const categoryTable = document.getElementById('categoryTable');
    
    categoryTable.innerHTML = `
        <tr>
            <th>Original Category</th>
            <th>New Category</th>
            <th>Actions</th>
        </tr>
    `;
    
    Object.entries(categoryMapping).forEach(([original, newCategory]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${original}</td>
            <td>${newCategory}</td>
            <td>
                <button onclick="editMapping('${original}', '${newCategory}')">Edit</button>
                <button onclick="deleteMapping('${original}')">Delete</button>
            </td>
        `;
        categoryTable.appendChild(row);
    });
}

// Function to update the description mapping table UI
function updateDescriptionTable() {
    const descriptionTable = document.getElementById('descriptionTable');
    
    descriptionTable.innerHTML = `
        <tr>
            <th>Original Description</th>
            <th>New Description</th>
            <th>Actions</th>
        </tr>
    `;
    
    Object.entries(descriptionMapping).forEach(([original, newDescription]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${original}</td>
            <td>${newDescription}</td>
            <td>
                <button onclick="editDescriptionMapping('${original}', '${newDescription}')">Edit</button>
                <button onclick="deleteDescriptionMapping('${original}')">Delete</button>
            </td>
        `;
        descriptionTable.appendChild(row);
    });
}

// Initialize the tables when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadMappings();
});

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
    if (data.length === 0) {
        summary.textContent = 'Error: No data rows found in file';
        return;
    }
    
    // Process each row
    const processedData = data.map(row => {
        const category = row.Category?.trim() || '';
        const description = row.Description?.trim() || '';
        
        // First apply category mapping
        let newCategory = categoryMapping[category] || category;
        
        // Partial, case-insensitive match for description mapping
        const descLower = description.toLowerCase();
        for (const [key, value] of Object.entries(descriptionMapping)) {
            if (key && descLower.includes(key.trim().toLowerCase())) {
                newCategory = value;
                break;
            }
        }
        
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
    let summaryText = 'Category Summary (Description mappings override category mappings, partial match):\n\n';
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