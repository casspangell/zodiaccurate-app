// function testChatPrompt() {
//     const uuid = "be5dc835-5459-43fb-b09e-988d144cf514";
//     const instructions = getChatInstructions(TEST_USER_DATA, uuid);
//     const output = getChatGPTResponse(instructions, uuid);
// }

// function getChatInstructions(jsonSinglePersonData, uuid) {
//     console.log("GET CHAT INSTRUCTIONS");
//     const modifiers = getRandomModifiers();
//     const user = getUserNames(jsonSinglePersonData);
//     const getWeekData = getThreeDaysDataFromFirebase(uuid);
    
//     // Get current astrological data
//     // const astroData = getDailyAstrologicalData();
    
//     // Get current date for reference
//     const today = new Date();
//     const dateString = today.toISOString().split('T')[0];
//     const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    
//     // Create a truly unique random seed that changes daily
//     const randomSeed = `${dateString}-${uuid}-${Math.random().toString(36).substring(2, 15)}-${today.getHours()}`;
    
//     // Select a prediction timeframe that varies each day
//     const predictionTimeframes = [
//         "in the next 24 hours", 
//         "this week", 
//         "within the next three days", 
//         "before the next full moon",
//         "by the end of this month",
//         "before the next Mercury retrograde", 
//         "within the next lunar cycle",
//         "by the weekend",
//         "before the month ends",
//         "as the Sun moves through " + astroData.sunPosition,
//         "while Mercury travels through " + astroData.mercuryPosition,
//         "as the Moon waxes toward fullness",
//         "as the Moon wanes from fullness",
//         "during this " + astroData.currentMoonPhase + " phase"
//     ];
//     const todaysPredictionTimeframe = predictionTimeframes[today.getDay() + today.getDate() % predictionTimeframes.length];
    
//     // Dynamic instruction variations to encourage unique content
//     const variationStyles = [
//         "Use vivid sensory language and unexpected metaphors today",
//         "Emphasize the contrasts and polarities in cosmic energies today",
//         "Focus on the transformative potential of today's aspects",
//         "Highlight subtle, often overlooked astrological influences today",
//         "Emphasize the cyclical nature of cosmic patterns today",
//         "Focus on how micro-cosmic events mirror macro-cosmic patterns today"
//     ];
//     const todaysStyle = variationStyles[today.getDate() % variationStyles.length];
    
//     // Check relationship status to determine appropriate guidance
//     const isInRelationship = user.partnerName && user.partnerName.trim() !== "";
//     const isSingle = jsonSinglePersonData.relationship_status && 
//                    (jsonSinglePersonData.relationship_status.toLowerCase().includes("single") || 
//                     jsonSinglePersonData.relationship_status.toLowerCase().includes("divorced") ||
//                     jsonSinglePersonData.relationship_status.toLowerCase().includes("widowed") ||
//                     jsonSinglePersonData.relationship_status.toLowerCase().includes("seeking"));
    
//     // Create section templates with built-in variability, predictions, and psychic elements
//     let sections = [
//         `- Career and Finances: Begin with a SPECIFIC PREDICTION about a career or financial opportunity that will manifest for ${user.firstName} ${todaysPredictionTimeframe}. This prediction should reference how ${astroData.currentPlanetaryPositions} influences their work life. Describe a SPECIFIC COLOR, SYMBOL, or NUMBER that will be significant for them in career matters today (like "Notice the color blue in your workspace as it signals opportunity" or "The number 7 appears in financial transactions that will be favorable"). Include one concrete challenge ${user.firstName} may face at work and how today's unique planetary positions can help overcome it. Focus on ${jsonSinglePersonData.career_goals || "professional growth"} and incorporate ${modifiers.careerAndFinances}. End with a specific financial insight that feels intuitive and prescient.`,
        
//         `- Health: Start with a SPECIFIC PREDICTION about a health pattern or physical sensation ${user.firstName} will experience ${todaysPredictionTimeframe} due to ${astroData.currentMoonPhase} and ${astroData.currentRetrogrades}. Reference the specific body part or energy center (chakra) most affected by today's planetary alignments. Include an intuitive insight about a FOOD, HERB, or NATURAL ELEMENT that will have special healing properties for them today. Recommend a specific movement, breath practice, or mindfulness technique that aligns with today's cosmic energy. Incorporate ${modifiers.health} and connect to ${jsonSinglePersonData.wellness_goals || "general well-being"}. End with a prediction about how their energy levels will shift throughout the day.`,
        
