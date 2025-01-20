function doPost(e) {
  try {
    // Log the raw request for debugging
    Logger.log("Raw Request: " + JSON.stringify(e));
    Logger.log("Headers: " + JSON.stringify(e.headers));
    Logger.log("Post Data: " + e.postData.contents);

    // Stripe webhook secret
    const secret = STRIPE_WEBHOOK_SECRET;
    const stripeSignature = e.headers['Stripe-Signature'];

    // Verify webhook signature
    const isValid = verifyStripeSignature(e.postData.contents, stripeSignature, secret);
    if (!isValid) {
      Logger.log("Invalid webhook signature");
      return ContentService.createTextOutput("Invalid signature").setMimeType(ContentService.MimeType.TEXT);
    }

    // Parse and process payload
    const payload = JSON.parse(e.postData.contents);
    const eventType = payload.type;

    if (eventType === "checkout.session.completed") {
      const session = payload.data.object;
      Logger.log("Checkout session completed: " + JSON.stringify(session));

      const subscriptionId = session.subscription; // Subscription ID
      const customerId = session.customer; // Customer ID
      const customerEmail = session.customer_details.email; // Customer's email

      Logger.log("Customer ID: " + customerId);
      Logger.log("Subscription ID: " + subscriptionId);
      Logger.log("Customer Email: " + customerEmail);

      // // Update Firebase user data
      // updateFirebaseUser(customerEmail, { subscription: true });
    } else if (eventType === "checkout.session.canceled") {
      Logger.log("User canceled the checkout session.");
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log("Error: " + error.stack);
    return ContentService.createTextOutput("Internal server error").setMimeType(ContentService.MimeType.TEXT);
  }
}
