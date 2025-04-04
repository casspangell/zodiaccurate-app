function parseResponseToJson(response) {
  try {
    // Extract the content from the ChatGPT response
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error("Invalid response structure:", JSON.stringify(response));
      return null;
    }
    
    const content = response.choices[0].message.content;
    
    // Log the raw content for debugging
    console.log("Raw CSV content from ChatGPT:");
    console.log(content);
    
    // First try to parse as regular CSV
    const regularParse = parseStandardCSV(content);
    if (regularParse && regularParse.length > 0) {
      return regularParse;
    }
    
    // If standard CSV parsing fails, try the alternate format parsing
    console.log("Standard CSV parsing failed. Trying alternate format parser...");
    return parseAlternateCSVFormat(content);
  } catch (error) {
    console.error("Error parsing CSV response:", error);
    return null;
  }
}

// Parse standard CSV with line breaks between rows
function parseStandardCSV(csvText) {
  try {
    const lines = csvText.trim().split('\n');
    
    // Check if we have enough lines (header + at least 1 data row)
    if (lines.length < 2) {
      console.log("Not enough lines for standard CSV format");
      return null;
    }
    
    // Extract header
    const header = lines[0].split(',');
    if (header.length < 2 || !header[0].includes('Category') || !header[1].includes('Content')) {
      console.log("CSV header is not in expected format:", header);
      return null;
    }
    
    // Parse each data row
    const result = [];
    
    // Skip the header (index 0) and process each data row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Use a proper CSV parsing logic to handle quoted fields
      const row = parseCSVLine(line);
      
      if (row.length >= 2) {
        result.push({
          Category: row[0],
          Content: row[1]
        });
      }
    }
    
    if (result.length > 0) {
      console.log(`Successfully parsed ${result.length} categories using standard CSV format`);
      return result;
    }
    
    return null;
  } catch (error) {
    console.log("Error in standard CSV parsing:", error);
    return null;
  }
}

// Helper function to properly parse CSV lines with quoted fields
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentField = '';
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      // Check if this is an escaped quote (double quote inside quoted field)
      if (i + 1 < line.length && line[i + 1] === '"' && inQuotes) {
        currentField += '"';
        i += 2; // Skip both quotes
        continue;
      }
      
      // Toggle quote state
      inQuotes = !inQuotes;
      i++;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      // End of field
      result.push(currentField);
      currentField = '';
      i++;
      continue;
    }
    
    // Add character to current field
    currentField += char;
    i++;
  }
  
  // Add the last field
  if (currentField.length > 0) {
    result.push(currentField);
  }
  
  return result;
}

// Parse the alternate format that ChatGPT sometimes returns
// Format: Category,Content "Category1","Content1" "Category2","Content2"
function parseAlternateCSVFormat(csvText) {
  try {
    // Remove markdown formatting if present
    let cleanedText = csvText;
    if (cleanedText.includes('```csv')) {
      cleanedText = cleanedText.replace(/```csv[\s\S]*?```/g, function(match) {
        return match.replace('```csv', '').replace('```', '').trim();
      });
    }
    
    // Check if it starts with the header
    if (!cleanedText.includes('Category,Content')) {
      console.log("CSV doesn't start with expected header");
      return null;
    }
    
    // Extract all category/content pairs using regex
    const pattern = /"([^"]+)","([^"]+)"/g;
    const matches = Array.from(cleanedText.matchAll(pattern));
    
    if (matches.length === 0) {
      console.log("No matches found with regex pattern");
      return null;
    }
    
    const result = matches.map(match => ({
      Category: match[1],
      Content: match[2]
    }));
    
    console.log(`Found ${result.length} categories using alternate format parsing`);
    result.forEach((item, i) => {
      console.log(`Category ${i+1}: ${item.Category}`);
    });
    
    return result;
  } catch (error) {
    console.log("Error in alternate format parsing:", error);
    return null;
  }
}

// /**
//  * Fallback parser for direct CSV content without markdown code blocks.
//  * 
//  * @param {string} content - The raw content string
//  * @returns {Array|null} - Array of objects or null if parsing failed
//  */
// function parseDirectCSV(content) {
//     try {
//         var rows = Utilities.parseCsv(content);
        
//         if (!rows || rows.length < 2) {
//             Logger.log("Direct CSV parsing: insufficient data.");
//             return null;
//         }
        
//         var headers = rows[0];
//         var jsonData = [];
        
//         for (var i = 1; i < rows.length; i++) {
//             if (rows[i].every(cell => !cell || cell.trim() === "")) continue;
            
//             var rowObject = {};
//             headers.forEach(function(header, index) {
//                 if (header && header.trim() !== "") {
//                     // Clean up the header - remove quotes if present
//                     const cleanHeader = header.replace(/^"(.*)"$/, '$1').trim();
//                     rowObject[cleanHeader] = index < rows[i].length ? rows[i][index] || "" : "";
                    
//                     // Clean up the value - remove quotes if present
//                     if (typeof rowObject[cleanHeader] === 'string') {
//                         rowObject[cleanHeader] = rowObject[cleanHeader].replace(/^"(.*)"$/, '$1');
//                     }
//                 }
//             });
            
//             jsonData.push(rowObject);
//         }
        
//         return jsonData;
//     } catch (error) {
//         Logger.log("Error in direct CSV parsing: " + error.message);
//         return null;
//     }
// }

// /**
//  * Fallback parser for direct CSV content without markdown code blocks.
//  * 
//  * @param {string} content - The raw content string
//  * @returns {Array|null} - Array of objects or null if parsing failed
//  */
// function parseDirectCSV(content) {
//     try {
//         var rows = Utilities.parseCsv(content);
        
//         if (!rows || rows.length < 2) {
//             Logger.log("Direct CSV parsing: insufficient data.");
//             return null;
//         }
        
//         var headers = rows[0];
//         var jsonData = [];
        
//         for (var i = 1; i < rows.length; i++) {
//             if (rows[i].every(cell => !cell || cell.trim() === "")) continue;
            
//             var rowObject = {};
//             headers.forEach(function(header, index) {
//                 if (header && header.trim() !== "") {
//                     rowObject[header] = index < rows[i].length ? rows[i][index] || "" : "";
//                 }
//             });
            
//             jsonData.push(rowObject);
//         }
        
//         return jsonData;
//     } catch (error) {
//         Logger.log("Error in direct CSV parsing: " + error.message);
//         return null;
//     }
// }
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