//         `- Personal Guidance: Start with a SPECIFIC PREDICTION about an unexpected insight or revelation ${user.firstName} will experience ${todaysPredictionTimeframe} related to ${astroData.significantTransit}. Describe a DREAM SYMBOL, ANIMAL, or REPEATING PATTERN they should watch for as a message from the universe. Predict a specific synchronicity they might experience today (like "Watch for three references to water today as a sign to dive deeper into your emotions"). Reference ${jsonSinglePersonData.important_goals || "personal aspirations"} and include ${modifiers.personalGuidance}. End with an insight about a specific talent or gift they possess that is especially powerful under today's planetary aspects.`
//     ];
    
//     // Conditionally add enhanced relationship section with mini-horoscope and intimacy guidance for those WITH partners
//     if (isInRelationship) {
//         sections.push(
//             `- Relationships: Begin with a MINI-HOROSCOPE specifically for ${user.partnerName} today: How ${astroData.venusPosition}, ${astroData.marsPosition}, and ${astroData.currentMoonSign} are affecting their emotions, energy, and communication style today. What ${user.partnerName} is likely experiencing, feeling, or thinking about under today's cosmic weather. Then, provide a SPECIFIC PREDICTION about how the connection between ${user.firstName} and ${user.partnerName} will evolve ${todaysPredictionTimeframe}. Describe a COMMUNICATION PATTERN to watch for today (like "Notice when ${user.partnerName} speaks more quietly than usual - this is when they need extra emotional support"). Identify a specific CHALLENGE or OPPORTUNITY in your relationship that's activated by today's planetary aspects, and give concrete guidance on how to navigate it. 
            
//             INTIMATE CONNECTION GUIDANCE: Describe how today's specific planetary positions (especially ${astroData.venusPosition}, ${astroData.marsPosition}, and ${astroData.currentMoonSign}) are influencing the intimate and physical connection between ${user.firstName} and ${user.partnerName}. Identify optimal timing or conditions for deepening physical intimacy today based on cosmic energy. Suggest a specific approach, mood, or setting that would enhance lovemaking under today's unique astrological influences. Include one specific way to create deeper emotional connection during intimate moments that aligns with today's cosmic weather. End with a prediction about how focusing on physical intimacy today might positively affect other aspects of your relationship.
            
//             Include specific actions ${user.firstName} can take to strengthen the overall connection, based on how ${user.partnerName} is experiencing today's energies. Reference ${jsonSinglePersonData.partner_improvements || "relationship goals"} and incorporate ${modifiers.relationships}. End with a prediction about a meaningful moment or exchange that's likely to occur between them today.`
//         );
//     }
//     // Add relationship guidance for SINGLE people
//     else if (isSingle) {
//         sections.push(
//             `- Relationship Seeking: Begin with a SPECIFIC PREDICTION about how today's unique cosmic energy is influencing ${user.firstName}'s romantic magnetism and relationship potential. Describe which facets of ${user.firstName}'s personality are being cosmically enhanced today that might attract potential partners. Identify specific LOCATIONS, ACTIVITIES, or SOCIAL CONTEXTS that are astrologically favorable for meeting compatible people ${todaysPredictionTimeframe} based on today's planetary positions. Suggest a specific APPEARANCE ELEMENT (color to wear, accessory, hairstyle) that will enhance attractive energy under today's cosmic influences.
            
//             Note a specific COMMUNICATION STYLE or APPROACH that will be especially effective in romantic interactions today. Identify one specific PATTERN or HABIT from past relationships that today's planetary alignments are helping ${user.firstName} to recognize or release. Provide insight into what type of potential partner would be most compatible under current transits, and what signals to watch for that indicate genuine connection potential. Include a specific prediction about a romantic opportunity or insight that will emerge ${todaysPredictionTimeframe}. End with practical guidance on one specific way to open up to new connections that aligns with today's unique astrological energy.`
//         );
//     }
    
//     // Conditionally add enhanced parenting guidance with mini-horoscopes
//     if (user.childrenNames && user.childrenNames.length > 0) {
//         const childrenString = user.childrenNames.join(", ");
        
//         let childGuidance = `- Parenting Guidance: guidance specifically affecting their mood, energy level, learning style, and emotional needs today. `;
        
