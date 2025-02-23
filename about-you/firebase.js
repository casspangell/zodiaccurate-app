    // Handle Form Data Retrieval
    export const handleFormSubmission = onRequest(async (request: Request, response: Response) => {
      const appScriptUrl = "https://script.google.com/macros/s/AKfycbw4lQLoxN_Uq6HQEar2cJkp_dxTjy6yY-J3sH2LQuC4bhvVxlqQ9h1IW8i-0jei0a01gg/exec";
        try {
            // Enable CORS
            cors()(request, response, async () => {
                if (request.method !== "GET") {
                    response.status(405).send("Method Not Allowed");
                    return;
                }

                const formData = request.body; // Get form data
                logger.info("Received form submission:", formData);

                if (!formData.email || !formData.name) {
                    response.status(400).send("Error: Missing required fields (email or name).");
                    return;
                }

                // Add the identifier to your formData payload
                formData.webhook_source = "firebase-data";

                axios.post(webAppUrl, formData)
                  .then(response => {
                    res.status(200).send("Apps Script triggered successfully: " + response.data);
                  })
                  .catch(error => {
                    res.status(500).send("Error triggering Apps Script: " + error);
                  });
                });

        } catch (error: any) {
            logger.error("❌ Error processing form submission:", error.message);
            response.status(500).send("Internal Server Error");
        }
    });