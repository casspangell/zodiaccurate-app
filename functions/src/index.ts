import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from "firebase-admin/database";

import * as stripe from "stripe";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import axios from "axios";
import { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const client = new SecretManagerServiceClient();
let stripeInstance: stripe.Stripe | null = null;

const app = initializeApp();
const db = getDatabase(app);

// Allow only https://zodiaccurate.app (or use "*" for all origins)
const corsHandler = cors({ origin: "https://zodiaccurate.app" });

const appScriptUrl = "https://script.google.com/macros/s/AKfycbwDBJ5C6ns8go-cbqfJUo7yIuwDubHPsg47tqI4uQVmx6hyrrLHZrzBGVfrYK4nYjEs/exec";

// Retrieve secret from Google Cloud Secret Manager
async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/607112386051/secrets/${secretName}/versions/latest`,
  });
  console.log(secretName, ": ", version.payload?.data?.toString());
  const payload = version.payload?.data?.toString().trim(); // Remove whitespace
  if (!payload) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return payload;
}

async function getStripeApiKey() {
  try {
    const response = await axios.get(appScriptUrl);
    return response.data.stripeApiKey;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
}

// Webhook Handler
export const webhookHandler = onRequest(

  { rawBody: true } as any, // Cast to bypass type issues

  async (request, response) => {

  try {
    const stripeSecret = await getSecret("stripe_secret");
    logger.info(`Fetched Secret: ${stripeSecret}`);
    const stripeApiKey = await getStripeApiKey();

    logger.info("Headers received:", request.headers);
    logger.info("Raw body received:", request.rawBody);

    // Initialize Stripe instance
    if (!stripeInstance) {
      stripeInstance = new stripe.Stripe(stripeApiKey, {
        apiVersion: "2024-06-20" as any, // Bypass type-checking for the apiVersion
      });
    }

    // Verify Stripe webhook signature
    const sig = request.headers["stripe-signature"];
    logger.info("Stripe-Signature Header:", request.headers["stripe-signature"]);

    if (!sig) {
      logger.error("Headers received without stripe-signature:", request.headers);
      response.status(400).send("Webhook Error: Missing stripe-signature header");
      return;
    }

    console.log("Raw body received (as string):", request.rawBody?.toString("utf8"));

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        request.rawBody,
        sig,
        stripeSecret
      );

      logger.info("Webhook verified successfully", { id: event.id, type: event.type });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Webhook verification failed:", errorMessage);
      response.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }


    logger.info("Event Type:", event.type);

    // Handle Stripe events
    switch (event.type) {
      // Inside your webhook handler where you process the subscription events
case "customer.subscription.created":
case "checkout.session.completed":
  let customerId;
  let sessionObject;
  
  if (event.type === "checkout.session.completed") {
    sessionObject = event.data.object as any; // Use 'any' to bypass strict typing
    customerId = sessionObject.customer as string;
    
    // For checkout sessions, you can often get the email directly
    const checkoutEmail = sessionObject.customer_details?.email;
    if (checkoutEmail) {
      logger.info(`Email found directly in checkout session: ${checkoutEmail}`);
    }
  } else {
    sessionObject = event.data.object as any; // Use 'any' to bypass strict typing
    customerId = sessionObject.customer as string;
  }

  if (!customerId) {
    logger.error("No customer ID found in the event.");
    response.status(400).send("Error: No customer ID in event.");
    return;
  }

  logger.info(`Fetching customer details for customer ID: ${customerId}`);

  try {
    // Fetch customer details from Stripe
    const customer = await stripeInstance.customers.retrieve(customerId) as any;

    const name = customer.name || "Seeker";
    const email = customer.email || (event.type === "checkout.session.completed" ? 
                 sessionObject.customer_details?.email : "Unknown Email");
    
    logger.info("name: ", name, " email: ", email, " source: ", "stripeWebhook");
    logger.info("Fetched Customer Details:", { name, email });

    if (email) {
      try {
        // Get a reference to the users node
        const usersRef = db.ref('users');
        
        // Query all users to find one with matching email
        const snapshot = await usersRef.once('value');
        let userFound = false;
        
        // Iterate through all users to find the one with matching email
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const userData = userSnapshot.val();
          
          // Check if this user has the matching email
          if (userData.email && userData.email === email) {
            userFound = true;
            
            // Update the trial status to 'subscribed'
            db.ref(`users/${userId}/trial`).set("subscribed")
              .then(() => {
                logger.info(`Updated user ${userId} status from trial to subscribed`);
              })
              .catch((error) => {
                logger.error(`Error updating user status: ${error.message}`);
              });
              
            // Optionally add subscription details
            db.ref(`users/${userId}/subscriptionId`).set(
              event.type === "customer.subscription.created" ? 
              sessionObject.id : sessionObject.subscription
            );
            
            db.ref(`users/${userId}/subscriptionDate`).set(new Date().toISOString());
            
            return true; // Stop iteration after finding the user
          }
          
          return false; // Continue iteration if email doesn't match
        });
        
        if (!userFound) {
          logger.warn(`User with email ${email} not found in database`);
        }
      } catch (error: any) {
        logger.error(`Error searching for user: ${error.message}`);
      }

      // Send data to Apps Script
      const payload = { 
        name, 
        email, 
        source: "stripeWebhook",
        event: event.type,
        subscriptionId: event.type === "customer.subscription.created" ? 
                       sessionObject.id : sessionObject.subscription
      };
      
      logger.info("Data sent to Apps Script:", payload);

      const appScriptResponse = await axios.post(appScriptUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      logger.info("Apps Script response:", appScriptResponse.data);
    } else {
      logger.warn("Customer email not found:", { customerId, name });
    }
  } catch (err: any) {
    logger.error("Error processing subscription event:", err.message);
  }

  break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      // Respond to Stripe
      response.status(200).send("Webhook received");
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error processing webhook:", errorMessage);
      response.status(500).send("Internal Server Error");
    }
  }
);

export const handleEmailConfirmation = onRequest(
  async (request, response) => {

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

        const trialStartDate = new Date(trialUserData.date);
        const currentDate = new Date();

        // Calculate the difference in days between the trial start date and the current date
        const diffInMilliseconds = currentDate.getTime() - trialStartDate.getTime();
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

        if (diffInDays > 10) {
          // Trial has expired
          trialMessage = `<p>It seems your 10 day trial has expired.<br/>You activated your trial on <strong>${trialStartDate.toLocaleDateString(
            "en-US"
          )}</strong></p>
          <div class="button-container">
            <a href="https://www.google.com" class="button">Subscribe Now</a>
          </div>`;
        } else {
          // Trial is still active
          const daysLeft = 10 - diffInDays;
          trialMessage = `<p>Your trial is still active! You started your trial on <strong>${trialStartDate.toLocaleDateString("en-US")}
          </strong>.<br/>You have <strong>${daysLeft}</strong> day(s) left in your trial.</p><br><br>
          <strong>If you need to fill out About You Questionaire:</strong> 
          <div class="button-container">
          <a href="https://zodiaccurate.app/about-you" class="button">Get Started</a>
        </div>
        <p>If you already have done so, an update information link is at the bottom of your daily Zodiaccurate email.</p>`;
        }
      } else {
        logger.info("No trial record found for email:", email);

        // Activate the trial if no record exists
        const currentDate = new Date();
        await trialUserRef.set({ email, date: currentDate.toISOString() });
        logger.info("Trial user added to Firebase:", { email, date: currentDate });

        // Notify the user of the trial activation
        trialMessage = `<p>Your trial has been successfully activated as of <strong>${currentDate.toLocaleDateString(
          "en-US"
        )}</strong>.</p>
        <div class="button-container">
          <a href="https://zodiaccurate.app/about-you" class="button">Get Started</a>
        </div>`;
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
                    <img src="https://zodiaccurate.app/zodiaccurate_logo.png" alt="Zodiaccurate">
                </div>
                <div class="content">
                    <h2>Thank you, ${name}!</h2>
                    <p>Your confirmation has been processed successfully.</p>
                    ${trialMessage}
                </div>
                <div class="footer">
                  <p>© <span id="currentYear"></span> Zodiaccurate. All rights reserved.</p>
                  <p>If you have any questions, contact us at <a href="mailto:support@zodiaccurate.com">support@zodiaccurate.com</a>.</p>
                </div>
                <script>
                  document.getElementById("currentYear").textContent = new Date().getFullYear();
                </script>
            </div>
        </body>
        </html>
      `;

      logger.info("Apps Script response:", appScriptResponse.data);

      response.status(200).send(htmlContent);

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error processing email confirmation:", errorMessage);
      response.status(500).send("Internal Server Error");
    }
  }
);

