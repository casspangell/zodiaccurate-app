/**
 * Main function to export trial users to spreadsheet
 * This connects the Firebase trial user lookup with the spreadsheet export
 * 
 * @param {string} spreadsheetId - Optional: ID of the spreadsheet (defaults to constant)
 * @param {string} sheetName - Optional: Name of the sheet to write to (defaults to "Expired")
 */
function exportExpiredTrialUsers(spreadsheetId, sheetName = "Expired") {
  Logger.log("🚀 Starting export of trial users to spreadsheet");

  // If spreadsheetId is not provided, use the constant
  if (!spreadsheetId) {
    try {
      spreadsheetId = EXPIRED_SPREADSHEET_ID;
      
      if (!spreadsheetId) {
        Logger.log("❌ No spreadsheet ID provided and EXPIRED_SPREADSHEET_ID is not defined");
        return;
      }
    } catch (error) {
      Logger.log(`❌ Error accessing spreadsheet ID: ${error.message}`);
      return;
    }
  }
  
  try {
    // Get users from Firebase using the synchronous function
    const users = getTrialUsersOverThirtyDays();
    
    if (!users || users.length === 0) {
      Logger.log("✅ No users found with trial=true for 30+ days.");
      return;
    }
    
    Logger.log(`📋 Found ${users.length} users with trial=true for 30+ days.`);
    
    // Now write these users to the spreadsheet
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Check if the sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`📝 Creating new sheet: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
    } else {
      Logger.log(`📝 Clearing existing sheet: ${sheetName}`);
      sheet.clear();
    }
    
    // Create headers
    const headers = [
      "User ID", 
      "Email", 
      "Name", 
      "Trial Start Date", 
      "Days on Trial",
      "Export Date"
    ];
    
    // Set headers in bold
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    
    // Format date columns (column 4 - Trial Start Date, column 6 - Export Date)
    if (users.length > 0) {
      sheet.getRange(2, 4, users.length, 1).setNumberFormat("yyyy-mm-dd");
      sheet.getRange(2, 6, users.length, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    }
    
    // Prepare data rows
    const dataRows = users.map(user => {
      const startDate = new Date(user.trialStartDate);
      return [
        user.userId,
        user.email,
        user.name,
        startDate,
        user.daysOnTrial,
        new Date() // Export date
      ];
    });
    
    // Write data to the sheet
    if (dataRows.length > 0) {
      sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
    }
    
    // Auto-resize columns to fit content
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    // Add filtering to headers
    sheet.getRange(1, 1, 1, headers.length).createFilter();
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
    Logger.log(`✅ Successfully wrote ${users.length} users to spreadsheet`);
    
  } catch (error) {
    Logger.log(`❌ Error in export process: ${error.message}`);
  }
}

/**
 * Creates a time-based trigger to run the export daily
 * Run this once to set up automatic daily exports
 */
function createDailyExportTrigger() {
  // Delete any existing triggers with the same function name
  const existingTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of existingTriggers) {
    if (trigger.getHandlerFunction() === 'exportExpiredTrialUsers') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Create a new trigger to run daily at 1am
  ScriptApp.newTrigger('exportExpiredTrialUsers')
    .timeBased()
    .atHour(1)
    .everyDays(1)
    .create();
    
  Logger.log('✅ Daily export trigger created successfully');
}

/**
 * Test function to verify the connection to the spreadsheet
 */
function testSpreadsheetConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(EXPIRED_SPREADSHEET_ID);
    Logger.log("✅ Successfully connected to spreadsheet: " + spreadsheet.getName());
    return true;
  } catch (error) {
    Logger.log("❌ Error connecting to spreadsheet: " + error.message);
    return false;
  }
}