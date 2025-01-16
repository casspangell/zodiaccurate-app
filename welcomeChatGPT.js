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

        console.log("Email sent successfully.");
      } else {
        console.error("UUID is null or undefined")
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Function to fetch ChatGPT API response
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

// Function to construct ChatGPT instructions
function getChatInstructions(jsonSinglePersonData, uuid) {
  console.log("GET CHAT INSTRUCTIONS");
    const modifiers = getRandomModifiers();
    const getWeekData = getThreeDaysDataFromFirebase(uuid);

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights and practical advice. Focus on these sections and generate a CSV file containing the following columns and data:
        - Overview: Emotional, mental, and spiritual insights (${modifiers.overview})
        - Career and Finances: Strategies for growth (${modifiers.careerAndFinances})
        - Relationships: Emotional connections (${modifiers.relationships})
        - Parenting Guidance: Support tailored to children (${modifiers.parentingGuidance})
        - Health: Holistic well-being (${modifiers.health})
        - Personal Guidance: Introspective advice (${modifiers.personalGuidance})
        - Local Weather: Brief forecast.
        Avoid repetition, technical terms, and ensure uniqueness each day. Use the previous day’s data for reference: ${getWeekData}.
    `;

    return prompt.trim();
}