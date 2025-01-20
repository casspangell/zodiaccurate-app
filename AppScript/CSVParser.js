/**
 * Parses ChatGPT response data to extract and convert the CSV content into JSON format.
 * - Extracts the "content" field from the ChatGPT response.
 * - Identifies and extracts the CSV data enclosed in a markdown block.
 * - Converts the CSV content into an array of JSON objects, mapping headers to values.
 *
 * @param {Object} responseData - The response data object from ChatGPT.
 * @param {Object[]} responseData.choices - The array of response choices from ChatGPT.
 * @param {Object} responseData.choices[0].message - The message object containing the content.
 * @param {string} responseData.choices[0].message.content - The content field with the markdown-enclosed CSV.
 * @returns {Object[]|null} - An array of JSON objects parsed from the CSV data, or null if parsing fails.
 */
function parseResponseToJson(responseData) {
    try {
        // Extract the "content" field
        var content = responseData.choices[0].message.content;

        // Extract the CSV portion from the markdown block
        var csvMatch = content.match(/```csv\n([\s\S]*?)\n```/);
        if (!csvMatch || csvMatch.length < 2) {
            Logger.log("CSV data not found in the response.");
            return null;
        }

        var csvContent = csvMatch[1]; // Extract the actual CSV content

        // Parse the CSV content using Utilities.parseCsv
        var rows = Utilities.parseCsv(csvContent);

        if (rows.length < 2) {
            Logger.log("CSV content has insufficient data.");
            return null;
        }

        // Extract headers and rows
        var headers = rows[0]; // First row as headers
        var jsonData = [];

        for (var i = 1; i < rows.length; i++) {
            var rowData = rows[i];
            var rowObject = {};

            headers.forEach(function (header, index) {
                rowObject[header] = rowData[index] || ""; // Map headers to values
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
        return null;
    }
}