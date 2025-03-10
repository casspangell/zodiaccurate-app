function testChatPrompt() {
    const uuid = "a323baee-0828-433f-9502-5d24d633d2ea";
    const instructions = getChatInstructions(TEST_USER_DATA_NO_CHILD_NO_PARTNER, uuid);
    const output = getChatGPTResponse(instructions, uuid);
}

/**
 * Constructs a ChatGPT prompt using user data and modifiers.
 * Conditionally includes sections based on available user data.
 * Fixed to use proper markdown code block syntax.
 *
 * @param {Object} jsonSinglePersonData - The user data object containing relevant information.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {string} - A formatted prompt string for ChatGPT.
 */
function getChatInstructions(jsonSinglePersonData, uuid) {
    console.log("GET CHAT INSTRUCTIONS");
    const modifiers = getRandomModifiers();
    const user = getUserNames(jsonSinglePersonData);
    const getWeekData = getThreeDaysDataFromFirebase(uuid);
    
    // Always include these base sections
    let sections = [
        `- Career and Finances: 5-7 sentences. Use ${user.firstName}'s birth chart on daily finances and provide predictive astrological guidance. Strategies for professional and financial growth. Include specific small but meaningful steps the person can take, phrased in an empowering and open-ended tone to encourage autonomy. Tailor advice based on the individual's career status (employed, job-seeking, entrepreneurial, or retired) and any financial considerations or struggles they've shared.(${modifiers.careerAndFinances})`,
        
        `- Health: 5-7 sentences. Holistic well-being with practical health tips aligned with ${user.firstName}'s lifestyle and goals. Use their birthchart to make predictions on daily interactions and predictive astrological guidance. (${modifiers.health}) Include suggestions for reflection and small changes aligned with the user's values and aspirations.`,
        
        `- Personal Guidance: 5-7 sentences. Introspective advice for self-improvement and emotional balance for ${user.firstName}. Use their birthchart to make predictions on daily interactions and predictive astrological guidance. Include self-development insights, spiritual reflection, or motivation aligned with the person's daily astrological trends. (${modifiers.personalGuidance})`
    ];
    
    // Only include Relationships section if partnerName exists and isn't empty
    if (user.partnerName && user.partnerName.trim() !== "") {
        sections.push(
            `- Relationships: 5-7 sentences. This section is for ${user.partnerName}. Use ${user.firstName} and ${user.partnerName}'s birth charts to make predictions on daily interactions and relationship energy shifts. Focus on spouse or partner's unique astrological transits etc and discern difficulties or challenges as well as positive energies and insights for daily relationship energetic connection. Emotional connections and advice for strengthening bonds. Discuss relationship harmony, communication tips, and emotional balance, rooted in compatibility elements and current planetary influences. Give guidance on fostering healthy connections or other considering any stated issues like communication. (${modifiers.relationships})`
        );
    }
    
    // Only include Parenting Guidance if childrenNames exists and has entries
    if (user.childrenNames && user.childrenNames.length > 0) {
        const childrenString = user.childrenNames.join(", ");
        sections.push(
            `- Parenting Guidance: 5-7 sentences. Focus on each child's unique astrological transits (${childrenString}), discerning challenges, positive energies, and insights for their daily relationship connection. Use their birth chart to make predictions and provide guidance to ${user.firstName}. Focus on the child/ren's unique astrological transits etc and discern difficulties or challenges as well as positive energies and insights for daily relationship energetic connection. Support tailored to the user and the most effective communication with each child if they have children for that day, offering actionable suggestions for nurturing and engagement. (${modifiers.parentingGuidance})`
        );
    }
    
    // Only include Important Person section if importantPersonNames exists and has entries
    if (user.importantPersonNames && user.importantPersonNames.length > 0) {
        const importantPerson = user.importantPersonNames[0]; // Use the first important person
        sections.push(
            `- Important Person Relationship: 5-7 sentences. Focus on ${importantPerson}'s unique astrological transits etc and discern difficulties or challenges as well as positive energies and insights for daily astrological connection and advise for ${user.firstName}. (${modifiers.importantPersonRelationship})`
        );
    }
    
    // Join all sections with newlines
    const sectionsText = sections.join("\n\n        ");
    
    // Build the complete prompt
    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for ${user.firstName} using predictions and advise incorporating astrological insights and practical advice using 20% personal data and 80% zodiac predictions and astrological insights. Make astrological predictions for each section. Focus on these sections and generate a CSV file containing the following columns and data:
        ${sectionsText}
        
        Read the individual's birth date, time, location, and any personal details provided in their form as a reference not as concrete information but used as a guideline to facilitate the prompt. Understand the person's situation regarding career status, relationship dynamics, health considerations, and interactions with children or important others. If relevant, mention any changes in the stars or timing from the last few days to highlight shifts in energy. Identify key astrological factors: Analyze natal charts, transits, planetary alignments, retrogrades, and compatibility aspects based on the individual's unique details. Link these celestial events to the person's current circumstances, challenges, and aspirations. Add that seems left field for advice but in line with the predictions. The user's own wording about challenges or experiences should be creatively rephrased. Provide new angles, interpretations, and solutions that resonate with their situation. Personalize and integrate astrological insights: Mention partner names, children's names, or important individuals if provided. For each section, provide three layers of scope (low, middle and high scope) and how it can affect the larger picture in their world.

        IMPORTANT: Weave astrological references and predictions for the day (e.g., Sun, Moon, retrogrades, compatibility) naturally into the guidance, ensuring it remains accessible and empathetic. Use the previous three horoscopes as guidance= create new insights, predictions and personal astrological gifts: ${getWeekData};
        
        IMPORTANT: Format your response ONLY as a CSV with the columns matching EXACTLY the section names mentioned above. The CSV must be enclosed in a markdown code block. For example:
        
        \`\`\`csv
        "Career and Finances","Health","Personal Guidance"
        "Your career advice here...","Your health advice here...","Your personal guidance here..."
        \`\`\`
        
        Do not include any other text outside the code block. Do not include empty columns for sections that weren't mentioned above.
    `;

    return prompt.trim();
}

