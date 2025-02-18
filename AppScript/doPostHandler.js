function doPost(e) {
  try {
    // Log the incoming request
    console.log("doPost: Incoming request:", JSON.stringify(e.postData.contents));

    // Ensure postData exists
    if (!e.postData || !e.postData.contents) {
      console.error("Missing postData or contents in the request.");
      return ContentService.createTextOutput("Error: Missing postData").setMimeType(ContentService.MimeType.TEXT);
    }

    // Parse the incoming JSON payload
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      console.error("Failed to parse JSON:", err.message);
      return ContentService.createTextOutput("Error: Invalid JSON payload").setMimeType(ContentService.MimeType.TEXT);
    }

    console.log("Parsed request data:", data);

    // Extract email and name from the parsed data
    const email = data?.email;
    const name = data?.name;
    const source = data?.source?.trim();
    console.log(`Extracted source (raw): '${data?.source}'`);
    console.log(`Extracted source (trimmed): '${source}'`);
    console.log(`Type of source: ${typeof source}`);


    console.log("Extracted email:", email);
    console.log("Extracted name:", name);
    console.log("Request source:", source);

    // Ensure both email and name are present
    if (!email || !name || !source) {
      console.error("Missing email, name, or source in the request payload.");
      return ContentService.createTextOutput("Error: Missing email, name, or source")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    if (source === "stripewebhook") {
      const confimationEmail = sendEmailConfirmationWithMailerSend(name, email);
    } else if (source === "webform") {
      console.log("Handling request from Web Form");
      return onWebFormSubmitHandler(data);
    } else if (source === "emailconfirmation") {
      console.log("Handling email confirmation:", email);
      // activateTrialForUser(email, name);
    } else {
      console.warn(`Unknown source: '${source}'`);
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error("Error processing request:", err.message);
    return ContentService.createTextOutput(`Internal server error: ${err.message}`).setMimeType(ContentService.MimeType.TEXT);
  }
}
