/**
 * Main function to export trial users to spreadsheet
 * This connects the Firebase trial user lookup with the spreadsheet export
 * Prevents duplicates by checking for existing user IDs
 * 
 * @param {string} spreadsheetId - Optional: ID of the spreadsheet (defaults to constant)
 * @param {string} sheetName - Optional: Name of the sheet to write to (defaults to "Expired")
 */
function exportExpiredTrialUsers() {
  Logger.log("🚀 Starting export of trial users to spreadsheet");

  const sheetName = "Expired";
  
  try {
    // Get users from Firebase using the synchronous function
    const users = getTrialUsersOverThirtyDays();
    
    Logger.log(`📋 Found ${users.length} users with trial=true for 30+ days.`);
    
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(GOOGLE_SPREADSHEET_ID);
    
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

      // Check if filter exists before creating one
      const hasFilter = sheet.getFilter() !== null;
      
      // Add filtering to headers only if no filter exists
      if (!hasFilter) {
        Logger.log("📋 Adding filter to headers");
        sheet.getRange(1, 1, 1, headers.length).createFilter();
      } else {
        Logger.log("📋 Filter already exists, skipping filter creation");
      }
      
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
 * Maps a user's subscription status from trial field to human-readable status
 * 
 * @param {Object} user - The user object containing trial and pendingCancellation fields
 * @returns {string} Human-readable subscription status
 */
function mapSubscriptionStatus(user) {
  if (user.trial === "subscribed") {
    return "Subscribed";
  } else if (user.trial === "canceled") {
    return "Canceled";
  } else if (user.trial === "true") {
    return "Trial";
  } else if (user.trial === "expired") {
    return "Expired";
  } else if (user.trial === "past_due") {
    return "Past Due";
  } else if (user.trial === "payment_issue") {
    return "Payment Issue";
  } else if (user.trial === "unpaid") {
    return "Unpaid";
  } else if (user.pendingCancellation === true) {
    return "Pending Cancellation";
  } else if (user.trial) {
    return user.trial; // Use whatever value is set
  }
  return "Unknown";
}

/**
 * Export all users to a Google Spreadsheet
 * This function runs weekly to maintain an up-to-date record of all users
 * 
 * @param {string} spreadsheetId - ID of the spreadsheet to export users to
 * @param {string} sheetName - Name of the sheet within the spreadsheet
 * @returns {Object} Status object with success flag and counts
 */
function exportAllUsersToSpreadsheet() {
  Logger.log("🚀 Starting export of all users to spreadsheet");

  const sheetName = "AllUsers";

  try {
    // Get all users from Firebase using our dedicated function
    const users = getAllUsersForExport();
    
    if (users.length === 0) {
      Logger.log("⚠️ No users found to export");
      return {
        success: true,
        totalProcessed: 0,
        newUsers: 0,
        updatedUsers: 0,
        message: "No users found to export"
      };
    }
    
    Logger.log(`📋 Found ${users.length} total users to export`);
    
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(GOOGLE_SPREADSHEET_ID);
    
    // Define headers for reference
    const headers = [
      "User ID", 
      "Email", 
      "Name", 
      "Trial Start Date", 
      "Subscription Status",
      "Last Updated",
      "Subscription ID",
      "Last Payment Date",
      "Cancellation Date"
    ];
    
    // Check if the sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`📝 Creating new sheet: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Always set headers in the first row and make them bold
    Logger.log("📋 Setting up headers in the sheet");
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
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
      // Skip users without a userId to ensure we can properly track duplicates
      if (!user.userId) {
        Logger.log(`⚠️ Skipping user with missing userId: ${user.email || "unknown email"}`);
        return;
      }
      
      // Format dates properly or use null if not available
      const trialStartDate = user.trialStartDate ? new Date(user.trialStartDate) : null;
      const lastPaymentDate = user.lastPaymentDate ? new Date(user.lastPaymentDate) : null;
      const cancellationDate = user.cancellationDate ? new Date(user.cancellationDate) : null;
      
      // Get subscription status using our dedicated function
      const subscriptionStatus = mapSubscriptionStatus(user);
      
      const rowData = [
        user.userId,
        user.email || "",
        user.name || "",
        trialStartDate,
        subscriptionStatus,
        new Date(), // Last updated timestamp
        user.subscriptionId || "",
        lastPaymentDate,
        cancellationDate
      ];
      
      // Check if user exists by ID
      if (existingUserIdMap.has(user.userId)) {
        // User exists by ID - store data and row index for updating
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
      // Format Last Updated column (column 6)
      sheet.getRange(2, 6, dataRowCount, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
      // Format Subscription ID column (column 7) as plain text
      sheet.getRange(2, 7, dataRowCount, 1).setNumberFormat("@");
      // Format Last Payment Date column (column 8)
      sheet.getRange(2, 8, dataRowCount, 1).setNumberFormat("yyyy-mm-dd");
      // Format Cancellation Date column (column 9)
      sheet.getRange(2, 9, dataRowCount, 1).setNumberFormat("yyyy-mm-dd");
    }
    
    // Auto-resize columns to fit content
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    Logger.log(`✅ Successfully processed ${users.length} users (${newUserRows.length} new, ${updatedUserRows.length} updated)`);
    
    // Return a result object with status and counts
    return {
      success: true,
      totalProcessed: users.length,
      newUsers: newUserRows.length,
      updatedUsers: updatedUserRows.length
    };
    
  } catch (error) {
    Logger.log(`❌ Error in export process: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main wrapper function to export all users to a spreadsheet
 * This function can be set up on a trigger for weekly exports
 * 
 * @param {string} spreadsheetId - Optional: ID of the spreadsheet (defaults to constant)
 * @param {string} sheetName - Optional: Name of the sheet to write to (defaults to "AllUsers")
 * @returns {Object} Status object with success flag and counts
 */
function exportAllUsers(spreadsheetId, sheetName = "AllUsers") {
  // If spreadsheetId is not provided, use the constant
  if (!spreadsheetId) {
    try {
      spreadsheetId = ALL_USERS_SPREADSHEET_ID;
      
      if (!spreadsheetId) {
        Logger.log("❌ No spreadsheet ID provided and ALL_USERS_SPREADSHEET_ID is not defined");
        return {
          success: false,
          error: "No spreadsheet ID provided"
        };
      }
    } catch (error) {
      Logger.log(`❌ Error accessing spreadsheet ID: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Call the actual export function with the spreadsheet ID
  return exportAllUsersToSpreadsheet(spreadsheetId, sheetName);
}


/**
 * Exports all form data to the Google Spreadsheet for test email
 * Only exports submissions with email "dahnworldhealer@yahoo.com" to the "Tests" sheet
 * Saves ALL form fields, not just basic user data
 * 
 * @param {string} uuid - The user's unique ID
 * @param {Object} userData - Basic user data (email, name, etc.)
 * @param {Object} formData - The complete form submission data
 * @returns {Object} Status object with success flag and message
 */
function exportFormDataToSpreadsheet(uuid, userData, formData) {
  Logger.log(`🚀 Exporting TEST form submission to spreadsheet: ${userData.name} (${uuid})`);

  // Validate required parameters
  if (!uuid || !userData) {
    Logger.log("❌ Missing required parameters for exporting user to spreadsheet");
    return {
      success: false,
      error: "Missing user ID or user data"
    };
  }

  // Check if the email matches the specific test email
  const userEmail = userData.email || "";
  
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(GOOGLE_SPREADSHEET_ID);
    const sheetName = "Tests"; // Specific sheet for test users
    
    // Define base fields in the desired order
    const baseFields = [
      "User ID", 
      "Email", 
      "Name", 
      "Subscription Status", 
      "Last Updated"
    ];
    
    // Create a new Set starting with base fields
    const allKeys = new Set(baseFields);
    
    // Collect all possible keys from both formData and userData
    if (formData) {
      Object.keys(formData).forEach(key => {
        const columnName = key.charAt(0).toUpperCase() + 
          key.slice(1).replace(/([A-Z])/g, ' $1').trim();
        if (!baseFields.includes(columnName)) {
          allKeys.add(columnName);
        }
      });
    }
    
    if (userData) {
      Object.keys(userData).forEach(key => {
        const columnName = key.charAt(0).toUpperCase() + 
          key.slice(1).replace(/([A-Z])/g, ' $1').trim();
        if (!baseFields.includes(columnName)) {
          allKeys.add(columnName);
        }
      });
    }
    
    // Convert to ordered array of headers, keeping base fields first
    const headers = [
      ...baseFields,
      ...[...allKeys].filter(key => !baseFields.includes(key))
    ];
    
    // Log the generated headers for debugging
    Logger.log("🔍 Generated Headers:", JSON.stringify(headers));
    
    // Check if the sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      Logger.log(`📝 Creating new sheet: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Always set headers in the first row and make them bold
    Logger.log("📋 Setting up headers in the sheet");
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold");
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
    // Map subscription status
    let subscriptionStatus = "Unknown";
    if (userData.trial === "true") {
      subscriptionStatus = "Trial";
    } else if (userData.trial === "subscribed") {
      subscriptionStatus = "Subscribed";
    } else if (userData.trial) {
      subscriptionStatus = userData.trial;
    }
    
    // Build the row data based on headers
    const rowData = new Array(headers.length).fill("");
    
    // Helper function to set a value in the row data array
    const setValue = (headerName, value) => {
      const index = headers.indexOf(headerName);
      if (index !== -1) {
        rowData[index] = value;
      }
    };
    
    // Set standard fields
    setValue("User ID", uuid);
    setValue("Email", userData.email || "");
    setValue("Name", userData.name || "");
    setValue("Subscription Status", subscriptionStatus);
    setValue("Last Updated", new Date());
    
    // Add all form data fields
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        // Convert keys to proper column names
        const columnName = key.charAt(0).toUpperCase() + 
          key.slice(1).replace(/([A-Z])/g, ' $1').trim();
        
        // Format date values
        if (
          key.toLowerCase().includes('date') && 
          value && 
          (typeof value === 'string' || value instanceof Date)
        ) {
          try {
            setValue(columnName, new Date(value));
          } catch (e) {
            setValue(columnName, value);
          }
        } else if (Array.isArray(value)) {
          // Join arrays with commas
          setValue(columnName, value.join(", "));
        } else {
          setValue(columnName, value);
        }
      });
    }
    
    // Add additional userData fields (these will overwrite form fields if duplicated)
    if (userData) {
      Object.entries(userData).forEach(([key, value]) => {
        // Convert keys to proper column names
        const columnName = key.charAt(0).toUpperCase() + 
          key.slice(1).replace(/([A-Z])/g, ' $1').trim();
        
        // Format date values
        if (
          key.toLowerCase().includes('date') && 
          value && 
          (typeof value === 'string' || value instanceof Date)
        ) {
          try {
            setValue(columnName, new Date(value));
          } catch (e) {
            setValue(columnName, value);
          }
        } else if (Array.isArray(value)) {
          // Join arrays with commas
          setValue(columnName, value.join(", "));
        } else {
          setValue(columnName, value);
        }
      });
    }
    
    // Log the row data for debugging
    Logger.log("🔍 Row Data:", JSON.stringify(rowData));
    
    // Add new row
    Logger.log(`➕ Adding new test data to spreadsheet`);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, headers.length).setValues([rowData]);
    const rowIndex = lastRow + 1;
    
    // Format date columns
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (
        header.toLowerCase().includes('date') || 
        header.toLowerCase().includes('updated')
      ) {
        // Format date column
        sheet.getRange(rowIndex, i + 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
      }
    }
    
    // Auto-resize columns to fit content
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    Logger.log(`✅ Successfully exported test form data to spreadsheet`);
    
    return {
      success: true,
      message: "Test data added to spreadsheet",
      rowIndex: rowIndex
    };
    
  } catch (error) {
    Logger.log(`❌ Error exporting test form data to spreadsheet: ${error.message}\n${error.stack}`);
    return {
      success: false,
      error: error.message
    };
  }
}