//         // If there's just one child
//         if (user.childrenNames.length === 1) {
//             childGuidance += `Describe what ${user.childrenNames[0]} is likely experiencing today and what they most need from ${user.firstName}. Identify a specific CHALLENGE ${user.childrenNames[0]} might face today based on the current planetary positions, and how ${user.firstName} can help them navigate it. `;
//         } 
//         // If there are multiple children
//         else {
//             childGuidance += `Briefly describe how each child might be experiencing today's energies differently. Identify one specific way ${user.firstName} can connect with each child today based on their unique needs under the current cosmic weather. `;
//         }
        
//         sections.push(childGuidance);
//     }
    
//     // Conditionally add enhanced important person section
//     if (user.importantPersonNames && user.importantPersonNames.length > 0) {
//         const importantPerson = user.importantPersonNames[0];
//         sections.push(
//             `- Important Person Relationship: Using horoscope data for ${importantPerson} integrate it. Describe what ${importantPerson} is likely experiencing and what they might need from ${user.firstName} under today's cosmic influences. Then provide a SPECIFIC PREDICTION about a shift or development in the relationship ${todaysPredictionTimeframe}. Identify a COMMUNICATION PATTERN to watch for that signals an important message or need from this person. Predict a specific interaction or exchange and how to navigate it for the best outcome. Suggest a concrete way to strengthen the connection based on how ${importantPerson} is experiencing today's energies. Reference ${jsonSinglePersonData.important_goals || "relationship aspirations"} and include ${modifiers.importantPersonRelationship}. End with an intuitive insight about how this relationship is evolving in ${user.firstName}'s life journey.`
//         );
//     }
    
//     // Join all sections with newlines
//     const sectionsText = sections.join("\n\n        ");
    
//     // Add relationship guidance instructions
//     const relationshipGuidance = `
//         RELATIONSHIP GUIDANCE:
//         1. For all relationships: Describe their emotional state, communication needs, and one planetary challenge today. Suggest 1-2 specific connection activities.

//         2. For partners: Include tasteful intimate connection advice based on today's Venus/Mars/Moon positions. Suggest one specific timing or approach that deepens emotional bonding.

//         3. For singles: Describe how today's cosmic weather affects romantic prospects. Suggest one specific place/activity for meeting someone and one effective communication approach.
//         `;

//         const psychicElements = `
//         PREDICTION ELEMENTS:
//         1. Include one specific, testable prediction for each category within the timeframe mentioned
//         2. Add one intuitive element per category (color, symbol, number, or synchronicity) to watch for
//         3. Balance mystical insights with practical guidance
//         4. Ensure predictions feel personal and include one surprising element per category
//         `;

//         const creativityInstructions = `
//         CREATIVITY REQUIREMENTS:
//         1. Make this horoscope different from previous ones - no reusing phrases or symbols
//         2. Reference today's date (${dateString}) and current seasonal elements
//         3. Create specific, testable predictions using seed: ${randomSeed}
//         4. Today's style: ${todaysStyle}
//         5. Include at least one completely new element in each category
//         `;
    
//     // Build the complete prompt with enhanced instructions for variety and predictions
//     const prompt = `
//         Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        
//         TODAY'S UNIQUE HOROSCOPE SEED: ${randomSeed}
//         TODAY'S DATE: ${dayOfWeek}, ${dateString}
//         PREDICTION TIMEFRAME: ${todaysPredictionTimeframe}
        
//         Your task is to create a HIGHLY SPECIFIC daily, personalized horoscope for ${user.firstName} with meaningful PREDICTIONS, INTUITIVE INSIGHTS, and RELATIONSHIP GUIDANCE that is SUBSTANTIALLY DIFFERENT from previous days' horoscopes. This horoscope must relate directly to TODAY'S specific astrological conditions listed above. Use a 40% personal data and 60% zodiac predictions and astrological insights ratio. Focus on these sections and generate a CSV file containing the following columns and data:
//         ${sectionsText}
        
//         ${relationshipGuidance}
        
//         ${psychicElements}
        
//         ${creativityInstructions}

//         REVIEW PREVIOUS HOROSCOPES FOR CONTRAST:
//         ${getWeekData}
        
//         Compare your output with these previous horoscopes and ensure you are creating something distinctly different in tone, style, and content. YOUR CREATIVITY WILL BE SPECIFICALLY EVALUATED ON ORIGINALITY AND CONTRAST WITH PREVIOUS DAYS.
        