/**
 * Fetches a response from the ChatGPT API based on the provided instructions.
 * Updated to explicitly specify which columns to include based on user data.
 * Fixed to use proper markdown code block syntax.
 *
 * @param {string} instructions - The ChatGPT prompt containing user data and instructions.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The parsed response data if successful, or null on failure.
 */
function getChatGPTResponse(instructions, uuid) {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    try {
        // Parse JSON data from the instructions to determine which sections to include
        const dataMatch = instructions.match(/Here is user data: (\{.*?\})/);
        let jsonData = {};
        
        if (dataMatch && dataMatch[1]) {
            try {
                jsonData = JSON.parse(dataMatch[1]);
            } catch (e) {
                console.log("Could not parse user data JSON from instructions:", e);
            }
        }
        
        // Use getUserNames to determine which sections should be present
        const user = getUserNames(jsonData);
        
        // Base columns that are always included
        const columns = [
            "Career and Finances", 
            "Health", 
            "Personal Guidance"
        ];
        
        // Add relationship column if partner exists
        if (user.partnerName && user.partnerName.trim() !== "") {
            columns.push("Relationships");
        }
        
        // Add parenting column if children exist
        if (user.childrenNames && user.childrenNames.length > 0) {
            columns.push("Parenting Guidance");
        }
        
        // Add important person column if important persons exist
        if (user.importantPersonNames && user.importantPersonNames.length > 0) {
            columns.push("Important Person Relationship");
        }
        
        console.log("Columns to include:", columns);
        
        // Create a detailed system prompt with explicit column instructions and fixed code block syntax
        const systemPrompt = `You are bob brezney, a highly knowledgeable and empathetic astrologer and personal guide. 
Your task is to generate a personalized daily astrological horoscope in CSV format based on the provided data.

IMPORTANT FORMATTING INSTRUCTIONS:
1. Include ONLY these specific columns in your CSV: ${columns.join(', ')}
2. Do NOT include any columns that aren't in this list
3. Provide the CSV content enclosed in a markdown code block
4. The first row must contain ONLY these column headers exactly as written
5. Subsequent rows must contain corresponding values
6. Do not include any text or explanation outside the markdown block
7. Ensure all values are properly quoted (e.g., "Value"), especially if they contain commas or line breaks

Example correct format:

\`\`\`csv
"${columns.join('","')}"
"Value for first column","Value for second column"${columns.length > 2 ? ',...' : ''}
\`\`\`

Speak like bob brezney, creator of free will horoscope, referencing and predicting astrological phenomena in each category. Address the user by their first name and mention any important people in their life when relevant. Final check: Review the completed horoscope to ensure it meets tone, personalization, and astrological accuracy standards.`;

        const payload = {
            "model": "gpt-4o",
            "max_tokens": 4096,
            "temperature": 0.8,
            "top_p": 0.6,
            "frequency_penalty": 0.2,
            "presence_penalty": 0.1,
            "logprobs": true,
            "messages": [
                {
                    "role": "system",
                    "content": systemPrompt
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

        // Log request details (sanitize for security)
        console.log("Making API request to ChatGPT");
        console.log("Request columns:", columns);
        
        const response = UrlFetchApp.fetch(url, options);
        const jsonResponse = JSON.parse(response.getContentText());

        // Extract token usage details
        var promptTokens = jsonResponse.usage.prompt_tokens;
        var completionTokens = jsonResponse.usage.completion_tokens;
        var totalTokens = jsonResponse.usage.total_tokens;

        // Log the token usage
        Logger.log("Prompt Tokens: " + promptTokens);
        Logger.log("Completion Tokens: " + completionTokens);
        Logger.log("Total Tokens: " + totalTokens);

        // Parse the response using your existing parser
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

function getRandomModifiers() {
  var overviewModifier = overviewModifiers[Math.floor(Math.random() * overviewModifiers.length)];
  var careerAndFinancesModifier = careerAndFinancesModifiers[Math.floor(Math.random() * careerAndFinancesModifiers.length)];
  var relationshipsModifier = relationshipsModifiers[Math.floor(Math.random() * relationshipsModifiers.length)];
  var parentingGuidanceModifier = parentingGuidanceModifiers[Math.floor(Math.random() * parentingGuidanceModifiers.length)];
  var healthModifier = healthModifiers[Math.floor(Math.random() * healthModifiers.length)];
  var personalGuidanceModifier = personalGuidanceModifiers[Math.floor(Math.random() * personalGuidanceModifiers.length)];

  console.log("Mod-MODIFIERS: Overview: "+overviewModifier+", Career and Finances: "+careerAndFinancesModifier+" Relationships: "+relationshipsModifier+" Parenting Guidance: "+parentingGuidanceModifier+" Health: "+ healthModifier+" Personal Guidance: "+personalGuidanceModifier);

  return {
    overview: overviewModifier,
    careerAndFinances: careerAndFinancesModifier,
    relationships: relationshipsModifier,
    parentingGuidance: parentingGuidanceModifier,
    health: healthModifier,
    personalGuidance: personalGuidanceModifier
  };
}

var overviewModifiers = [
  "Focus on clarity and understanding today.",
  "Consider how today's events shape your future.",
  "Reflect on the opportunities present in your life.",
  "Emphasize the positive aspects of your current situation.",
  "Today's challenges can lead to personal growth.",
  "Look for the silver lining in today's circumstances.",
  "Think about long-term goals and how today fits into them.",
  "Pay attention to your intuition today.",
  "Today is a day for reflection and contemplation.",
  "Consider how your actions today affect those around you.",
  "Focus on the present moment and its importance.",
  "Take a step back to gain a broader perspective.",
  "Consider the balance between work and personal life today.",
  "Today may bring unexpected opportunities.",
  "Focus on personal development and self-improvement.",
  "Think about how you can make a positive impact today.",
  "Today is a day for making thoughtful decisions.",
  "Consider how your current path aligns with your values.",
  "Reflect on your progress and where you're headed.",
  "Focus on creating harmony in your life today."
];

var careerAndFinancesModifiers = [
  "Consider how today's tasks contribute to your long-term career goals.",
  "Think about new ways to manage your finances effectively.",
  "Today's efforts may lead to significant progress in your career.",
  "Focus on improving your financial habits.",
  "Reflect on how to achieve a better work-life balance.",
  "Today might be a good day to explore new career opportunities.",
  "Think about how to optimize your productivity.",
  "Consider the financial implications of your decisions today.",
  "Focus on setting clear, achievable goals.",
  "Today is a day to take calculated risks in your career.",
  "Think about ways to increase your financial security.",
  "Consider how you can advance in your current role.",
  "Today's decisions could have long-term financial benefits.",
  "Reflect on your career path and where you want to go.",
  "Focus on professional growth and learning new skills.",
  "Think about ways to diversify your income streams.",
  "Consider how you can improve your financial planning.",
  "Today may bring new opportunities for career advancement.",
  "Reflect on the financial aspects of your current lifestyle.",
  "Focus on building strong professional relationships."
];

var relationshipsModifiers = [
  "Consider how you can strengthen your relationships today.",
  "Focus on improving communication with loved ones.",
  "Today is a good day to express appreciation for others.",
  "Reflect on the role of trust in your relationships.",
  "Think about ways to deepen emotional connections.",
  "Consider how your actions affect those around you.",
  "Focus on resolving any ongoing conflicts.",
  "Today is a day to nurture your relationships.",
  "Reflect on the balance between giving and receiving in your relationships.",
  "Think about how you can support the goals of those you care about.",
  "Consider how you can show love and affection today.",
  "Focus on the importance of honesty in your relationships.",
  "Today might be a good day to reconnect with someone.",
  "Reflect on how you can build stronger bonds with others.",
  "Think about ways to be more present in your relationships.",
  "Consider the importance of empathy and understanding.",
  "Focus on spending quality time with loved ones.",
  "Today is a day to celebrate your relationships.",
  "Reflect on how your relationships contribute to your happiness.",
  "Think about how you can maintain healthy boundaries."
];

var parentingGuidanceModifiers = [
  "Focus on understanding your child's needs today.",
  "Consider how you can support your child's emotional growth.",
  "Today is a good day to spend quality time with your child.",
  "Reflect on the importance of positive reinforcement.",
  "Think about ways to encourage your child's curiosity.",
  "Consider how your actions influence your child's behavior.",
  "Focus on building a strong bond with your child.",
  "Today might be a good day to teach your child something new.",
  "Reflect on how you can be a better role model.",
  "Think about ways to foster your child's independence.",
  "Consider the importance of consistency in parenting.",
  "Focus on listening to your child and understanding their perspective.",
  "Today is a day to encourage your child's creativity.",
  "Reflect on how you can support your child's goals.",
  "Think about ways to make learning fun for your child.",
  "Consider how you can help your child develop resilience.",
  "Focus on creating a loving and supportive environment.",
  "Today is a day to celebrate your child's achievements.",
  "Reflect on how you can be more patient with your child.",
  "Think about ways to strengthen your relationship with your child."
];

var healthModifiers = [
  "Focus on maintaining a balanced diet today.",
  "Consider how you can improve your physical fitness.",
  "Today is a good day to prioritize mental health.",
  "Reflect on the importance of regular exercise.",
  "Think about ways to reduce stress in your life.",
  "Consider how your habits impact your long-term health.",
  "Focus on getting enough rest and sleep.",
  "Today might be a good day to try a new healthy activity.",
  "Reflect on how you can improve your overall well-being.",
  "Think about ways to incorporate more movement into your day.",
  "Consider the importance of hydration for your health.",
  "Focus on making healthy choices in your diet.",
  "Today is a day to practice mindfulness and relaxation.",
  "Reflect on how you can support your immune system.",
  "Think about ways to improve your emotional health.",
  "Consider the benefits of regular medical check-ups.",
  "Focus on developing a sustainable health routine.",
  "Today might be a good day to set new health goals.",
  "Reflect on the connection between physical and mental health.",
  "Think about ways to maintain a positive outlook on life."
];

var personalGuidanceModifiers = [
  "Focus on your personal growth and self-improvement.",
  "Consider how you can develop new skills.",
  "Today is a good day to set personal goals.",
  "Reflect on the importance of self-care.",
  "Think about ways to increase your self-confidence.",
  "Consider how you can find more balance in your life.",
  "Focus on pursuing your passions and hobbies.",
  "Today might be a good day to explore new opportunities.",
  "Reflect on how you can be more present in the moment.",
  "Think about ways to enhance your personal relationships.",
  "Consider the importance of self-reflection and introspection.",
  "Focus on staying motivated and determined.",
  "Today is a day to embrace positive change.",
  "Reflect on your strengths and how to build on them.",
  "Think about ways to overcome personal challenges.",
  "Consider how you can create more joy in your life.",
  "Focus on being kind and compassionate to yourself.",
  "Today might be a good day to practice gratitude.",
  "Reflect on your achievements and how far you've come.",
  "Think about ways to cultivate a growth mindset."
];

var importantPersonRelationshipModifiers = [
  "Take a moment to express appreciation for the important people in your life.",
  "Consider reaching out to a mentor, close friend, or family member for a meaningful conversation.",
  "Focus on strengthening mutual understanding and emotional support in this relationship.",
  "Reflect on ways to improve communication and foster a deeper connection.",
  "Think about how you can show gratitude for their presence and influence in your life.",
  "Today is a good day to offer support or encouragement to someone who has been there for you.",
  "Consider how this relationship has shaped your growth and what you can do to nurture it further.",
  "Think about setting healthy boundaries while maintaining a sense of closeness.",
  "Reflect on past challenges in this relationship and how they have helped strengthen your bond.",
  "Today might be a good day to share your thoughts and emotions openly, creating space for honesty and trust."
];
