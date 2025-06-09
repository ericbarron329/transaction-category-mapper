export async function extractValuesFromSheets(sheetUrl) {
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) throw new Error("Invalid Google Sheet URL");
  
    const sheetId = sheetIdMatch[1];
  
    const sheetNames = ["Data Input", "Net Worth", "Transactions Raw", 
        "Cash Flow", "Merchant Expense Analysis", "Assumptions", "Expenses", 
        "Positions", "Retirement Calculator", "Retirement Summary", "Investment Accounts", 
        "Education Accounts", "Education Summary", "New Home", "Term Life Calc"]; 
  
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

function cleanDollarAmount(value, roundDigits) {
    if (!value) return value;
    // Remove any existing dollar sign and spaces
    let cleaned = value.toString().replace(/\$|\s/g, '');
    
    if (roundDigits > 0) {
        // Convert to number
        let num = parseFloat(cleaned.replace(/,/g, ''));
        // Calculate the rounding factor (e.g., 10 for 1 digit, 100 for 2 digits)
        const roundFactor = Math.pow(10, roundDigits);
        // Round to the specified number of digits
        num = Math.round(num / roundFactor) * roundFactor;
        // Format with commas and add dollar sign
        return `$${num.toLocaleString()}`;
    }
    
    // If no rounding specified, just add back the dollar sign
    return `$${cleaned}`;
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
                    values["1"] = cleanDollarAmount(row[2], 3);
                }
                break;
            }
        }
        values["40"] = "$0";
        values["41"] = "$0";
        for (const row of netWorthData) {
            if (row[1] === "Retirement Assets") {
                if (row[2]) {
                    values["40"] = cleanDollarAmount(row[2], 2);
                }
            }
            if (row[1] === "Other Investments") {
                if (row[2]) {
                    values["41"] = cleanDollarAmount(row[2], 2);
                }
            }
        }
    }
    //END FINANCIAL GOALS

    if (data["Term Life Calc"]) {
        const termLifeCalcData = data["Term Life Calc"];
        // Get C10 (row 9, column 2) and round last 2 digits
        if (termLifeCalcData[9] && termLifeCalcData[9][2]) {
            values["43"] = cleanDollarAmount(termLifeCalcData[9][2], 2);
        }
        // Get F10 (row 9, column 5) and round last digit
        if (termLifeCalcData[9] && termLifeCalcData[9][5]) {
            values["44"] = cleanDollarAmount(termLifeCalcData[9][5], 1);
        }
    }

    // CASH FLOW
    if (data["Cash Flow"]) {
        const cashFlowData = data["Cash Flow"];
        let breakevenCount = 0;
        for (const row of cashFlowData) {
            if (row[1] === "Breakeven Point (Gross Income)") {
                breakevenCount++;
                if (row[3]) {
                    if (breakevenCount === 1) {
                        values["2"] = cleanDollarAmount(row[3], 0);
                    } else if (breakevenCount === 2) {
                        values["3"] = cleanDollarAmount(row[3], 0);
                    }
                }
                if (breakevenCount === 2) break;
            }
        }

        for (const row of cashFlowData) {
            if (row[1] === "Total W2 Income") {
                if (row[2]) {
                    values["4"] = cleanDollarAmount(row[3], 0);
                    values["5"] = cleanDollarAmount(row[5], 0);
                }
                break;
            }
        }

        let monthlySurplusCount = 0;
        for (const row of cashFlowData) {
            if (row[1] && row[1].includes("Projected Monthly Surplus")) {
                monthlySurplusCount++;
                if (monthlySurplusCount === 2) {  // Only process the second occurrence
                    if (row[2]) {
                        values["7"] = cleanDollarAmount(row[3], 2);

                        // Get the value from the next row
                        const currentIndex = cashFlowData.indexOf(row);
                        if (currentIndex + 1 < cashFlowData.length) {
                            const nextRow = cashFlowData[currentIndex + 1];
                            if (nextRow && nextRow[3]) {
                                values["9"] = cleanDollarAmount(nextRow[3], 0);
                            }
                        }
                    }
                    break;
                }
            }
        }

        let offSet = 0;
        for (const row of cashFlowData) {
            if (row[1] && row[1].includes("Projected Annual Surplus")) {
                offSet++;
                if (offSet === 2) {
                    values["8"] = cleanDollarAmount(row[3], 2);
                    break;
                }
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
                    values["11"] = row[5];
                }
                break;
            }
        }

        let monthlySurplusCount2 = 0;
        for (const row of cashFlowData) {
            if (row[1] && row[1].includes("Projected Monthly Surplus")) {
                monthlySurplusCount2++;
                if (monthlySurplusCount2 === 2) {  // Only process the second occurrence
                    if (row[3]) {
                        const hasParentheses = row[3].toString().includes('(');
                        values["22"] = cleanDollarAmount(row[3], 2);
                        values["21"] = hasParentheses ? "deficit" : "surplus";
                    }
                    break;
                }
            }
        }
    }

    if (data["Expenses"]) {
        const expensesData = data["Expenses"];
        for (let i = 0; i < expensesData.length; i++) {
            const row = expensesData[i];
            if (row[1] && row[1].includes("Total w/o")) {
                values["12"] = cleanDollarAmount(row[7], 2);
                if (i > 0) {
                    values["13"] = cleanDollarAmount(expensesData[i-1][7], 2);
                    values["14"] = cleanDollarAmount(expensesData[i-1][6], 2);
                }
                break;
            }
        }

        for (const row of expensesData) {
            if (row[1] === "Food") {
                values["15"] = cleanDollarAmount(row[7], 0);
            }
            if (row[1] === "Shopping") {
                values["16"] = cleanDollarAmount(row[7], 0);
            }
            if (row[1] === "Travel") {
                values["17"] = cleanDollarAmount(row[6], 0);
            }
            if (row[1] === "Entertainment") {
                values["18"] = cleanDollarAmount(row[7], 0);
            }
            if (row[1] === "Health / Personal Care") {
                values["19"] = cleanDollarAmount(row[7], 0);
            }
        }
    }

    if (data["Investment Accounts"]) {
        const investmentAccountsData = data["Investment Accounts"];

        let sum = 0;
        for (const row of investmentAccountsData) {
            if (row[1] === "Total") {
                values["20"] = cleanDollarAmount(row[2], 3);
            }
            // Check each cell in the row for "$1.00"
            for (let i = 0; i < row.length; i++) {
                if (row[i] === "$1.00" && i + 1 < row.length) {
                    // Get the value to the right and add it to sum
                    const valueToRight = row[i + 1];
                    if (valueToRight) {
                        // Remove any non-numeric characters except decimal point and minus sign
                        const numericValue = parseFloat(valueToRight.toString().replace(/[^0-9.-]+/g, "")) || 0;
                        sum += numericValue;
                    }
                }
            }
        }
        values["sum"] = cleanDollarAmount(sum.toString(), 0);
    }

    if (data["Net Worth"]) {
        const netWorthData = data["Net Worth"];
        for (const row of netWorthData) {
            if (row[1] === "Liquid Assets") {
                values["20"] = cleanDollarAmount(row[2], 0);
                // if (row[2] && row[2].toString().includes('(')) {
                //     values["21"] = "deficit";
                // } else {
                //     values["21"] = "surplus";
                // }
            }
        }

        for (const row of netWorthData) {
            // Find "Net Worth" in the first row
            if (netWorthData.indexOf(row) === 0) {
                const netWorthIndex = row.findIndex(cell => cell === "Net Worth");
                if (netWorthIndex !== -1) {
                    // Get all values after "Net Worth" until empty string or end
                    const valuesAfterNetWorth = row.slice(netWorthIndex + 1);
                    const concatenatedString = valuesAfterNetWorth
                        .filter(value => value !== '')
                        .join(', ');
                    
                    if (!values['list_main']) {
                        values['list_main'] = [];
                    }
                    values['list_main'].push(concatenatedString);
                }
                break; // We only need to process the first row
            }
        }

        for (const row of netWorthData) {
            if (row[1] === "Total Liabilities") {
                const liabilities = parseFloat(row[2].replace(/[^0-9.-]+/g, "")) || 0;
                if (values["temp_assets"]) { // If we already have Total Assets
                    const difference = values["temp_assets"] - liabilities;
                    values["23"] = cleanDollarAmount(difference.toLocaleString(), 0);
                } else {
                    values["temp_liabilities"] = liabilities;
                }
            }
            if (row[1] === "Mortgages") {
                const assets = parseFloat(row[2].replace(/[^0-9.-]+/g, "")) || 0;
                if (values["temp_liabilities"]) {
                    const difference = Math.abs(values["temp_liabilities"] - assets);
                    values["23"] = cleanDollarAmount(difference.toLocaleString(), 2);
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
                values["24"] = cleanDollarAmount(row[3], 2);
                values["26"] = cleanDollarAmount(row[2], 2);
                // Get the value from the next row
                const currentIndex = educationsSummaryData.indexOf(row);
                if (currentIndex + 1 < educationsSummaryData.length) {
                    const nextRow = educationsSummaryData[currentIndex + 1];
                    if (nextRow && nextRow[3]) {
                        values["25"] = cleanDollarAmount(nextRow[3], 2);
                        values["27"] = cleanDollarAmount(nextRow[2], 2);
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
                values["28"] = cleanDollarAmount(row[2], 2);
            }
        }

        for (const row of newHomeData) {
            if (row[1] === "Total Monthly Income") {
                values["29"] = cleanDollarAmount(row[10], 2);
                // Get the value from the next row
                const currentIndex = newHomeData.indexOf(row);
                if (currentIndex + 1 < newHomeData.length) {
                    const nextRow = newHomeData[currentIndex + 1];
                    if (nextRow && nextRow[10]) {
                        values["30"] = cleanDollarAmount(nextRow[10], 2);
                    }
                }
                break;
            }
        }

        for (const row of newHomeData) {
            if (row[1] === "Cost of Home") {
                values["32"] = cleanDollarAmount(row[3], 0);
                values["33"] = cleanDollarAmount(row[4], 0);
            }

            if (row[1] === "Loan Amount") {
                values["31"] = cleanDollarAmount(row[3], 0);
            }

            if (row[1] === "TOTAL") { 
                values["34"] = cleanDollarAmount(row[2], 2);
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
                values["36"] = cleanDollarAmount(row[2], 0);
            }

            if (row[1] && row[1].includes("Required Annual")) {
                values["37"] = cleanDollarAmount(row[2], 3);
            }
            if (row[1] && row[1].includes("Current Annual")) {
                values["38"] = cleanDollarAmount(row[2], 2);
            }
            if (row[1] && row[1].includes("Shortfall")) {
                values["39"] = cleanDollarAmount(row[2], 3);
            }
        }
    }

    console.log("Values: ", values);

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
        
        return { values, sheetData };
    } catch (error) {
        console.error('Error in document generation pipeline:', error);
        throw error;
    }
}