//         Format your response ONLY as a CSV with the columns matching EXACTLY the section names mentioned above. The CSV must be enclosed in a markdown code block. For example:
        
//         \`\`\`csv
//         "Career and Finances","Health","Personal Guidance"
//         "Your career advice here...","Your health advice here...","Your personal guidance here..."
//         \`\`\`
        
//         Do not include any other text outside the code block. Do not include empty columns for sections that weren't mentioned above.
//     `;

//     return prompt.trim();
// }

// /**
//  * Fetches a response from the ChatGPT API based on the provided instructions.
//  * Updated to explicitly specify which columns to include based on user data.
//  * Fixed to use proper markdown code block syntax.
//  *
//  * @param {string} instructions - The ChatGPT prompt containing user data and instructions.
//  * @param {string} uuid - The unique identifier for the user.
//  * @returns {Object|null} - The parsed response data if successful, or null on failure.
//  */
// function getChatGPTResponse(instructions, uuid) {
//     const url = 'https://api.openai.com/v1/chat/completions';
    
//     try {
//         // Parse JSON data from the instructions to determine which sections to include
//         const dataMatch = instructions.match(/Here is user data: (\{.*?\})/);
//         let jsonData = {};
        
//         if (dataMatch && dataMatch[1]) {
//             try {
//                 jsonData = JSON.parse(dataMatch[1]);
//             } catch (e) {
//                 console.log("Could not parse user data JSON from instructions:", e);
//             }
//         }
        
//         // Use getUserNames to determine which sections should be present
//         const user = getUserNames(jsonData);
        
//         // Base columns that are always included
//         const columns = [
//             "Career and Finances", 
//             "Health", 
//             "Personal Guidance"
//         ];
        
//         // Add relationship column if partner exists
//         if (user.partnerName && user.partnerName.trim() !== "") {
//             columns.push("Relationships");
//         }
        
//         // Add parenting column if children exist
//         if (user.childrenNames && user.childrenNames.length > 0) {
//             columns.push("Parenting Guidance");
//         }
        
//         // Add important person column if important persons exist
//         if (user.importantPersonNames && user.importantPersonNames.length > 0) {
//             columns.push("Important Person Relationship");
//         }
        
//         console.log("Columns to include:", columns);
        
//         // Create a detailed system prompt with explicit column instructions and fixed code block syntax
//         const systemPrompt = `You are bob brezney, a highly knowledgeable and empathetic astrologer and personal guide. 
// Your task is to generate a personalized daily astrological horoscope in CSV format based on the provided data.

// CRITICAL STRUCTURAL REQUIREMENTS:
// 1. Keep all sentences under 30 words maximum
// 2. Use no more than 3 sentences in a row with similar structure
// 3. Each paragraph must have 3-7 sentences maximum
// 4. NEVER create run-on sentences with excessive conjunctions
// 5. NEVER create word lists or chains of associated words
// 6. Maintain clear paragraph breaks and logical progression
// 7. Use proper punctuation and avoid excessive comma usage
// 8. IMMEDIATELY STOP AND RESTART if you find yourself in a loop of similar words
// 9. Limit adjective sequences to maximum of 2-3 per noun
// 10. Avoid repeated use of the same grammatical constructions

// FORBIDDEN PATTERNS:
// - No sentences longer than 30 words
// - No lists of similar words (synonyms, related concepts, etc.)
// - No excessive use of adverbs, especially -ly adverbs in sequence
// - No "stream of consciousness" writing without proper structure
// - No repetitive phrases or word patterns

// IMPORTANT FORMATTING INSTRUCTIONS:
// 1. Include ONLY these specific columns in your CSV: ${columns.join(', ')}
// 2. Do NOT include any columns that aren't in this list
// 3. Provide the CSV content enclosed in a markdown code block
// 4. The first row must contain ONLY these column headers exactly as written
// 5. Subsequent rows must contain corresponding values
// 6. Do not include any text or explanation outside the markdown block
// 7. Ensure all values are properly quoted (e.g., "Value"), especially if they contain commas or line breaks

// Example correct format:

// \`\`\`csv
// "${columns.join('","')}"
// "Value for first column","Value for second column"${columns.length > 2 ? ',...' : ''}
// \`\`\`

