export async function extractValuesFromSheets(sheetUrl) {
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) throw new Error("Invalid Google Sheet URL");
  
    const sheetId = sheetIdMatch[1];
  
    const sheetNames = ["Data Input", "Net Worth", "Transactions Raw", 
        "Cash Flow", "Merchant Expense Analysis", "Assumptions", "Expenses", 
        "Positions", "Retirement Calculator", "Retirement Summary", "Investment Accounts", 
        "Education Accounts", "Education Summary", "New Home"]; 
  
    const results = {};
  
    for (const name of sheetNames) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
      const response = await fetch(csvUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch sheet: ${name}`);
        continue;
      }
  
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { skipEmptyLines: false });
      results[name] = parsed.data;
    }
    console.log(results);
    return results;
}

function processSheetData(data) {
    const values = {};
    
    // NET WORHT AND FINANCIAL GOALS
    if (data["Net Worth"]) {
        const netWorthData = data["Net Worth"];
        
        // Loop through all rows
        for (const row of netWorthData) {
            if (row[1] === "Net Worth") {
                if (row[2]) {
                    values["1"] = row[2];
                }
                break;
            }
        }

        for (const row of netWorthData) {
            if (row[1] === "Projected Monthly Surplus (deficit)") {
                if (row[2]) {
                    values["22"] = row[3];
                }
                break;
            }
        }
    }
    //END FINANCIAL GOALS

    // CASH FLOW
    if (data["Cash Flow"]) {
        const cashFlowData = data["Cash Flow"];
        let breakevenCount = 0;
        for (const row of cashFlowData) {
            if (row[1] === "Breakeven Point (Gross Income)") {
                breakevenCount++;
                if (row[2]) {
                    if (breakevenCount === 1) {
                        values["2"] = row[2];
                    } else if (breakevenCount === 2) {
                        values["3"] = row[2];
                    }
                }
                if (breakevenCount === 2) break;
            }
        }

        for (const row of cashFlowData) {
            if (row[1] === "Total W2 Income") {
                if (row[2]) {
                    values["4"] = row[2];
                    values["5"] = row[4];
                }
                break;
            }
        }

        for (const row of cashFlowData) {
            if (row[1] && row[1].includes("Projected Monthly Surplus")) {
                if (row[2]) {
                    values["7"] = row[2];

                    // Get the value from the next row
                    const currentIndex = cashFlowData.indexOf(row);
                    if (currentIndex + 1 < cashFlowData.length) {
                        const nextRow = cashFlowData[currentIndex + 1];
                        if (nextRow && nextRow[2]) {
                            values["9"] = nextRow[2];
                        }
                    }
                }
                break;
            }
        }
        // Check if the value contains parentheses to determine if it's a deficit
        if (values["7"] && values["7"].toString().includes("(")) {
            values["6"] = "deficit";
            values["10"] = "This deficit can be funded by bonus and other income.";
        } else {
            values["6"] = "surplus";
            values["10"] = "This surplus can be used to fund your financial goals.";
        }

        for (const row of cashFlowData) {
            if (row[1] === "Effective Tax Rate") {
                if (row[4]) {
                    values["11"] = row[4];
                }
                break;
            }
        }
    }

    if (data["Expenses"]) {
        const expensesData = data["Expenses"];
        for (let i = 0; i < expensesData.length; i++) {
            const row = expensesData[i];
            if (row[1] === "Total w/o Taxes & Travel") {
                values["12"] = row[7];
                if (i > 0) {
                    values["13"] = expensesData[i-1][7];
                    values["14"] = expensesData[i-1][6];
                }
                break;
            }
        }

        for (const row of expensesData) {
            if (row[1] === "Food") {
                values["15"] = row[7];
            }
            if (row[1] === "Shopping") {
                values["16"] = row[7];
            }
            if (row[1] === "Travel") {
                values["17"] = row[6];
            }
            if (row[1] === "Entertainment") {
                values["18"] = row[7];
            }
            if (row[1] === "Health / Personal Care") {
                values["19"] = row[7];
            }
        }


    }

    if (data["Net Worth"]) {
        const netWorthData = data["Net Worth"];
        for (const row of netWorthData) {
            if (row[1] === "Liquid Assets") {
                values["20"] = row[2];
                if (row[2] && row[2].toString().includes('(')) {
                    values["21"] = "deficit";
                } else {
                    values["21"] = "surplus";
                }
            }
        }

        for (const row of netWorthData) {
            // Skip header rows by checking if we're at D3 or beyond
            const currentIndex = netWorthData.indexOf(row);
            if (currentIndex >= 2) { // D3 starts at index 2
                // Start from column 3 (D) and go through all columns
                for (let col = 3; col < row.length; col++) {
                    let sum = 0;
                    // Sum all values from D3 down to current row for this column
                    for (let i = 2; i <= currentIndex; i++) {
                        const value = parseFloat(netWorthData[i][col]) || 0;
                        sum += value;
                    }
                    // Store the sum in values as "List_1" + number
                    values["List_1" + (23 + (col - 3))] = sum.toString();
                }
            }
        }

        for (const row of netWorthData) {
            if (row[1] === "Total Liabilities") {
                const liabilities = parseFloat(row[2].replace(/[^0-9.-]+/g, "")) || 0;
                if (values["temp_assets"]) { // If we already have Total Assets
                    const difference = liabilities - values["temp_assets"];
                    values["23"] = "$ " + difference.toLocaleString();
                } else {
                    values["temp_liabilities"] = liabilities;
                }
            }
            if (row[1] === "Total Assets") {
                const assets = parseFloat(row[2].replace(/[^0-9.-]+/g, "")) || 0;
                if (values["temp_liabilities"]) { // If we already have Total Liabilities
                    const difference = values["temp_liabilities"] - assets;
                    values["23"] = "$ " + difference.toLocaleString();
                } else {
                    values["temp_assets"] = assets;
                }
            }
        }
    }


    if (data["Education Summary"]) {
        const educationsSummaryData = data["Education Summary"];
        for (const row of educationsSummaryData) {
            if (row[1] === "Total Annual Contribution:") {
                values["24"] = row[3];
                values["26"] = row[2];
                // Get the value from the next row
                const currentIndex = educationsSummaryData.indexOf(row);
                if (currentIndex + 1 < educationsSummaryData.length) {
                    const nextRow = educationsSummaryData[currentIndex + 1];
                    if (nextRow && nextRow[3]) {
                        values["25"] = nextRow[3];
                        values["27"] = nextRow[2];
                    }
                }
                break;
            }
        }
    }

    if (data["New Home"]) {
        const newHomeData = data["New Home"];
        for (const row of newHomeData) {
            if (row[1] && row[1].includes("Monthly Surplus")) {
                values["28"] = row[2];
            }
        }

        for (const row of newHomeData) {
            if (row[1] === "Total Monthly Income") {
                values["29"] = row[10];
                // Get the value from the next row
                const currentIndex = newHomeData.indexOf(row);
                if (currentIndex + 1 < newHomeData.length) {
                    const nextRow = newHomeData[currentIndex + 1];
                    if (nextRow && nextRow[10]) {
                        values["30"] = nextRow[10];
                    }
                }
                break;
            }
        }

        for (const row of newHomeData) {
            if (row[1] === "Cost of Home") {
                values["32"] = row[3];
                values["33"] = row[4];
            }

            if (row[1] === "Loan Amount") {
                values["31"] = row[3];
            }

            if (row[1] === "TOTAL") { 
                values["34"] = row[2];
            }
        }
    }

    if (data["Retirement Summary"]) {
        const retirementSummaryData = data["Retirement Summary"];
        for (const row of retirementSummaryData) {
            if (row[1] === "Retirement Age") {
                values["35"] = row[2];
            }
            if (row[1] === "Lump Sum Required For Retirement In Today's Dollars") {
                values["36"] = row[2];
            }

            if (row[1] && row[1].includes("Required Annual")) {
                values["37"] = row[2];
            }
            if (row[1] && row[1].includes("Current Annual")) {
                values["38"] = row[2];
            }
        }
    }

    

    return values;
}

export async function fillDocxWithValues(values) {
    // Fetch the template file
    const response = await fetch('../templates/templateFile.docx');
    if (!response.ok) {
        throw new Error('Failed to fetch template file');
    }
    
    // Get the file as ArrayBuffer (binary data)
    const arrayBuffer = await response.arrayBuffer();
    
    // Create a new instance of PizZip
    const zip = new PizZip(arrayBuffer);
    
    // Create a new instance of Docxtemplater
    const doc = new docxtemplater();
    doc.loadZip(zip);
    
    // Set the template data with our values
    doc.setData(values);
    
    try {
        // Render the document
        doc.render();
    } catch (error) {
        console.error('Error rendering document:', error);
        throw error;
    }
    
    // Get the output as a zip file
    const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    
    // Create download link
   
    const url = window.URL.createObjectURL(out);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedReport.docx';
    a.click();
    window.URL.revokeObjectURL(url);
}

export async function generateDocument(sheetUrl) {
    try {
        // Step 1: Extract data from sheets
        const sheetData = await extractValuesFromSheets(sheetUrl);
        
        // Step 2: Process the data into our value map
        const values = processSheetData(sheetData);
        
        // Step 3: Generate the document with our values
        await fillDocxWithValues(values);
        
        return true;
    } catch (error) {
        console.error('Error in document generation pipeline:', error);
        throw error;
    }
}
