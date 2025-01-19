async function setUpEmailCampaign(jsonSinglePersonData, uuid, name, email) {
    console.log("PREPARE EMAIL CAMPAIGN CHATGPT");
<<<<<<< HEAD
    // Generate ChatGPT prompt
    const prompt = getChatEmailCampaignInstructions(jsonSinglePersonData, name, email);
    const chatGPTResponse = await getChatGPTEmailCampaignResponse(prompt, uuid);
}

function getChatEmailCampaignInstructions(jsonSinglePersonData) {
  console.log("GET CHAT CAMPAIGN INSTRUCTIONS");

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
Your task is to create a 4-day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services on Days 3, 5, 7, and 9 into their trial program. Add a timestamp of today's date.
=======

    try {
        // Generate ChatGPT prompt
        const prompt = getChatEmailCampaignInstructions(uuid, jsonSinglePersonData);
        await getChatGPTEmailCampaignResponse(prompt, uuid);
        console.log("Trial email campaign setup successfully.");
    } catch (error) {
        console.error("Error setting up trial email campaign:", error.message);
    }
}


function getChatEmailCampaignInstructions(uuid, jsonSinglePersonData) {
  console.log("GET CHAT CAMPAIGN INSTRUCTIONS");
  const campaignDate = formatDateForUser(uuid);
  const serverDate = new Date();
    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}, Campaign_Date = ${campaignDate}, Server_Date = ${Date().serverDate}. Our company is Zodiaccurate. If you wish to use this name, place it as the Zodiaccurate Team or Zodiaccurate.
Your task is to create a 4-day personalized email campaign for this person, incorporating astrological insights to help the user decide to subscribe to our services on Days 3, 5, 7, and 9 into their trial program. Add a timestamp of today's date. Do not add [Dear User] or [From Zodiaccurate]. The email needs to bait the user into subscribing for the app. Use predictions on how using this unique astrology app will enhance their overall life, wellness, and wellbeing. Incorporate what you would be used in an astrology prediction into their life to enhance their metaphysical outlook.
>>>>>>> master

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
<<<<<<< HEAD
=======
- Server_Date
>>>>>>> master
- Name
- Email

Expand the main body of each email by including:
<<<<<<< HEAD
- Personalized details such as the user’s name, family member names, occupation, or specific data from their profile.
=======
- Personalized details such as the user's name, family member names, occupation, or specific data from their profile.
>>>>>>> master
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
<<<<<<< HEAD
=======
  // Retrieve the data from the trial_campaign table
>>>>>>> master
  const jsonData = getUUIDDataFromTrialCampaignTable();

  // Parse the JSON data
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
<<<<<<< HEAD
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

=======

  // Get the current date
  const today = new Date();

  // Iterate over each UUID in the data
  Object.keys(data).forEach((uuid) => {
    const emailData = data[uuid];
    const {
      Campaign_Date,
      Name,
      Email,
      Email_1,
      Email_2,
      Email_3,
      Email_4,
      Subject_1,
      Subject_2,
      Subject_3,
      Subject_4
    } = emailData;

    console.log("TRIAL EMAIL DATA: ", JSON.stringify(emailData));
    // Calculate the difference in days between Campaign_Date and today
    const campaignDate = new Date(Campaign_Date);
    const differenceInDays = Math.floor((today - campaignDate) / (1000 * 60 * 60 * 24));

    const emails = {
      3: Email_1,
      5: Email_2,
      7: Email_3,
      9: Email_4,
    };

    const subjects = {
      3: Subject_1,
      5: Subject_2,
      7: Subject_3,
      9: Subject_4,
    };

    // Check if the day difference matches an email trigger
    if (emails[differenceInDays]) {
      const emailContent = emails[differenceInDays];
      const subject = subjects[differenceInDays];
      const day = differenceInDays;
      console.log("emailContent ", emailContent);
      console.log("subjectContent ", subject);

      // Call the email sending function with subject
      sendTrialCampaignEmailWithMailerSend(Name, Email, emailContent, subject, day);
    } else if (differenceInDays > 9) {
      deleteUUIDFromTrialCampaignTable(uuid);
      console.log(`UUID ${uuid} deleted from the table as it is beyond 9 days.`);
    } else {
      console.log(`No email to send today for ${Name} (${Email}).`);
    }
  });
}



>>>>>>> master
