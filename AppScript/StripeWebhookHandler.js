function doPost(e) {
  try {
    console.log("doPost: Incoming request:", JSON.stringify(e.postData.contents));

    // Ensure postData exists
    if (!e.postData || !e.postData.contents) {
      console.error("Missing postData or contents in the request.");
      return ContentService.createTextOutput("Error: Missing postData").setMimeType(ContentService.MimeType.TEXT);
    }

    const data = JSON.parse(e.postData.contents);
    console.log("Parsed request data:", data);

    const email = data.email;
    const name = data.name;

    // Does user already exist?
    const trialDate = getUserDataFromTrialUserTableFirebase(email);
    let emailMessage = "Trial has expired";

    if (trialDate) {
      const today = new Date();
      const trialEndDate = new Date(trialDate);

      // Check if the trial has not expired
      if (trialEndDate > today) {
        // Calculate the number of days left in the trial
        const daysLeft = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        emailMessage = `You have ${daysLeft} days left in your trial.`;
      }

      // Respond with the email message
      console.log(emailMessage);
    } else {
      // If user does not exist, send confirmation email
      console.log("User does not exist. Sending confirmation email.");
      const response = sendEmailConfirmationWithMailerSend(name, "casspangell@gmail.com");
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

