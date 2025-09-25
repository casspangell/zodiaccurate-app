/**
 * StripeHandler.js
 * Handles Stripe API endpoints and subscription events
 * Created for Zodiaccurate App
 */

/**
 * Main function to handle Stripe subscription events
 * This function will be triggered by the Firebase webhook
 * @param {Object} eventData - The event data from Stripe webhook
 * @param {string} eventData.name - Customer name
 * @param {string} eventData.email - Customer email
 * @param {string} eventData.source - Source of the event (stripeWebhook)
 * @param {string} eventData.event - Type of Stripe event
 * @param {string} eventData.subscriptionId - Stripe subscription ID
 * @param {string} eventData.status - Subscription status (optional)
 * @param {boolean} eventData.cancelAtPeriodEnd - Whether cancellation is pending (optional)
 */
function handleStripeSubscriptionEvent(eventData) {
  try {
    Logger.log("=== STRIPE SUBSCRIPTION EVENT HANDLER ===");
    Logger.log("Event Data:", JSON.stringify(eventData, null, 2));
    
    const { name, email, source, event, subscriptionId, status, cancelAtPeriodEnd } = eventData;
    
    // Validate required data
    if (!email || !event) {
      Logger.log("ERROR: Missing required data - email or event type");
      return { success: false, error: "Missing required data" };
    }
    
    // Log the subscription event
    logSubscriptionEvent({
      name: name || "Unknown",
      email: email,
      event: event,
      subscriptionId: subscriptionId || "N/A",
      status: status || "N/A",
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      timestamp: new Date().toISOString(),
      source: source || "stripeWebhook"
    });
    
    // Handle different event types
    switch (event) {
      case "checkout.session.completed":
        handleSubscriptionCreated(name, email, subscriptionId);
        break;
        
      case "customer.subscription.deleted":
        handleSubscriptionCanceled(name, email, subscriptionId);
        break;
        
      case "customer.subscription.updated":
        handleSubscriptionUpdated(name, email, subscriptionId, status, cancelAtPeriodEnd);
        break;
        
      case "invoice.payment_failed":
        handlePaymentFailed(name, email, subscriptionId);
        break;
        
      case "invoice.payment_succeeded":
        handlePaymentSucceeded(name, email, subscriptionId);
        break;
        
      default:
        Logger.log(`Unhandled event type: ${event}`);
        logUnhandledEvent(event, email);
    }
    
    Logger.log("=== STRIPE EVENT PROCESSING COMPLETE ===");
    return { success: true, message: "Event processed successfully" };
    
  } catch (error) {
    Logger.log("ERROR in handleStripeSubscriptionEvent:", error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle subscription creation (checkout.session.completed)
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} subscriptionId - Stripe subscription ID
 */
function handleSubscriptionCreated(name, email, subscriptionId) {
  try {
    Logger.log(`=== SUBSCRIPTION CREATED ===`);
    Logger.log(`Customer: ${name} (${email})`);
    Logger.log(`Subscription ID: ${subscriptionId}`);
    
    // Log success metrics
    const successData = {
      event: "subscription_created",
      customerName: name,
      customerEmail: email,
      subscriptionId: subscriptionId,
      timestamp: new Date().toISOString(),
      revenue: "Monthly subscription activated"
    };
    
    logSuccessMetrics(successData);
    
    // Update user status in Firebase (if needed)
    updateUserSubscriptionStatus(email, "subscribed", subscriptionId);
    
    Logger.log("Subscription creation processed successfully");
    
  } catch (error) {
    Logger.log("ERROR in handleSubscriptionCreated:", error.toString());
  }
}

/**
 * Handle subscription cancellation
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} subscriptionId - Stripe subscription ID
 */
function handleSubscriptionCanceled(name, email, subscriptionId) {
  try {
    Logger.log(`=== SUBSCRIPTION CANCELED ===`);
    Logger.log(`Customer: ${name} (${email})`);
    Logger.log(`Subscription ID: ${subscriptionId}`);
    
    // Log cancellation metrics
    const cancellationData = {
      event: "subscription_canceled",
      customerName: name,
      customerEmail: email,
      subscriptionId: subscriptionId,
      timestamp: new Date().toISOString(),
      churn: "Customer churned"
    };
    
    logSuccessMetrics(cancellationData);
    
    // Update user status in Firebase
    updateUserSubscriptionStatus(email, "canceled", subscriptionId);
    
    Logger.log("Subscription cancellation processed successfully");
    
  } catch (error) {
    Logger.log("ERROR in handleSubscriptionCanceled:", error.toString());
  }
}

/**
 * Handle subscription updates (status changes, pending cancellations)
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} status - New subscription status
 * @param {boolean} cancelAtPeriodEnd - Whether cancellation is pending
 */
function handleSubscriptionUpdated(name, email, subscriptionId, status, cancelAtPeriodEnd) {
  try {
    Logger.log(`=== SUBSCRIPTION UPDATED ===`);
    Logger.log(`Customer: ${name} (${email})`);
    Logger.log(`Subscription ID: ${subscriptionId}`);
    Logger.log(`Status: ${status}`);
    Logger.log(`Pending Cancellation: ${cancelAtPeriodEnd}`);
    
    // Log update metrics
    const updateData = {
      event: "subscription_updated",
      customerName: name,
      customerEmail: email,
      subscriptionId: subscriptionId,
      newStatus: status,
      pendingCancellation: cancelAtPeriodEnd,
      timestamp: new Date().toISOString()
    };
    
    logSuccessMetrics(updateData);
    
    // Update user status based on new status
    let userStatus = status;
    if (cancelAtPeriodEnd) {
      userStatus = "pending_cancellation";
    }
    
    updateUserSubscriptionStatus(email, userStatus, subscriptionId);
    
    Logger.log("Subscription update processed successfully");
    
  } catch (error) {
    Logger.log("ERROR in handleSubscriptionUpdated:", error.toString());
  }
}

/**
 * Handle payment failures
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} subscriptionId - Stripe subscription ID
 */
function handlePaymentFailed(name, email, subscriptionId) {
  try {
    Logger.log(`=== PAYMENT FAILED ===`);
    Logger.log(`Customer: ${name} (${email})`);
    Logger.log(`Subscription ID: ${subscriptionId}`);
    
    // Log payment failure metrics
    const failureData = {
      event: "payment_failed",
      customerName: name,
      customerEmail: email,
      subscriptionId: subscriptionId,
      timestamp: new Date().toISOString(),
      issue: "Payment processing failed"
    };
    
    logSuccessMetrics(failureData);
    
    // Update user status
    updateUserSubscriptionStatus(email, "payment_issue", subscriptionId);
    
    Logger.log("Payment failure processed successfully");
    
  } catch (error) {
    Logger.log("ERROR in handlePaymentFailed:", error.toString());
  }
}

/**
 * Handle successful payments
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @param {string} subscriptionId - Stripe subscription ID
 */
function handlePaymentSucceeded(name, email, subscriptionId) {
  try {
    Logger.log(`=== PAYMENT SUCCEEDED ===`);
    Logger.log(`Customer: ${name} (${email})`);
    Logger.log(`Subscription ID: ${subscriptionId}`);
    
    // Log payment success metrics
    const successData = {
      event: "payment_succeeded",
      customerName: name,
      customerEmail: email,
      subscriptionId: subscriptionId,
      timestamp: new Date().toISOString(),
      revenue: "Payment processed successfully"
    };
    
    logSuccessMetrics(successData);
    
    // Update user status
    updateUserSubscriptionStatus(email, "subscribed", subscriptionId);
    
    Logger.log("Payment success processed successfully");
    
  } catch (error) {
    Logger.log("ERROR in handlePaymentSucceeded:", error.toString());
  }
}

/**
 * Log subscription events with detailed information
 * @param {Object} eventData - Event data to log
 */
function logSubscriptionEvent(eventData) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: "STRIPE_EVENT",
      data: eventData
    };
    
    Logger.log("STRIPE EVENT LOG:", JSON.stringify(logEntry, null, 2));
    
    // You can also write to a Google Sheet for tracking if needed
    // writeToStripeEventSheet(eventData);
    
  } catch (error) {
    Logger.log("ERROR logging subscription event:", error.toString());
  }
}