// Speak like bob brezney, creator of free will horoscope, referencing and predicting astrological phenomena in each category. Address the user by their first name and mention any important people in their life when relevant. Final check: Review the completed horoscope to ensure it meets tone, personalization, and astrological accuracy standards.`;

//         const payload = {
//             "model": "gpt-4o",
//             "max_tokens": 4096,
//             "temperature": dynamicTemperature,
//             "top_p": dynamicTopP,
//             "frequency_penalty": frequencyPenalty,
//             "presence_penalty": presencePenalty,
//             "logprobs": true,
//             "messages": [
//                 {
//                     "role": "system",
//                     "content": systemPrompt
//                 },
//                 {
//                     "role": "user",
//                     "content": instructions
//                 }
//             ]
//         };

//         const options = {
//             "method": "post",
//             "headers": {
//                 "Authorization": "Bearer " + CHAT_GPT_KEY,
//                 "Content-Type": "application/json"
//             },
//             "payload": JSON.stringify(payload)
//         };

//         // Log request details (sanitize for security)
//         console.log("Making API request to ChatGPT");
//         console.log("Request columns:", columns);
        
//         const response = UrlFetchApp.fetch(url, options);
//         const jsonResponse = JSON.parse(response.getContentText());

//         // Extract token usage details
//         var promptTokens = jsonResponse.usage.prompt_tokens;
//         var completionTokens = jsonResponse.usage.completion_tokens;
//         var totalTokens = jsonResponse.usage.total_tokens;

//         // Log the token usage
//         Logger.log("Prompt Tokens: " + promptTokens);
//         Logger.log("Completion Tokens: " + completionTokens);
//         Logger.log("Total Tokens: " + totalTokens);

//         // Parse the response using your existing parser
//         const responseData = parseResponseToJson(jsonResponse);

//         if (responseData && responseData.length > 0) {
//             console.log("Successfully parsed response data");
//             return responseData;
//         } else {
//             console.log("Failed to parse response data or empty result");
//             console.log("Response content:", jsonResponse.choices[0].message.content.substring(0, 200) + "...");
//             return null;
//         }
//     } catch (error) {
//         console.log("Error in getChatGPTResponse:", error);
//         return null;
//     }
// }

// /**
//  * Gets current astrological data for today
//  * This function simulates astrological data based on the current date
//  * In a production environment, you could replace this with an API call to a real astrology service
//  * 
//  * @returns {Object} - Object containing various astrological data points for today
//  */
// function getDailyAstrologicalData() {
//     const today = new Date();
//     const day = today.getDate();
//     const month = today.getMonth() + 1;
    
//     // Lunar phases (approximate based on date)
//     const lunarDay = day % 30;
//     let moonPhase;
//     if (lunarDay < 4) moonPhase = "New Moon";
//     else if (lunarDay < 11) moonPhase = "Waxing Crescent";
//     else if (lunarDay < 15) moonPhase = "First Quarter";
//     else if (lunarDay < 19) moonPhase = "Waxing Gibbous";
//     else if (lunarDay < 22) moonPhase = "Full Moon";
//     else if (lunarDay < 26) moonPhase = "Waning Gibbous";
//     else if (lunarDay < 30) moonPhase = "Last Quarter";
//     else moonPhase = "Waning Crescent";
    
//     // Zodiac signs (approximate)
//     const zodiacSigns = [
//         "Aries", "Taurus", "Gemini", "Cancer", 
//         "Leo", "Virgo", "Libra", "Scorpio", 
//         "Sagittarius", "Capricorn", "Aquarius", "Pisces"
//     ];
    
//     // Planet positions (simplified - would come from real ephemeris)
//     // const moonPosition = zodiacSigns[(month + day % 12) % 12];
//     // const sunPosition = zodiacSigns[(month - 1 + Math.floor(day/30)) % 12];
//     // const mercuryPosition = zodiacSigns[(month + 2 + day % 12) % 12];
//     // const venusPosition = zodiacSigns[(month + 1 + Math.floor(day/15)) % 12];
//     // const marsPosition = zodiacSigns[(month + 3 + Math.floor(day/20)) % 12];
//     // const jupiterPosition = zodiacSigns[(month + 4 + Math.floor(day/25)) % 12];
    
