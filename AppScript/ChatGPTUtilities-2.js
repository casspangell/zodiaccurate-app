// function testChatPrompt() {
//     const uuid = "be5dc835-5459-43fb-b09e-988d144cf514";
//     const instructions = getChatInstructions(TEST_USER_DATA, uuid);

//     const zodiaccurateData = getChatGPTResponse(instructions, TEST_USER_DATA, uuid);

//     const { name, email } = TEST_USER_DATA;
//     sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid);
// }

// function getChatInstructions(jsonSinglePersonData, uuid) {
//     console.log("Getting instructions for chat prompt");

//     const userData = jsonSinglePersonData;
//     const user = getUserNames(jsonSinglePersonData);
//     const userThreeDayData = getThreeDaysDataFromFirebase(uuid);
//     const astroData = getDailyAstrologicalData();
//     const seed = createSeed(uuid);
//     const predictionTimeframe = predictionTimeframes(astroData);
//     const vStyles = variationStyles();
//     const rStatus = relationshipStatus(user, jsonSinglePersonData);
//     const rGuidance = getRelationshipGuidance();
//     const psyElements = psychicElements();
//     const createInstructions = creativityInstructions(DATE_STRING, seed);
//     const prompt = getChatPrompt();
//     const creativeParams = getCreativityParams();

//     // console.log(`Using dynamic parameters: temp=${creativeParams.dynamicTemperature}, top_p=${creativeParams.dynamicTopP}, freq=${creativeParams.frequencyPenalty}, pres=${creativeParams.presencePenalty}`);

//     // console.log("USER NAMES ",user);
//     // console.log("ASTRO DATA ", astroData);
//     // console.log("SEED ", seed);
//     // console.log("PREDICTIONTIMEFRAME ", predictionTimeframe);
//     // console.log("VARIATIONSTYLES ", vStyles);
//     // console.log("RELATIONSHIP STATUS", rStatus);
//     // console.log("RELATIONSHIP GUIDANCE", rGuidance);
//     // console.log("PSYCHIC ", psyElements);
//     // console.log("VARIATION STYLES ", variationStyles);
//     // console.log("CREATIVIY INSTRUCTIONS", createInstructions);
//     console.log("PROMPT ", prompt);

//   return {
//     uuid: uuid,
//     user_names: user,
//     user_data: userData,
//     astrological_data: astroData,
//     seed: seed,
//     predictionTimeframe: predictionTimeframe,
//     variationStyles: vStyles,
//     relationshipStatus: rStatus,
//     relationshipGuidance: rGuidance,
//     psychicElements: psyElements,
//     variationStyles: variationStyles,
//     creativityInstructions: createInstructions,
//     creativeParams: creativeParams
//   };
// }


// function getChatGPTResponse(instructions, jsonSinglePersonData, uuid) {

//     const systemPrompt = getChatPrompt();
//     const params = instructions.creativeParams;
//     const instructionsString = JSON.stringify(instructions);

//     console.log("PERSON DATA ", jsonSinglePersonData);
//     console.log("INSTRUCTIONS ", instructions);
//     console.log("PROMPT ", systemPrompt);

//     try {
//         const payload = {
//         "model": "gpt-4o",
//         "max_tokens": 4096,
//         "temperature": params.temp,
//         "top_p": params.top_p,
//         "frequency_penalty": params.freq,
//         "presence_penalty": params.pres,
//         "logprobs": true,
//         "messages": [
//             {
//                 "role": "system",
//                 "content": systemPrompt
//             },
//             {
//                 "role": "user",
//                 "content": instructionsString
//             }
//         ]
//         };

//         const options = {
//             "method": "post",
//             "headers": {
//                 "Authorization": "Bearer " + CHAT_GPT_KEY,
//                 "Content-Type": "application/json"
//             },
//             "payload": JSON.stringify(payload)
//         };

//             const response = UrlFetchApp.fetch(CHAT_GPT_URL, options);
//             const jsonResponse = JSON.parse(response.getContentText());
//             const responseData = parseResponseToJson(jsonResponse);

//             if (responseData && responseData.length > 0) {
//                 console.log("Successfully parsed response data");
//                 return responseData;
//             } else {
//                 console.log("Failed to parse response data or empty result");
//                 console.log("Response content:", jsonResponse.choices[0].message.content.substring(0, 200) + "...");
//                 return null;
//             }
//         } catch (error) {
//             console.log("Error in getChatGPTResponse:", error);
//             return null;
//     }

// }