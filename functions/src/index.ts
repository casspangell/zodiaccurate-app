import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const webhookHandler = onRequest((request, response) => {
  logger.info("Webhook received");
  response.send("Hello from Firebase!");
});