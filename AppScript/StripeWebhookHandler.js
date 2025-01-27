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

    console.log("Extracted email:", email);
    console.log("Extracted name:", name);

    // Ensure both email and name are present
    if (!email || !name) {
      console.error("Missing email or name in the request payload.");
      return ContentService.createTextOutput("Error: Missing email or name").setMimeType(ContentService.MimeType.TEXT);
    }

    // // Check if the user already exists in the trial table
    // const trialDate = getUserDataFromTrialUserTableFirebase(email);
    // let emailMessage = "Trial has expired";

    // if (trialDate) {
    //   const today = new Date();
    //   const trialEndDate = new Date(trialDate);

    //   // Check if the trial has not expired
    //   if (trialEndDate > today) {
    //     // Calculate the number of days left in the trial
    //     const daysLeft = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    //     emailMessage = `You have ${daysLeft} days left in your trial.`;
    //   }

    //   console.log(emailMessage);
    // } else {
    //   // If user does not exist, send confirmation email
    //   console.log("User does not exist. Sending confirmation email.");
      sendEmailConfirmationWithMailerSend(name, email);
    // }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error("Error processing request:", err.message);
    return ContentService.createTextOutput(`Internal server error: ${err.message}`).setMimeType(ContentService.MimeType.TEXT);
  }
}




function doGet() {
  return ContentService.createTextOutput('Hello, world!');
}