//     // Retrogrades (simulated based on date)
//     // const retrogradeOptions = [
//     //     "Mercury Retrograde",
//     //     "Venus Retrograde", 
//     //     "Mars Retrograde",
//     //     "Jupiter Retrograde",
//     //     "Saturn Retrograde",
//     //     "Uranus Retrograde",
//     //     "Neptune Retrograde",
//     //     "Pluto Retrograde",
//     //     "No major planets in retrograde"
//     // ];
    
//     // // Select retrogrades based on day
//     // const retrogradeIndex = (day * month) % retrogradeOptions.length;
//     // const currentRetrogrades = retrogradeOptions[retrogradeIndex];
    
//     // Significant transits (important planet movements)
//     // const transitOptions = [
//     //     `Mercury entering ${mercuryPosition}`,
//     //     `Venus and Mars in ${venusPosition} creating a trine aspect`,
//     //     `Sun square Jupiter in ${jupiterPosition}`,
//     //     `New Moon in ${moonPosition}`,
//     //     `Full Moon opposing Saturn`,
//     //     `Mars conjunct Pluto in ${marsPosition}`,
//     //     `Jupiter entering ${jupiterPosition}`,
//     //     `Mercury sextile Venus`,
//     //     `Saturn stationing direct`,
//     //     `Venus square Uranus`,
//     //     `Sun conjunct Mercury in ${sunPosition}`,
//     //     `Neptune trine Mars`
//     // ];
    
//     // const transitIndex = (day + month) % transitOptions.length;
//     // const significantTransit = transitOptions[transitIndex];
    
//     // Current planetary positions summary
//     // const planetarySummaries = [
//     //     `Mercury in ${mercuryPosition} and Jupiter in ${jupiterPosition} creating a harmonious trine`,
//     //     `Sun in ${sunPosition} squaring Saturn, creating tension with authority figures`,
//     //     `Venus in ${venusPosition} opposing Mars in ${marsPosition}, heightening relationship dynamics`,
//     //     `Mercury retrograde in ${mercuryPosition} causing communication challenges`,
//     //     `Jupiter in ${jupiterPosition} forming a grand trine with Saturn and Neptune`,
//     //     `Mars in ${marsPosition} squaring Pluto, intensifying power dynamics`,
//     //     `Venus in ${venusPosition} conjunct Jupiter in ${jupiterPosition}, bringing abundance`,
//     //     `Mercury, Venus, and Mars forming a stellium in ${mercuryPosition}`,
//     //     `Sun in ${sunPosition} trine Moon in ${moonPosition}, creating emotional harmony`,
//     //     `Saturn opposing Uranus, creating tension between tradition and innovation`,
//     //     `Neptune retrograde causing spiritual awakening and revealing illusions`,
//     //     `Pluto stationing direct, bringing transformation to power structures`,
//     //     `Chiron stationed retrograde in Aries, triggering healing of old wounds`,
//     //     `North Node in Taurus emphasizing financial stability and natural resources`,
//     //     `Lilith in ${zodiacSigns[(month + 5) % 12]} amplifying personal boundaries and authentic expression`,
//     //     `Ceres conjunct Venus in ${venusPosition}, nurturing relationships and self-worth`,
//     //     `Pallas Athena in ${zodiacSigns[(month + 6) % 12]} enhancing strategic thinking and creative problem-solving`,
//     //     `Vesta in ${zodiacSigns[(month + 7) % 12]} illuminating your sacred purpose and dedication`,
//     //     `Juno in ${zodiacSigns[(month + 8) % 12]} highlighting partnership commitments and equality`,
//     //     `Eclipse season approaching, amplifying transformation and revelations`,
//     //     `Mercury out of shadow phase, clearing communication channels`,
//     //     `Uranus square Mars creating unexpected breakthroughs and restlessness`,
//     //     `Neptune forming a grand water trine with personal planets, deepening intuition`,
//     //     `Saturn forming positive aspects to natal planets, strengthening foundations`
//     // ];
    
//     // const planetaryIndex = (day * month + day) % planetarySummaries.length;
//     // const currentPlanetaryPositions = planetarySummaries[planetaryIndex];

//     return {
//         currentMoonPhase: moonPhase,
//         // currentMoonSign: moonPosition,
//         // currentRetrogrades: currentRetrogrades,
//         // significantTransit: significantTransit,
//         // sunPosition: sunPosition,
//         // mercuryPosition: mercuryPosition,
//         // venusPosition: venusPosition,
//         // marsPosition: marsPosition,
//         // jupiterPosition: jupiterPosition,
//         // currentPlanetaryPositions: currentPlanetaryPositions
//     };
// }

