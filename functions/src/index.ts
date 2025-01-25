import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as stripe from "stripe";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import axios from "axios";

const client = new SecretManagerServiceClient();
let stripeInstance: stripe.Stripe | null = null;

// Retrieve secret from Google Cloud Secret Manager
async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/zodiaccurate-e9aaf/secrets/${secretName}/versions/latest`,
  });
  const payload = version.payload?.data?.toString().trim(); // Remove whitespace
  if (!payload) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return payload;
}

// Webhook Handler
export const webhookHandler = onRequest(

  { rawBody: true } as any, // Cast to bypass type issues

  async (request, response) => {
  try {
    const stripeSecret = await getSecret("stripe_secret");
    const webhookSecret = await getSecret("stripe_webhook_secret");

    logger.info("HELLO Headers received:", request.headers);
    logger.info("Raw body received:", request.rawBody);

    // Initialize Stripe instance
    if (!stripeInstance) {
      stripeInstance = new stripe.Stripe(stripeSecret, {
        apiVersion: "2022-11-15" as any, // Bypass type-checking for the apiVersion
      });
    }

    // Verify Stripe webhook signature
    const sig = request.headers["stripe-signature"];
    if (!sig) {
      logger.error("Headers received without stripe-signature:", request.headers);
      response.status(400).send("Webhook Error: Missing stripe-signature header");
      return;
    }

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
      logger.info("Webhook verified:", { id: event.id, type: event.type });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Webhook verification failed:", errorMessage);
      response.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }

    logger.info("Event Type:", event.type);

    // Handle Stripe events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as any;

        // Extract name and email
        const name = session.customer_details?.name;
        const email = session.customer_details?.email;

        if (name && email) {

          // Call Apps Script function
          const appScriptUrl = "https://script.google.com/macros/s/AKfycbw7fkLCQ4ulXMjpOEhpGeEhdYhSkDekR34dDwJe1sIKb9X01RuVD7CCGlGb9Iu_jQpPfw/exec";
          try {
            const appScriptResponse = await axios.post(appScriptUrl, {
              functionName: "handleStripeWebhook",
              parameters: { name, email },
            });
            logger.info("Apps Script response:", appScriptResponse.data);
          } catch (err: any) {
            logger.error("Error calling Apps Script:", err.message);
          }
        } else {
          logger.warn("Name or email missing in the Stripe event.");
        }

        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    // Respond to Stripe
    response.status(200).send("Webhook received");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error processing webhook:", errorMessage);
    response.status(500).send("Internal Server Error");
  }
});