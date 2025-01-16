async function setUpEmailCampaign(jsonSinglePersonData, uuid, name, email) {
    console.log("PREPARE EMAIL CAMPAIGN CHATGPT");
    // Generate ChatGPT prompt
    const prompt = getChatEmailCampaignInstructions(jsonSinglePersonData, name, email);
    const chatGPTResponse = await getChatGPTEmailCampaignResponse(prompt, uuid);
}

function getChatEmailCampaignInstructions(jsonSinglePersonData) {
  console.log("GET CHAT CAMPAIGN INSTRUCTIONS");

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a 4 day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services for Day 3, 5, 7, and 9 into the trial program. Add a timestamp of today's date. Focus on these sections and  generate a CSV file containing the following columns and data:. One containing the following columns and data:
        - Email_One
        - Email_Two
        - Email_Three
        - Email_Four
        - Campaign_Date
        - Name
        - Email
        Avoid repetition, technical terms, and ensure uniqueness each day. Only provide the middle part of the email without names or signatures. Identify key benefits they've likely experienced (e.g., “You've gained clarity on family dynamics this week”). Highlight specific themes or benefits that align with their trial experience. Reference their unique journey, progress, or challenges. Make it engaging and relevant to their trial experience. Use a friendly and encouraging tone to prompt action. Keep the tone conversational, positive, and motivating. Tailor the language to reflect the user's unique journey during the trial period.
    `;

    return prompt.trim();
}

function getChatGPTEmailCampaignResponse(instructions, uuid) {
  
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
                "content": "Your task is to create a 4 day email campaign for Zodiaccurate. Analyze the user's data below from their trial period. Your task is to generate a personalized email campaign in CSV format. Always provide the CSV content enclosed in a markdown code block with the csv tag (e.g., csv \"Column1\",\"Column2\",\"Column3\" \"Value1\",\"Value2\",\"Value3\" ). The first row must contain column headers, and subsequent rows must contain corresponding values. Do not include any text or explanation outside the markdown block. Ensure all values are properly quoted (e.g., \"Value\"), especially if they contain commas, line breaks, or special characters. Example format: csv \"Email_One\",\"Email_Two\",\"Email_Three\",\"Email_Four\", \"Date\", \"Name\", \"Email\". Ensure the format is consistent and adheres strictly to these guidelines."
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

function sendEmailCampaign() {
  const jsonData = getUUIDDataFromTrialCampaignTable();

  // Parse the JSON data
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
  const mainKey = Object.keys(data)[0];
  const emailData = data[mainKey];
  const { Campaign_Date, Name, Email, Email_One, Email_Two, Email_Three, Email_Four } = emailData;

  // Check if the date is 3, 5, 7, or 9 days from today
  const inputDate = new Date(Campaign_Date);
  const today = new Date();
  const differenceInTime = inputDate.getTime() - today.getTime(); // Difference in milliseconds
  const differenceInDays = Math.round(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days

  // Map the day difference to the appropriate email
  const emails = {
    3: Email_One,
    5: Email_Two,
    7: Email_Three,
    9: Email_Four,
  };

  // Check if the day difference is valid
  if ([3, 5, 7, 9].includes(differenceInDays)) {
    const emailContent = emails[differenceInDays];
    const day = differenceInDays;

    // Call the email sending function
    sendTrialCampaignEmailWithMailerSend(Name, Email, emailContent, day);
  } else {
    console.log("No email to send today.");
  }

  return {
    mainKey,
    Date,
    Email_One,
    Email_Two,
    Email_Three,
    Email_Four,
    differenceInDays,
  };
}

