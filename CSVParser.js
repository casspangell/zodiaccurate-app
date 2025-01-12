function parseResponseToJson(responseData) {
    try {
        // Step 1: Extract the "content" field
        var content = responseData.choices[0].message.content;
        Logger.log("CONTENT: " + content);

        // Step 2: Extract the CSV portion from the markdown block
        var csvMatch = content.match(/```csv\n([\s\S]*?)\n```/);
        if (!csvMatch || csvMatch.length < 2) {
            Logger.log("CSV data not found in the response.");
            return null;
        }

        var csvContent = csvMatch[1]; // Extract the actual CSV content

        // Step 3: Parse the CSV content using Utilities.parseCsv
        var rows = Utilities.parseCsv(csvContent);

        if (rows.length < 2) {
            Logger.log("CSV content has insufficient data.");
            return null;
        }

        // Step 4: Extract headers and rows
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

        // Step 5: Log the parsed JSON data
        Logger.log("Parsed JSON Data:");
        Logger.log(JSON.stringify(jsonData, null, 2));

        // Return the JSON data
        return jsonData;
    } catch (error) {
        Logger.log("Error parsing response to JSON: " + error.message);
        return null;
    }
}