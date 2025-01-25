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
    Logger.log('doPost function started. Request parameters: ', JSON.stringify(e));
    Logger.log('Data processed successfully:', JSON.stringify(processedData));
    sendEmail();
    return ContentService.createTextOutput(JSON.stringify({result: "success", data: processedData})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost function:', error);
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("This is the response for a GET request.");
}

function sendEmail() {
  // Set the recipient, subject, and body of the email
  const recipient = "casspangell@gmail.com"; // Replace with the recipient's email
  const subject = "Test Email from Apps Script";
  const body = "Hello! This is a test email sent using Google Apps Script.";

  // Send the email
  GmailApp.sendEmail(recipient, subject, body);

  // Log the email was sent successfully
  Logger.log(`Email sent to ${recipient}`);
}
