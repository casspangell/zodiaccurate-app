/**
 * Parses the response from ChatGPT API to extract and convert CSV data to JSON.
 * Improved to handle various markdown code block formats.
 *
 * @param {Object} responseData - The response object from ChatGPT API.
 * @returns {Array|null} - Array of objects representing the parsed data, or null if parsing failed.
 */
function parseResponseToJson(responseData) {
    try {
        // Extract the "content" field
        var content = responseData.choices[0].message.content;
        
        // Log the raw content for debugging
        Logger.log("Raw content from API response:");
        Logger.log(content.substring(0, 500) + "..."); // Log first 500 chars to avoid excessive logging
        
        // More flexible regex that handles various markdown CSV formats
        // This regex matches code blocks with or without language specifier and with different newline patterns
        var csvMatch = content.match(/```(?:csv)?\s*([\s\S]*?)\s*```/);
        
        if (!csvMatch || csvMatch.length < 2) {
            Logger.log("CSV data not found in the response - trying alternative patterns");
            
            // Try different markdown patterns
            csvMatch = content.match(/```\s*([\s\S]*?)\s*```/);
            
            if (!csvMatch || csvMatch.length < 2) {
                Logger.log("No code block found in response");
                
                // As a last resort, try to treat the entire content as CSV
                var lines = content.split('\n');
                if (lines.length >= 2 && lines[0].includes(',') && lines[1].includes(',')) {
                    Logger.log("Attempting to parse direct CSV without code blocks");
                    return parseDirectCSV(content);
                }
                return null;
            }
        }
        
        var csvContent = csvMatch[1].trim(); // Extract and trim the actual CSV content
        
        // Log the extracted CSV content
        Logger.log("Extracted CSV content:");
        Logger.log(csvContent);
        
        // Parse the CSV content using Utilities.parseCsv
        var rows = Utilities.parseCsv(csvContent);
        
        if (!rows || rows.length < 2) {
            Logger.log("CSV content has insufficient data or parsing failed.");
            Logger.log("Row count: " + (rows ? rows.length : 0));
            return null;
        }
        
        // Extract headers and rows
        var headers = rows[0]; // First row as headers
        var jsonData = [];
        
        // Log header information
        Logger.log("CSV Headers: " + headers.join(", "));
        
        for (var i = 1; i < rows.length; i++) {
            var rowData = rows[i];
            
            // Skip empty rows
            if (rowData.every(cell => !cell || cell.trim() === "")) {
                continue;
            }
            
            // Check if row has enough columns
            if (rowData.length < headers.length) {
                Logger.log("Warning: Row " + i + " has fewer columns than headers. Padding with empty values.");
                // Pad the row to match header length
                while (rowData.length < headers.length) {
                    rowData.push("");
                }
            }
            
            var rowObject = {};
            headers.forEach(function(header, index) {
                if (header && header.trim() !== "") {
                    // Clean up the header - remove quotes if present
                    const cleanHeader = header.replace(/^"(.*)"$/, '$1').trim();
                    rowObject[cleanHeader] = index < rowData.length ? rowData[index] || "" : "";
                    
                    // Clean up the value - remove quotes if present
                    if (typeof rowObject[cleanHeader] === 'string') {
                        rowObject[cleanHeader] = rowObject[cleanHeader].replace(/^"(.*)"$/, '$1');
                    }
                }
            });
            
            jsonData.push(rowObject);
        }
        
        // Log the parsed JSON data
        Logger.log("Parsed JSON Data:");
        Logger.log(JSON.stringify(jsonData, null, 2));
        
        // Return the JSON data
        return jsonData;
    } catch (error) {
        Logger.log("Error parsing response to JSON: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        return null;
    }
}

/**
 * Fallback parser for direct CSV content without markdown code blocks.
 * 
 * @param {string} content - The raw content string
 * @returns {Array|null} - Array of objects or null if parsing failed
 */
function parseDirectCSV(content) {
    try {
        var rows = Utilities.parseCsv(content);
        
        if (!rows || rows.length < 2) {
            Logger.log("Direct CSV parsing: insufficient data.");
            return null;
        }
        
        var headers = rows[0];
        var jsonData = [];
        
        for (var i = 1; i < rows.length; i++) {
            if (rows[i].every(cell => !cell || cell.trim() === "")) continue;
            
            var rowObject = {};
            headers.forEach(function(header, index) {
                if (header && header.trim() !== "") {
                    // Clean up the header - remove quotes if present
                    const cleanHeader = header.replace(/^"(.*)"$/, '$1').trim();
                    rowObject[cleanHeader] = index < rows[i].length ? rows[i][index] || "" : "";
                    
                    // Clean up the value - remove quotes if present
                    if (typeof rowObject[cleanHeader] === 'string') {
                        rowObject[cleanHeader] = rowObject[cleanHeader].replace(/^"(.*)"$/, '$1');
                    }
                }
            });
            
            jsonData.push(rowObject);
        }
        
        return jsonData;
    } catch (error) {
        Logger.log("Error in direct CSV parsing: " + error.message);
        return null;
    }
}

/**
 * Fallback parser for direct CSV content without markdown code blocks.
 * 
 * @param {string} content - The raw content string
 * @returns {Array|null} - Array of objects or null if parsing failed
 */
function parseDirectCSV(content) {
    try {
        var rows = Utilities.parseCsv(content);
        
        if (!rows || rows.length < 2) {
            Logger.log("Direct CSV parsing: insufficient data.");
            return null;
        }
        
        var headers = rows[0];
        var jsonData = [];
        
        for (var i = 1; i < rows.length; i++) {
            if (rows[i].every(cell => !cell || cell.trim() === "")) continue;
            
            var rowObject = {};
            headers.forEach(function(header, index) {
                if (header && header.trim() !== "") {
                    rowObject[header] = index < rows[i].length ? rows[i][index] || "" : "";
                }
            });
            
            jsonData.push(rowObject);
        }
        
        return jsonData;
    } catch (error) {
        Logger.log("Error in direct CSV parsing: " + error.message);
        return null;
    }
}
// function parseResponseToJson(responseData) {
//     try {
//         // Extract the "content" field
//         var content = responseData.choices[0].message.content;

//         // Extract the CSV portion from the markdown block
//         var csvMatch = content.match(/```csv\n([\s\S]*?)\n```/);
//         if (!csvMatch || csvMatch.length < 2) {
//             Logger.log("CSV data not found in the response.");
//             return null;
//         }

//         var csvContent = csvMatch[1]; // Extract the actual CSV content

//         // Parse the CSV content using Utilities.parseCsv
//         var rows = Utilities.parseCsv(csvContent);

//         if (rows.length < 2) {
//             Logger.log("CSV content has insufficient data.");
//             return null;
//         }

//         // Extract headers and rows
//         var headers = rows[0]; // First row as headers
//         var jsonData = [];

//         for (var i = 1; i < rows.length; i++) {
//             var rowData = rows[i];
//             var rowObject = {};

//             headers.forEach(function (header, index) {
//                 rowObject[header] = rowData[index] || ""; // Map headers to values
//             });

//             jsonData.push(rowObject);
//         }

//         // Log the parsed JSON data
//         Logger.log("Parsed JSON Data:");
//         Logger.log(JSON.stringify(jsonData, null, 2));

//         // Return the JSON data
//         return jsonData;
//     } catch (error) {
//         Logger.log("Error parsing response to JSON: " + error.message);
//         return null;
//     }
// }