/**
 * Pushes a JSON entry to both Firebase responses table and Google Spreadsheet for a specific UUID.
 *
 * @param {Object} jsonData - The JSON data to be saved.
 * @param {string} uuid - The unique identifier for the entry.
 * @returns {Object} - Returns status object with Firebase and Spreadsheet results.
 */
function pushEntryToFirebaseAndSheets(jsonData, uuid) {
    Logger.log("pushEntryToFirebaseAndSheets: Sanitizing JSON before saving...");
    const sanitizedData = sanitizeJsonKeys(jsonData); // Clean keys before saving
    
    // Add UUID to the data for spreadsheet tracking
    sanitizedData.uuid = uuid;
    
    // Add timestamp if not already present
    if (!sanitizedData.timestamp) {
        sanitizedData.timestamp = new Date().toISOString();
    }
    
    Logger.log("pushEntryToFirebaseAndSheets data:", JSON.stringify(sanitizedData));
    
    // Results object to track both operations
    const results = {
        firebase: false,
        spreadsheet: false,
        errors: []
    };
    
    // 1. Push to Firebase
    try {
        const firebaseResult = pushToFirebase(sanitizedData, uuid);
        results.firebase = firebaseResult.success;
        if (!firebaseResult.success) {
            results.errors.push("Firebase: " + firebaseResult.error);
        }
    } catch (e) {
        Logger.log("Error in Firebase push: " + e.message);
        results.errors.push("Firebase exception: " + e.message);
    }
    
    // 2. Save to Google Spreadsheet
    try {
        const sheetResult = saveToSpreadsheet(sanitizedData);
        results.spreadsheet = sheetResult.success;
        if (!sheetResult.success) {
            results.errors.push("Spreadsheet: " + sheetResult.error);
        }
    } catch (e) {
        Logger.log("Error in Spreadsheet save: " + e.message);
        results.errors.push("Spreadsheet exception: " + e.message);
    }
    
    Logger.log("Push operation completed. Firebase: " + results.firebase + ", Spreadsheet: " + results.spreadsheet);
    return results;
}

/**
 * Pushes data to Firebase
 * 
 * @param {Object} sanitizedData - The sanitized data to save
 * @param {string} uuid - The unique identifier
 * @returns {Object} - Status object with success flag and error message if any
 */
function pushToFirebase(sanitizedData, uuid) {
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase authentication failed. No token received.");
        return { success: false, error: "Authentication failed" };
    }
    
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${token}`;
    
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData),
        muteHttpExceptions: true
    };
    
    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const responseCode = response.getResponseCode();
        
        if (responseCode >= 200 && responseCode < 300) {
            Logger.log("Entry successfully saved to Firebase.");
            return { success: true };
        } else {
            const errorMsg = "Firebase error: " + response.getContentText();
            Logger.log(errorMsg);
            return { success: false, error: errorMsg };
        }
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Saves data to Google Spreadsheet
 * 
 * @param {Object} data - The data to save
 * @returns {Object} - Status object with success flag and error message if any
 */
function saveToSpreadsheet(data) {
    // The ID of your spreadsheet
    const spreadsheetId = "1clfDpgLCHA0bvRjlWmvAX9yeXMqlX58KQaKHe4A2lUw";
    const sheetName = "Responses"; // Change this to your preferred sheet name
    
    try {
        // Open the spreadsheet and get the appropriate sheet
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        let sheet = spreadsheet.getSheetByName(sheetName);
        
        // If the sheet doesn't exist, create it
        if (!sheet) {
            sheet = spreadsheet.insertSheet(sheetName);
            
            // Create header row - we'll extract all keys from the data object for this
            const headers = Object.keys(data);
            
            // Move uuid to the first column if it exists
            if (headers.includes("uuid")) {
                headers.splice(headers.indexOf("uuid"), 1);
                headers.unshift("uuid");
            }
            
            // Add the headers to the first row
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
            sheet.setFrozenRows(1);
        }
        
        // Get the existing headers from the sheet
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Prepare the row data based on the sheet's headers
        const rowData = headers.map(header => {
            // If the data contains this field, use it, otherwise leave blank
            if (header in data) {
                const value = data[header];
                
                // Convert objects to JSON strings for storage
                if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
                    return JSON.stringify(value);
                }
                
                return value;
            }
            return "";
        });
        
        // Append the data to the sheet
        sheet.appendRow(rowData);
        
        // Auto-resize columns to fit the data
        sheet.autoResizeColumns(1, headers.length);
        
        Logger.log("Entry successfully saved to Google Spreadsheet.");
        return { success: true };
    } catch (e) {
        Logger.log("Error saving entry to Google Spreadsheet: " + e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Legacy function for backward compatibility
 */
function pushEntryToFirebase(jsonData, uuid) {
    const result = pushEntryToFirebaseAndSheets(jsonData, uuid);
    // Return true if Firebase save was successful, for backward compatibility
    return result.firebase;
}