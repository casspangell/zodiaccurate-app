/**
 * Prepares and sends a personalized welcome email to a user using ChatGPT-generated content.
 * - Fetches user data from Firebase.
 * - Generates a ChatGPT prompt and retrieves a response.
 * - Sends a welcome email to the user using the MailerSend API.
 *
 * @async
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Promise<void>} - A promise that resolves when the process is complete.
 */
async function welcomeChatGPT(uuid) {
    console.log("PREPARE WELCOME CHATGPT");

    // Fetch user data
    var jsonSinglePersonData = {};
    jsonSinglePersonData = getUserDataFromFirebase(uuid);

    // Generate ChatGPT prompt
    const prompt = getChatInstructions(jsonSinglePersonData, uuid);

    try {
      if(uuid) {
        const chatGPTResponse = await getChatGPTResponse(prompt, uuid);
        const { name, email } = jsonSinglePersonData;

        sendWelcomeEmailWithMailerSend(name, email, JSON.stringify(chatGPTResponse));
        setUpEmailCampaign(jsonSinglePersonData,uuid,name,email);

        console.log("Email sent successfully.");
      } else {
        console.error("UUID is null or undefined")
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

/**
 * Fetches a response from the ChatGPT API based on the provided instructions.
 * - Constructs a payload with the user's data and ChatGPT instructions.
 * - Sends a request to the ChatGPT API and parses the response.
 * - Saves the response to Firebase if valid.
 *
 * @param {string} instructions - The ChatGPT prompt containing user data and instructions.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The parsed response data if successful, or null on failure.
 */
function getChatGPTResponse(instructions, uuid) {
  
    console.log("GET CHAT RESPONSE");
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        "model": "gpt-4-turbo",
        "max_tokens": 3000,
        "temperature": 1.0,
        "messages": [
            {
                "role": "system",
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide."
            },
            {
                "role": "user",
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide. Your task is to generate a personalized daily horoscope in CSV format based on the provided data. Always provide the CSV content enclosed in a markdown code block with the csv tag (e.g., csv \"Column1\",\"Column2\",\"Column3\" \"Value1\",\"Value2\",\"Value3\" ). The first row must contain column headers, and subsequent rows must contain corresponding values. Do not include any text or explanation outside the markdown block. Ensure all values are properly quoted (e.g., \"Value\"), especially if they contain commas, line breaks, or special characters. Example format: csv \"Overview\",\"Career and Finances\",\"Relationships\",\"Parenting Guidance\",\"Health\",\"Personal Guidance\",\"Local Weather\" \"Today's insights...\",\"Career advice...\",\"Relationship advice...\",\"Parenting guidance...\",\"Health tips...\",\"Personal advice...\",\"Local weather forecast...\" . Ensure the format is consistent and adheres strictly to these guidelines."
            },
            {
                "role": "user",
                "content": instructions
            }
        ]
    };

    const options = {
        "method": "post",
        "headers": {
            "Authorization": "Bearer " + CHAT_GPT_KEY,
            "Content-Type": "application/json"
        },
        "payload": JSON.stringify(payload)
    };

    const response = UrlFetchApp.fetch(url, options);
    const jsonResponse = JSON.parse(response.getContentText());

    console.log("GET CHATGPT RESPONSE: " + response.getContentText());
    const responseData = parseResponseToJson(jsonResponse);

        if (responseData && responseData.length > 0) {
                saveHoroscopeToFirebase(responseData, uuid);
                return responseData;
        } else {
            console.log("Unexpected API response structure: " + JSON.stringify(responseData));
        }
}

/**
 * Constructs a ChatGPT prompt using user data and modifiers.
 * - Retrieves random modifiers and three days of prior data for context.
 * - Builds a detailed prompt to generate a personalized daily horoscope.
 *
 * @param {Object} jsonSinglePersonData - The user data object containing relevant information.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {string} - A formatted prompt string for ChatGPT.
 */
function getChatInstructions(jsonSinglePersonData, uuid) {
  console.log("GET CHAT INSTRUCTIONS");
    const modifiers = getRandomModifiers();
    const getWeekData = getThreeDaysDataFromFirebase(uuid);
    const getCampainData = getChatEmailCampaignInstructions();

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights and practical advice. Focus on these sections and  generate a CSV file containing the following columns and data:. One containing the following columns and data:
        - Overview: Emotional, mental, and spiritual insights (${modifiers.overview})
        - Career and Finances: Strategies for growth (${modifiers.careerAndFinances})
        - Relationships: Emotional connections (${modifiers.relationships})
        - Parenting Guidance: Support tailored to children (${modifiers.parentingGuidance})
        - Health: Holistic well-being (${modifiers.health})
        - Personal Guidance: Introspective advice (${modifiers.personalGuidance})
        - Local Weather: Brief forecast.
        Avoid repetition, technical terms, and ensure uniqueness each day. Use the previous day's data for reference: ${getWeekData}.

        The second CSV file: ${getCampainData}
    `;

    return prompt.trim();
}