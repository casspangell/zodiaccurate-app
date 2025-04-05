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
Your task is to create an 8-day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services on Days 3, 5, 7, and 9 into their trial program. Add a timestamp of today's date. Do not add [Dear User] or [From Zodiaccurate]. The email needs to bait the user into subscribing for the app. Use predictions on how using this unique astrology app will enhance their overall life, wellness, and wellbeing. Incorporate what you would be used in an astrology prediction into their life to enhance their metaphysical outlook.

Expand the main body of each email by including:
- Personalized details such as the user's name, family member names, occupation, or specific data from their profile.
- Relatable examples and stories tied directly to their personal goals, stressors, or experiences during the trial period (e.g., their role as a spiritual healer or their goal of work-life balance).
- Astrological insights relevant to their trial period, aligned with their birth data.
- Emotionally compelling calls to action that emphasize how subscribing will address their unique needs and goals.
- Add the signup now link in the email: ${SIGNUP_LINK}.

For Days 5-8 ONLY:
- Reference and communicate personally
- Acknowledge they are missing out of valuable insights,
- Offer a 6-8 sentence , general horoscope for that day,
- Offer a 50% off for the 1st month discount. Coupon code is {50% off}
- Add the signup now link in the email: ${SIGNUP_LINK}.

For Day 10 ONLY:
- Explain once we reach critical mass, we will increase the cost to $9.95/mth. Today, as an early bird, you can be grandfathered into our very low monthly subscription of only $4.99/mth, cancel anytime and no contract.
- Expalin that our goal is to make you look forward to each day’s insights with excitement. If we’ve fallen short, we’d greatly appreciate it if you could take a moment to fill out our quick survey = ${SURVEY_LINK}. Your feedback will help us improve and, hopefully, earn your subscription in the future.
- Thank them for trying Zodiaccurate.


Here is an example output:
"\`\`\`csv\n\"Subject_1\",\"Email_1\",\"Subject_2\",\"Email_2\",\"Subject_3\",\"Email_3\",\"Subject_4\",\"Email_4\",\"Subject_5\",\"Email_5\",\"Subject_6\",\"Email_6\",\"Subject_7\",\"Email_7\",\"Subject_8\",\"Email_8\",\"Campaign_Date\",\"Name\",\"Email\"\n\"Paul, Align Your Spiritual Healing Journey with Cosmic Guidance\",\"Greetings Paul, As a spiritual healer, you understand the profound connection between inner wisdom and cosmic energy. With the moon moving through your fourth house, Zodiaccurate invites you to deepen your introspective practice. Your desire to minimize negative thinking aligns perfectly with this celestial moment of reflection. Imagine having daily insights that support your spiritual growth, helping you become more aware of your mental patterns and supporting your journey of self-improvement. Your commitment to personal development resonates with the universe's current energy. Let Zodiaccurate be the compass that guides you towards greater self-awareness and spiritual alignment. <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Navigating Your Professional Path with Astrological Precision\",\"Greetings Paul, Mercury's transit through your career sector illuminates opportunities for your spiritual healing and guidance counseling business. Your analytical approach combined with intuitive insights makes you uniquely positioned for success. Zodiaccurate can help you balance your professional aspirations with your goal of work-life harmony. We understand your drive to create a business that operates with minimal daily intervention, and our cosmic insights can guide you towards that vision. Your self-employed journey is about to receive celestial support. Unlock your professional potential: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Holistic Wellness: Your Cosmic Blueprint\",\"Greetings Paul, The Sun's current position highlights your physical and mental wellness goals. We see your desire to wake up consistently at 6 AM, improve your energy, and maintain a balanced lifestyle. Zodiaccurate offers personalized insights to support your wellness journey, helping you address your goals of consistent spiritual practice and balanced energy. Your commitment to being a better father and understanding your daughter Elice's behaviors can be supported by our holistic approach. Transform your wellness path with cosmic guidance: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Spiritual Growth Through Cosmic Consciousness\",\"Greetings Paul, Neptune's influence invites you deeper into spiritual exploration. Your journey of minimizing negative thoughts and expanding spiritual awareness is cosmically supported. As a spiritual healer, you understand that true growth comes from self-reflection and cosmic alignment. Zodiaccurate provides the insights you need to continue your profound spiritual journey, supporting your goals of personal transformation and understanding. Embrace your path of spiritual evolution: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Missed Cosmic Insights Revealed\",\"Greetings Paul, Mars is activating your intuition sector today. Your ability to manifest is heightened, and unexpected opportunities are emerging. Today's cosmic configuration suggests a breakthrough in your spiritual healing practice. Jupiter's alignment indicates potential financial improvements and opportunities to expand your business. Your natural healing abilities are amplified, making this a powerful day for personal and professional growth. The universe is speaking – are you listening? Don't miss these insights! Subscribe now with {50% off}: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Your Cosmic Breakthrough Awaits\",\"Paul, Mercury's retrograde is illuminating hidden opportunities in your spiritual and professional path. Your analytical skills combined with intuitive wisdom are your greatest assets. Today's alignment suggests a potential breakthrough in your guidance counseling work. The stars indicate a moment of profound personal insight and professional potential. Trust your inner wisdom and remain open to unexpected guidance. Unlock these exclusive insights with {50% off}: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Transformative Cosmic Energy Unveiled\",\"Paul, Venus is dancing through your personal growth sector, bringing unprecedented opportunities for spiritual and emotional expansion. Your commitment to personal development is cosmically supported. The universe is orchestrating a profound shift in your life's trajectory, particularly in your healing practice and family dynamics. Each planetary movement is carefully guiding you towards your true potential. Stay attuned to these cosmic whispers. Subscribe now with {50% off}: <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Sign Up Now!</a>\",\"Paul, Your Final Cosmic Invitation\",\"Paul, This is your moment of truth. Our price will soon increase to $9.95/month, but today, you can lock in our exclusive rate of just $4.99/month. As a spiritual healer who values personal growth, these daily insights are your gateway to deeper understanding. We've crafted a tool that speaks directly to your journey of self-improvement and spiritual awareness. If we haven't fully convinced you, we genuinely want to hear why. Please share your thoughts: <a href='https://docs.google.com/forms/d/e/1FAIpQLSfQTQ5WNQUgPs9oqmqm4gvcld2DSPy_-GaX66_Oxe5_6FzYxQ/viewform'>Questionaire</a>. <a href='https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000'>Subscribe Now!</a> and transform your life.\",\"04/05/2025\",\"Paul Fletcher\",\"example@gmail.com\"\n\`\`\`"
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