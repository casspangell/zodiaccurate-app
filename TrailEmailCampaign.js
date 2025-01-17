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
Your task is to create a 4-day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services on Days 3, 5, 7, and 9 into their trial program. Add a timestamp of today's date.

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
- Personalized details such as the user’s name, family member names, occupation, or specific data from their profile.
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
                "content": "Create personalized and unique subject lines for each email that reflect the email content and are engaging. Make the emails deeply engaging, personal, and relevant to the user’s journey. Avoid repetition and technical jargon. Keep the tone conversational and friendly. Provide the CSV content enclosed in a markdown code block with the csv tag (e.g., csv \"Column1\",\"Column2\",\"Column3\" \"Value1\",\"Value2\",\"Value3\" ). The first row must contain column headers, and subsequent rows must contain corresponding values. Do not include any text or explanation outside the markdown block. Ensure all values are properly quoted (e.g., \"Value\"), especially if they contain commas, line breaks, or special characters. Example format: csv \"Subject_1\",\"Email_1\",\"Subject_2\",\"Email_2\",\"Subject_3\",\"Email_3\",\"Subject_4\",\"Email_4\",\"Campaign_Date\",\"Name\",\"Email\"."
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