/**
 * Log success metrics and important data
 * @param {Object} metricsData - Metrics data to log
 */
function logSuccessMetrics(metricsData) {
  try {
    const metricsEntry = {
      timestamp: new Date().toISOString(),
      type: "STRIPE_METRICS",
      metrics: metricsData
    };
    
    Logger.log("STRIPE METRICS:", JSON.stringify(metricsEntry, null, 2));
    
    // Log key success indicators
    if (metricsData.event === "subscription_created") {
      Logger.log("🎉 NEW SUBSCRIPTION CREATED!");
      Logger.log(`Customer: ${metricsData.customerName} (${metricsData.customerEmail})`);
      Logger.log(`Subscription ID: ${metricsData.subscriptionId}`);
    } else if (metricsData.event === "payment_succeeded") {
      Logger.log("💰 PAYMENT SUCCESSFUL!");
      Logger.log(`Customer: ${metricsData.customerName} (${metricsData.customerEmail})`);
    } else if (metricsData.event === "subscription_canceled") {
      Logger.log("❌ SUBSCRIPTION CANCELED");
      Logger.log(`Customer: ${metricsData.customerName} (${metricsData.customerEmail})`);
    }
    
  } catch (error) {
    Logger.log("ERROR logging success metrics:", error.toString());
  }
}