// function getRandomModifiers() {
//   var overviewModifier = overviewModifiers[Math.floor(Math.random() * overviewModifiers.length)];
//   var careerAndFinancesModifier = careerAndFinancesModifiers[Math.floor(Math.random() * careerAndFinancesModifiers.length)];
//   var relationshipsModifier = relationshipsModifiers[Math.floor(Math.random() * relationshipsModifiers.length)];
//   var parentingGuidanceModifier = parentingGuidanceModifiers[Math.floor(Math.random() * parentingGuidanceModifiers.length)];
//   var healthModifier = healthModifiers[Math.floor(Math.random() * healthModifiers.length)];
//   var personalGuidanceModifier = personalGuidanceModifiers[Math.floor(Math.random() * personalGuidanceModifiers.length)];

//   console.log("Mod-MODIFIERS: Overview: "+overviewModifier+", Career and Finances: "+careerAndFinancesModifier+" Relationships: "+relationshipsModifier+" Parenting Guidance: "+parentingGuidanceModifier+" Health: "+ healthModifier+" Personal Guidance: "+personalGuidanceModifier);

//   return {
//     overview: overviewModifier,
//     careerAndFinances: careerAndFinancesModifier,
//     relationships: relationshipsModifier,
//     parentingGuidance: parentingGuidanceModifier,
//     health: healthModifier,
//     personalGuidance: personalGuidanceModifier
//   };
// }

// var overviewModifiers = [
//   "Focus on clarity and understanding today.",
//   "Consider how today's events shape your future.",
//   "Reflect on the opportunities present in your life.",
//   "Emphasize the positive aspects of your current situation.",
//   "Today's challenges can lead to personal growth.",
//   "Look for the silver lining in today's circumstances.",
//   "Think about long-term goals and how today fits into them.",
//   "Pay attention to your intuition today.",
//   "Today is a day for reflection and contemplation.",
//   "Consider how your actions today affect those around you.",
//   "Focus on the present moment and its importance.",
//   "Take a step back to gain a broader perspective.",
//   "Consider the balance between work and personal life today.",
//   "Today may bring unexpected opportunities.",
//   "Focus on personal development and self-improvement.",
//   "Think about how you can make a positive impact today.",
//   "Today is a day for making thoughtful decisions.",
//   "Consider how your current path aligns with your values.",
//   "Reflect on your progress and where you're headed.",
//   "Focus on creating harmony in your life today."
// ];

// var careerAndFinancesModifiers = [
//   "Consider how today's tasks contribute to your long-term career goals.",
//   "Think about new ways to manage your finances effectively.",
//   "Today's efforts may lead to significant progress in your career.",
//   "Focus on improving your financial habits.",
//   "Reflect on how to achieve a better work-life balance.",
//   "Today might be a good day to explore new career opportunities.",
//   "Think about how to optimize your productivity.",
//   "Consider the financial implications of your decisions today.",
//   "Focus on setting clear, achievable goals.",
//   "Today is a day to take calculated risks in your career.",
//   "Think about ways to increase your financial security.",
//   "Consider how you can advance in your current role.",
//   "Today's decisions could have long-term financial benefits.",
//   "Reflect on your career path and where you want to go.",
//   "Focus on professional growth and learning new skills.",
//   "Think about ways to diversify your income streams.",
//   "Consider how you can improve your financial planning.",
//   "Today may bring new opportunities for career advancement.",
//   "Reflect on the financial aspects of your current lifestyle.",
//   "Focus on building strong professional relationships."
// ];

// var relationshipsModifiers = [
//   "Consider how you can strengthen your relationships today.",
//   "Focus on improving communication with loved ones.",
//   "Today is a good day to express appreciation for others.",
//   "Reflect on the role of trust in your relationships.",
//   "Think about ways to deepen emotional connections.",
//   "Consider how your actions affect those around you.",
//   "Focus on resolving any ongoing conflicts.",
//   "Today is a day to nurture your relationships.",
//   "Reflect on the balance between giving and receiving in your relationships.",
//   "Think about how you can support the goals of those you care about.",
//   "Consider how you can show love and affection today.",
//   "Focus on the importance of honesty in your relationships.",
//   "Today might be a good day to reconnect with someone.",
//   "Reflect on how you can build stronger bonds with others.",
//   "Think about ways to be more present in your relationships.",
//   "Consider the importance of empathy and understanding.",
//   "Focus on spending quality time with loved ones.",
//   "Today is a day to celebrate your relationships.",
//   "Reflect on how your relationships contribute to your happiness.",
//   "Think about how you can maintain healthy boundaries."
// ];

