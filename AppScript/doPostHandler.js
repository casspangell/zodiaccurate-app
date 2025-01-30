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
    const source = data?.source;

    console.log("Extracted email:", email);
    console.log("Extracted name:", name);
    console.log("Request source:", source);

    // Ensure both email and name are present
    if (!email || !name || !source) {
      console.error("Missing email or name or source in the request payload.");
      return ContentService.createTextOutput("Error: Missing email or name or source").setMimeType(ContentService.MimeType.TEXT);
    }

    if (source === "stripeWebhook") {
        const confimationEmail = sendEmailConfirmationWithMailerSend(name, email);

    } 

    else if (source === "emailConfirmation") {
      console.log("Handling email confirmation:", email);
      // activateTrialForUser(email, name);
    } else {
      console.warn("Unknown source:", source);
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error("Error processing request:", err.message);
    return ContentService.createTextOutput(`Internal server error: ${err.message}`).setMimeType(ContentService.MimeType.TEXT);
  }
}


function doGet() {
  return ContentService.createTextOutput('Hello, world!');
}

