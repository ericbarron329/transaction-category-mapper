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
  
    return results;
}
