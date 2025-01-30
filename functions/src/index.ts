import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as stripe from "stripe";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import axios from "axios";
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from "firebase-admin/database";

const client = new SecretManagerServiceClient();
let stripeInstance: stripe.Stripe | null = null;

const app = initializeApp();
const db = getDatabase(app);

// Retrieve secret from Google Cloud Secret Manager
async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/zodiaccurate-e9aaf/secrets/${secretName}/versions/latest`,
  });
  // console.log(secretName, ": ", version.payload?.data?.toString());
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

  const appScriptUrl = "https://script.google.com/macros/s/AKfycbzCCuIwKfLzST7e5imB1qvPAq2LvlJLdU0FFZmyXAXi5Nd1Nc0Uc11gUgyXW_EfS3KS/exec";

  try {
    const stripeSecret = await getSecret("stripe_secret");
    const webhookSecret = await getSecret("stripe_webhook_secret");
    // const sharedSecret = await getSecret("shared_secret");

    // logger.info("SHARED SECRET:", sharedSecret);
    logger.info("Headers received:", request.headers);
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
        logger.info("AppScriptUrl: ", appScriptUrl);
        logger.info("name: ", name, " email: ", email, " source: ","stripeWebhook");

        if (name && email) {
          // Call Apps Script function
          try {
            const payload = { "name":name, "email":email, "source": "stripeWebhook" };
            logger.info("Data sent: ", payload);
              const appScriptResponse = await axios.post(appScriptUrl, payload, {
              headers: { "Content-Type": "application/json" },
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

export const handleEmailConfirmation = onRequest(
  async (request, response) => {
    const appScriptUrl = "https://script.google.com/macros/s/AKfycbzCCuIwKfLzST7e5imB1qvPAq2LvlJLdU0FFZmyXAXi5Nd1Nc0Uc11gUgyXW_EfS3KS/exec";

    try {
      const email = request.query.email as string;
      const name = request.query.name as string;

      if (!email || !name) {
        logger.error("Missing email or name in the query parameters.");
        response.status(400).send("Error: Missing email or name.");
        return;
      }

      logger.info("Processing email confirmation for:", { name, email });


      // 🔹 Encode email for Firebase (Replace @ and . to prevent key errors)
      const encodedEmail = email.replace(/[@.]/g, "_");
      // 🔹 Check if the email exists in "trial_users" in Firebase
      
      const trialUserRef = db.ref(`trial_users/${encodedEmail}`);
      const trialUserSnapshot = await trialUserRef.once("value");
      const trialUserData = trialUserSnapshot.val();

      let trialMessage = `<p>No trial record found for ${email}.</p>`;

      if (trialUserData) {
        logger.info("Trial user found:", trialUserData);

        const addedDate = new Date(trialUserData.date).toLocaleDateString("en-US");
        trialMessage = `<p>You started your trial on <strong>${addedDate}</strong>.</p>`;
      } else {
        logger.info("No trial record found for email:", email);
      }

      // Payload to send to Apps Script
      const payload = { "name":name, "email":email, "source": "emailConfirmation" };

      // Call Apps Script
      const appScriptResponse = await axios.post(appScriptUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation Successful</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header img {
                    width: 100%;
                    max-height: 150px;
                    height: auto;
                    border-radius: 8px 8px 0 0;
                    display: block;
                    margin: 0 auto;
                }
                .content {
                    padding: 20px;
                }
                h2 {
                    color: #2e6ca8;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .button-container {
                    margin: 20px 0;
                }
                .button {
                    background-color: #fff;
                    color: #6a1b9a;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border: 2px solid #6a1b9a;
                    font-size: 16px;
                    display: inline-block;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                .button:hover {
                    background-color: #6a1b9a;
                    color: #fff;
                    border-color: #6a1b9a;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate">
                </div>
                <div class="content">
                    <h2>Thank you, ${name}!</h2>
                    ${trialMessage}
                    <p>Your confirmation has been processed successfully.</p>
                </div>
                <div class="footer">
                    <p>© 2025 Zodiaccurate. All rights reserved.</p>
                    <p>If you have any questions, contact us at <a href="mailto:support@zodiaccurate.com">support@zodiaccurate.com</a>.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      logger.info("Apps Script response:", appScriptResponse.data);

      response.status(200).send(htmlContent);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error processing email confirmation:", errorMessage);
      response.status(500).send("Internal Server Error");
    }
  }
);