// Handle Form Submission
export const handleFormSubmission = onRequest(async (request: Request, response: Response) => {
  logger.log("Firebase Function Triggered");
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const formData = request.body;
    const submissionId = formData.uuid ? formData.uuid : uuidv4();
    formData.submissionId = submissionId;
    const payload = { formData,
      "source": "intakeForm",
      "uuid": submissionId,
      "email": formData.email,
      "name": formData.name
    };

    logger.info(payload);

    try {
      const appScriptResponse = await axios.post(appScriptUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });
      logger.info("Apps Script response:", appScriptResponse.data);
      response.status(200).json(appScriptResponse.data);
    } catch (error: any) {
      logger.error(error.message);
      response.status(500).send("Internal Server Error");
    }
  });
});

export const handleFormDataRetrieval = onRequest(async (request: Request, response: Response) => {
  logger.log("handleFormDataRetrieval function triggered");

  // Wrap in CORS handler
  corsHandler(request, response, async () => {
    if (request.method !== "GET") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const uuid = request.query.uuid as string | undefined;
    if (!uuid) {
      response.status(400).send("UUID is required");
      return;
    }

    try {
      const snapshot = await db.ref(`/responses/${uuid}`).once("value");
      const responseData = snapshot.val();

      if (!responseData) {
        response.status(200).json({ message: "No data found.", data: null });
        return;
      }

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error(error.message);
      response.status(500).send("Internal Server Error");
    }
  });
});
