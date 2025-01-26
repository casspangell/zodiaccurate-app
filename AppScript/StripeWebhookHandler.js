// function doPost(e) {
//   Logger.log("HERE");
//   console.log("Test data:", JSON.stringify(e));
//   sendEmail();
  // try {
  //   console.log("doPost triggered");
  //   console.log("Headers: " + JSON.stringify(e.headers));
  //   console.log("Post Data: " + e.postData.contents);

  //   // Stripe webhook secret
  //   const secret = STRIPE_WEBHOOK_SECRET;
  //   const stripeSignature = e.headers['Stripe-Signature'];

  //   // Verify webhook signature
  //   const isValid = verifyStripeSignature(e.postData.contents, stripeSignature, secret);
  //   if (!isValid) {
  //     console.log("Invalid webhook signature");
  //     return ContentService.createTextOutput("Invalid signature").setMimeType(ContentService.MimeType.TEXT);
  //   }

  //   // Parse and process payload
  //   const payload = JSON.parse(e.postData.contents);
  //   console.log("Parsed Payload: " + JSON.stringify(payload));
  //   const eventType = payload.type;

  //   console.log("Event Type: " + eventType);

  //   if (eventType === "checkout.session.completed") {
  //     const session = payload.data.object;
  //     console.log("Checkout session completed: " + JSON.stringify(session));

  //     const subscriptionId = session.subscription;
  //     const customerId = session.customer;
  //     const customerEmail = session.customer_details.email;

  //     console.log("Customer ID: " + customerId);
  //     console.log("Subscription ID: " + subscriptionId);
  //     console.log("Customer Email: " + customerEmail);
  //   }

  //   return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  // } catch (error) {
  //   console.log("Error: " + error.stack);
  //   return ContentService.createTextOutput("Internal server error").setMimeType(ContentService.MimeType.TEXT);
  // }
// }

function doPost(e) {
  try {
    console.log("Incoming request:", JSON.stringify(e));

    // Ensure postData exists
    if (!e.postData || !e.postData.contents) {
      console.error("Missing postData or contents in the request.");
      return ContentService.createTextOutput("Error: Missing postData").setMimeType(ContentService.MimeType.TEXT);
    }

    const data = JSON.parse(e.postData.contents);
    console.log("Parsed request data:", data);

    // Process the request (e.g., send an email)
    sendEmail();
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error("Error processing request:", err.message);
    return ContentService.createTextOutput(`Internal server error: ${err.message}`).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet() {
  return ContentService.createTextOutput('Hello, world!');
}

function sendEmail() {
  try {
    const recipient = "casspangell@gmail.com";
    const subject = "Test Email from Apps Script";
    const body = "Hello! This is a test email sent using Google Apps Script.";

    GmailApp.sendEmail(recipient, subject, body);
    console.log(`Email sent to ${recipient}`);
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
}

