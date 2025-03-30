/**
 * Main function to export trial users to spreadsheet
 * This connects the Firebase trial user lookup with the spreadsheet export
 * Prevents duplicates by checking for existing user IDs
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
    
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Check if the sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`📝 Creating new sheet: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Create headers in a new sheet
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
      
      // Add filtering to headers
      sheet.getRange(1, 1, 1, headers.length).createFilter();
      
      // Freeze the header row
      sheet.setFrozenRows(1);
    }
    
    // Define headers for reference
    const headers = [
      "User ID", 
      "Email", 
      "Name", 
      "Trial Start Date", 
      "Days on Trial",
      "Export Date"
    ];
    
    // Get existing data to check for duplicates
    const existingData = sheet.getDataRange().getValues();
    // Remove header row
    const existingDataWithoutHeader = existingData.length > 1 ? existingData.slice(1) : [];
    
    // Create a map of existing user IDs to their row indices (0-based, relative to data without header)
    const existingUserIdMap = new Map();
    existingDataWithoutHeader.forEach((row, index) => {
      if (row[0]) { // User ID is in the first column
        existingUserIdMap.set(row[0], index);
      }
    });
    
    // Prepare data rows and track which users need to be added vs updated
    const newUserRows = [];
    const updatedUserRows = [];
    
    users.forEach(user => {
      const startDate = new Date(user.trialStartDate);
      const rowData = [
        user.userId,
        user.email,
        user.name,
        startDate,
        user.daysOnTrial,
        new Date() // Export date
      ];
      
      if (existingUserIdMap.has(user.userId)) {
        // User exists - store data and row index for updating
        updatedUserRows.push({
          rowIndex: existingUserIdMap.get(user.userId) + 2, // +2 because: +1 for header, +1 for 1-based indexing
          data: rowData
        });
      } else {
        // New user - add to new users array
        newUserRows.push(rowData);
      }
    });
    
    // Update existing users
    Logger.log(`🔄 Updating ${updatedUserRows.length} existing users`);
    updatedUserRows.forEach(update => {
      sheet.getRange(update.rowIndex, 1, 1, headers.length).setValues([update.data]);
    });
    
    // Add new users
    if (newUserRows.length > 0) {
      Logger.log(`➕ Adding ${newUserRows.length} new users`);
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, newUserRows.length, headers.length).setValues(newUserRows);
    }
    
    // Format date columns throughout the sheet
    const dataRowCount = sheet.getLastRow() - 1; // Subtract header row
    if (dataRowCount > 0) {
      // Format Trial Start Date column (column 4)
      sheet.getRange(2, 4, dataRowCount, 1).setNumberFormat("yyyy-mm-dd");
      // Format Export Date column (column 6)
      sheet.getRange(2, 6, dataRowCount, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    }
    
    // Auto-resize columns to fit content
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    Logger.log(`✅ Successfully processed ${users.length} users (${newUserRows.length} new, ${updatedUserRows.length} updated)`);
    
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