// var parentingGuidanceModifiers = [
//   "Focus on understanding your child's needs today.",
//   "Consider how you can support your child's emotional growth.",
//   "Today is a good day to spend quality time with your child.",
//   "Reflect on the importance of positive reinforcement.",
//   "Think about ways to encourage your child's curiosity.",
//   "Consider how your actions influence your child's behavior.",
//   "Focus on building a strong bond with your child.",
//   "Today might be a good day to teach your child something new.",
//   "Reflect on how you can be a better role model.",
//   "Think about ways to foster your child's independence.",
//   "Consider the importance of consistency in parenting.",
//   "Focus on listening to your child and understanding their perspective.",
//   "Today is a day to encourage your child's creativity.",
//   "Reflect on how you can support your child's goals.",
//   "Think about ways to make learning fun for your child.",
//   "Consider how you can help your child develop resilience.",
//   "Focus on creating a loving and supportive environment.",
//   "Today is a day to celebrate your child's achievements.",
//   "Reflect on how you can be more patient with your child.",
//   "Think about ways to strengthen your relationship with your child."
// ];

// var healthModifiers = [
//   "Focus on maintaining a balanced diet today.",
//   "Consider how you can improve your physical fitness.",
//   "Today is a good day to prioritize mental health.",
//   "Reflect on the importance of regular exercise.",
//   "Think about ways to reduce stress in your life.",
//   "Consider how your habits impact your long-term health.",
//   "Focus on getting enough rest and sleep.",
//   "Today might be a good day to try a new healthy activity.",
//   "Reflect on how you can improve your overall well-being.",
//   "Think about ways to incorporate more movement into your day.",
//   "Consider the importance of hydration for your health.",
//   "Focus on making healthy choices in your diet.",
//   "Today is a day to practice mindfulness and relaxation.",
//   "Reflect on how you can support your immune system.",
//   "Think about ways to improve your emotional health.",
//   "Consider the benefits of regular medical check-ups.",
//   "Focus on developing a sustainable health routine.",
//   "Today might be a good day to set new health goals.",
//   "Reflect on the connection between physical and mental health.",
//   "Think about ways to maintain a positive outlook on life."
// ];

// var personalGuidanceModifiers = [
//   "Focus on your personal growth and self-improvement.",
//   "Consider how you can develop new skills.",
//   "Today is a good day to set personal goals.",
//   "Reflect on the importance of self-care.",
//   "Think about ways to increase your self-confidence.",
//   "Consider how you can find more balance in your life.",
//   "Focus on pursuing your passions and hobbies.",
//   "Today might be a good day to explore new opportunities.",
//   "Reflect on how you can be more present in the moment.",
//   "Think about ways to enhance your personal relationships.",
//   "Consider the importance of self-reflection and introspection.",
//   "Focus on staying motivated and determined.",
//   "Today is a day to embrace positive change.",
//   "Reflect on your strengths and how to build on them.",
//   "Think about ways to overcome personal challenges.",
//   "Consider how you can create more joy in your life.",
//   "Focus on being kind and compassionate to yourself.",
//   "Today might be a good day to practice gratitude.",
//   "Reflect on your achievements and how far you've come.",
//   "Think about ways to cultivate a growth mindset."
// ];

// var importantPersonRelationshipModifiers = [
//   "Take a moment to express appreciation for the important people in your life.",
//   "Consider reaching out to a mentor, close friend, or family member for a meaningful conversation.",
//   "Focus on strengthening mutual understanding and emotional support in this relationship.",
//   "Reflect on ways to improve communication and foster a deeper connection.",
//   "Think about how you can show gratitude for their presence and influence in your life.",
//   "Today is a good day to offer support or encouragement to someone who has been there for you.",
//   "Consider how this relationship has shaped your growth and what you can do to nurture it further.",
//   "Think about setting healthy boundaries while maintaining a sense of closeness.",
//   "Reflect on past challenges in this relationship and how they have helped strengthen your bond.",
//   "Today might be a good day to share your thoughts and emotions openly, creating space for honesty and trust."
// ];