/**
 * Log unhandled events for debugging
 * @param {string} eventType - Type of unhandled event
 * @param {string} email - Customer email
 */
function logUnhandledEvent(eventType, email) {
  try {
    const unhandledEntry = {
      timestamp: new Date().toISOString(),
      type: "UNHANDLED_STRIPE_EVENT",
      eventType: eventType,
      customerEmail: email
    };
    
    Logger.log("UNHANDLED STRIPE EVENT:", JSON.stringify(unhandledEntry, null, 2));
    
  } catch (error) {
    Logger.log("ERROR logging unhandled event:", error.toString());
  }
}

/**
 * Update user subscription status in Firebase
 * @param {string} email - User email
 * @param {string} status - New subscription status
 * @param {string} subscriptionId - Stripe subscription ID
 */
function updateUserSubscriptionStatus(email, status, subscriptionId) {
  try {
    Logger.log(`Updating user subscription status for ${email}: ${status}`);
    
    // This would integrate with your Firebase utilities
    // For now, just log the update
    const updateData = {
      email: email,
      subscriptionStatus: status,
      subscriptionId: subscriptionId,
      lastUpdated: new Date().toISOString()
    };
    
    Logger.log("SUBSCRIPTION STATUS UPDATE:", JSON.stringify(updateData, null, 2));
    
    // TODO: Integrate with your Firebase.js utilities
    // updateFirebaseUserStatus(email, status, subscriptionId);
    
  } catch (error) {
    Logger.log("ERROR updating user subscription status:", error.toString());
  }
}

/**
 * Test function to verify Stripe handler is working
 * Call this function to test the Stripe handler with sample data
 */
function testStripeHandler() {
  try {
    Logger.log("=== TESTING STRIPE HANDLER ===");
    
    const testEventData = {
      name: "Test Customer",
      email: "test@example.com",
      source: "stripeWebhook",
      event: "checkout.session.completed",
      subscriptionId: "sub_test123456789",
      status: "active"
    };
    
    const result = handleStripeSubscriptionEvent(testEventData);
    Logger.log("Test result:", result);
    
    Logger.log("=== STRIPE HANDLER TEST COMPLETE ===");
    
  } catch (error) {
    Logger.log("ERROR in test function:", error.toString());
  }
}
