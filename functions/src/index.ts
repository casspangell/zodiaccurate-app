import * as functions from "firebase-functions";
import fetch from "node-fetch";

// Import the types from Express
import { Request, Response } from "express";

// Replace this with your Google Apps Script URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec";

export const webhookHandler = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    // Log the received webhook data for debugging
    console.log("Webhook received:", req.body);

    // Forward the webhook data to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // Send the webhook payload as JSON
    });

    // Handle the response from Apps Script
    const responseBody = await response.text();
    console.log("Response from Apps Script:", responseBody);

    // Respond to the webhook sender
    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});
