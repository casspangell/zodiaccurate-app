function testChatPrompt() {
    const uuid = "be5dc835-5459-43fb-b09e-988d144cf514";
    const instructions = getChatInstructions(TEST_USER_DATA, uuid);

    const zodiaccurateData = getChatGPTResponse(instructions, TEST_USER_DATA, uuid);

    const { name, email } = TEST_USER_DATA;
    sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid);
    saveHoroscopeToSpecificDateFirebase(zodiaccurateData, uuid, "monday");
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
    const prompt = getChatPrompt();
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
    console.log("PROMPT ", prompt);

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

    const systemPrompt = getChatPrompt();
    const params = instructions.creativeParams;
    const instructionsString = JSON.stringify(instructions);

    console.log("PERSON DATA ", jsonSinglePersonData);
    console.log("INSTRUCTIONS ", instructions);
    console.log("PROMPT ", systemPrompt);

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

function getChatEmailCampaignInstructions(uuid, jsonSinglePersonData, email) {
  console.log("GET CHAT CAMPAIGN INSTRUCTIONS");
  const campaignDate = formatDateForUser(uuid);
  const serverDate = new Date();
    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}, Campaign_Date = ${campaignDate}, Email = ${email}. Our company is Zodiaccurate. If you wish to use this name, place it as the Zodiaccurate Team or Zodiaccurate.
Your task is to create a personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services. The emails will be sent on Days 3, 5, 7, 9, 13, 17, 24, and 30 into their trial program. Add a timestamp of today's date. Do not add [Dear User] or [From Zodiaccurate]. The emails need to engage the user and persuade them to subscribe to our app. Use predictions on how using this unique astrology app will enhance their overall life, wellness, and wellbeing. Incorporate what you would be used in an astrology prediction into their life to enhance their metaphysical outlook.

For the first four emails (Days 3, 5, 7, 9):
- Create personalized, engaging content that introduces them to our app's features
- Highlight specific benefits relevant to their astrological profile
- Gradually increase the urgency to subscribe

For the last four emails (Days 13, 17, 24, 30):
1. Reference and communicate personally using their name and details from their profile
2. Acknowledge they are missing out on valuable insights that could benefit them
3. Include a 6-8 sentence general horoscope specific to that day
4. Offer a 50% off discount for the 1st month. The coupon code is { **50% off }**
5. Include a clear call to action to sign up today using this link: https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000
6. If they're not interested, ask them to take a moment to fill out our quick survey: https://docs.google.com/forms/d/e/1FAIpQLSfQTQ5WNQUgPs9oqmqm4gvcld2DSPy_-GaX66_Oxe5_6FzYxQ/viewform

Focus on these sections and generate a CSV file containing the following columns and data:
- Subject_1
- Email_1
- Subject_2
- Email_2
- Subject_3
- Email_3
- Subject_4
- Email_4
- Subject_5
- Email_5
- Subject_6
- Email_6
- Subject_7
- Email_7
- Subject_8
- Email_8
- Campaign_Date
- Name
- Email

Expand the main body of each email by including:
- Personalized details such as the user's name, family member names, occupation, or specific data from their profile.
- Relatable examples and stories tied directly to their personal goals, stressors, or experiences during the trial period (e.g., their role as a spiritual healer or their goal of work-life balance).
- Astrological insights relevant to their trial period, aligned with their birth data.
- Emotionally compelling calls to action that emphasize how subscribing will address their unique needs and goals.
- For emails 5-8 (Days 13, 17, 24, 30), make sure to include all six elements listed above, including the specific discount code and links.
- Make the final email (Day 30) especially urgent, as it's their last day of the trial.
    `;

    return prompt.trim();
}

function getChatGPTEmailCampaignResponse(instructions, uuid) {
  
    console.log("GET CHAT RESPONSE");
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        "model": "gpt-4-turbo",
        "max_tokens": 4000,
        "temperature": 1.0,
        "messages": [
            {
                "role": "system",
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide."
            },
            {
                "role": "user",
                "content": "Create personalized and unique subject lines for each email that reflect the email content and are engaging. Make the emails deeply engaging, personal, and relevant to the user's journey. Avoid repetition and technical jargon. Keep the tone conversational and friendly. Provide the CSV content enclosed in a markdown code block with the csv tag (e.g., ```csv \"Column1\",\"Column2\",\"Column3\" \"Value1\",\"Value2\",\"Value3\" ```). The first row must contain column headers, and subsequent rows must contain corresponding values. Do not include any text or explanation outside the markdown block. Ensure all values are properly quoted (e.g., \"Value\"), especially if they contain commas, line breaks, or special characters. Example format: ```csv \"Subject_1\",\"Email_1\",\"Subject_2\",\"Email_2\",\"Subject_3\",\"Email_3\",\"Subject_4\",\"Email_4\",\"Subject_5\",\"Email_5\",\"Subject_6\",\"Email_6\",\"Subject_7\",\"Email_7\",\"Subject_8\",\"Email_8\",\"Campaign_Date\",\"Name\",\"Email\"```."
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
        if (responseData && responseData.length > 0) {
                saveEmailCampaignToFirebase(responseData[0], uuid);
                return responseData;
        } else {
            console.log("Unexpected API response structure: " + JSON.stringify(responseData));
        }
}