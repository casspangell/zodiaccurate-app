function testChatPrompt() {
    const uuid = "d8d8b814-2d3a-425e-8ad0-a89463d37dff";
    const instructions = getChatInstructions(TEST_USER_DATA, uuid);

    // Get the response from ChatGPT
    const zodiaccurateData = getChatGPTResponse(instructions, TEST_USER_DATA, uuid);
    
    // Continue with the rest of your function
    const { name, email } = TEST_USER_DATA;
    sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid);
    saveHoroscopeToFirebase(zodiaccurateData, uuid, "monday");
    
    // Return the data so you can use it if needed
    return zodiaccurateData;
}

function getChatInstructions(jsonSinglePersonData, uuid) {

    const userData = jsonSinglePersonData;
    const user = getUserNames(jsonSinglePersonData);
    const userThreeDayData = getThreeDaysDataFromFirebase(uuid);
    // const astroData = getDailyAstrologicalData();
    // const seed = createSeed(uuid);
    // const predictionTimeframe = predictionTimeframes(astroData);
    // const vStyles = variationStyles();
    const rStatus = relationshipStatus(user, jsonSinglePersonData);
    // const rGuidance = getRelationshipGuidance();
    // const psyElements = psychicElements();
    // const createInstructions = creativityInstructions(DATE_STRING, seed);
    // const creativeParams = getCreativityParams();

    // console.log(`Using dynamic parameters: temp=${creativeParams.dynamicTemperature}, top_p=${creativeParams.dynamicTopP}, freq=${creativeParams.frequencyPenalty}, pres=${creativeParams.presencePenalty}`);

    // console.log("USER NAMES ",user);
    // console.log("ASTRO DATA ", astroData);
    // console.log("SEED ", seed);
    // console.log("PREDICTIONTIMEFRAME ", predictionTimeframe);
    // console.log("VARIATIONSTYLES ", vStyles);
    // console.log("RELATIONSHIP STATUS", rStatus);
    // console.log("RELATIONSHIP GUIDANCE", rGuidance);
    // console.log("PSYCHIC ", psyElements);
    // console.log("VARIATION STYLES ", variationStyles);
    // console.log("CREATIVIY INSTRUCTIONS", createInstructions);
    // console.log("PROMPT ", prompt);

  return {
    uuid: uuid,
    user_names: user,
    user_data: userData,
    // astrological_data: astroData,
    // seed: seed,
    // predictionTimeframe: predictionTimeframe,
    // variationStyles: vStyles,
    relationshipStatus: rStatus,
    // relationshipGuidance: rGuidance,
    // psychicElements: psyElements,
    // variationStyles: variationStyles,
    // creativityInstructions: createInstructions,
    // creativeParams: creativeParams
  };
}


function getChatGPTResponse(instructions, jsonSinglePersonData, uuid) {
    console.log("Getting ChatGPT Response...");
    
    const systemPrompt = getChatPrompt();
    const params = instructions.creativeParams;
    const instructionsString = JSON.stringify(instructions);

    // console.log("PERSON DATA ", jsonSinglePersonData);
    // console.log("INSTRUCTIONS ", instructions);
    // console.log("PROMPT ", systemPrompt);

    try {
        const payload = {
        "model": "gpt-4o",
        "max_tokens": 4096,
        "temperature": 0.4,
        "messages": [
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": instructionsString
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

            const response = UrlFetchApp.fetch(CHAT_GPT_URL, options);
            const jsonResponse = JSON.parse(response.getContentText());
            const responseData = parseResponseToJson(jsonResponse);

            if (responseData && responseData.length > 0) {
                console.log("Successfully parsed response data");
                return responseData;
            } else {
                console.log("Failed to parse response data or empty result");
                console.log("Response content:", jsonResponse.choices[0].message.content.substring(0, 200) + "...");
                return null;
            }
        } catch (error) {
            console.log("Error in getChatGPTResponse:", error);
            return null;
    }

}

function getChatEmailCampaignInstructions(name, uuid, jsonSinglePersonData, email) {
  console.log("GET CHAT CAMPAIGN INSTRUCTIONS");
  const campaignDate = formatDateForUser(uuid);
  const serverDate = new Date();
    const prompt = 
    `Here is user data: ${JSON.stringify(jsonSinglePersonData)}, Name = ${name}, Campaign_Date = ${campaignDate}, Email = ${email}. Our company is Zodiaccurate. If you wish to use this name, place it as the Zodiaccurate Team or Zodiaccurate.
Your task is to create a 4-day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services on Days 3, 5, 7, and 9 into their trial program. Add a timestamp of today's date. Do not add [Dear User] or [From Zodiaccurate]. The email needs to bait the user into subscribing for the app. Use predictions on how using this unique astrology app will enhance their overall life, wellness, and wellbeing. Incorporate what you would be used in an astrology prediction into their life to enhance their metaphysical outlook.

Focus on these sections and generate a CSV file containing the following columns and data:
- Subject_1
- Email_1
- Subject_2
- Email_2
- Subject_3
- Email_3
- Subject_4
- Email_4
- Campaign_Date
- Name
- Email

Expand the main body of each email by including:
- Personalized details such as the user's name, family member names, occupation, or specific data from their profile.
- Relatable examples and stories tied directly to their personal goals, stressors, or experiences during the trial period (e.g., their role as a spiritual healer or their goal of work-life balance).
- Astrological insights relevant to their trial period, aligned with their birth data.
- Emotionally compelling calls to action that emphasize how subscribing will address their unique needs and goals.
    `;

    return prompt.trim();
}

function getChatGPTEmailCampaignResponse(instructions, uuid) {
  
    console.log("GET CHAT RESPONSE");
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        "model": "gpt-4",
        "max_tokens": 4000,
        "temperature": 1.0,
        "messages": [
            {
                "role": "system",
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide."
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

    console.log("GET CHATGPT EMAIL CAMPAIGN RESPONSE: " + response.getContentText());

    const responseData = parseResponseToJson(jsonResponse);
    Logger.log("Data before saveEmailCampaignToFirebase:");
    Logger.log("UUID: " + uuid);
    Logger.log("JSON Data Type: " + typeof responseData);
    Logger.log("JSON Data (stringified): " + responseData);

        if (responseData && responseData.length > 0) {
                saveEmailCampaignToFirebase(responseData[0], uuid);
                return responseData;
        } else {
            console.log("Unexpected API response structure: " + JSON.stringify(responseData));
        }
}