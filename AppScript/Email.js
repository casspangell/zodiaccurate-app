async function sendEmail(apiUrl, emailData) {
  const options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${MAILER_SEND_API_KEY}`,
    },
    payload: JSON.stringify(emailData),
  };

  try {
    const response = await UrlFetchApp.fetch(apiUrl, options);
    console.log("Email API Response Code:", response.getResponseCode());
    console.log("Email API Response Body:", response.getContentText());
    return response;
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Request Options:", JSON.stringify(options, null, 2));
    throw error;
  }
}

async function sendWelcomeEmailWithMailerSend(clientName, editResponseUrl, email) {
  console.log("sendWelcomeEmailWithMailerSend clientName: ", clientName, " editResponseUrl: ",editResponseUrl," email: ",email);
  if (!clientName || !email || !editResponseUrl) {
    throw new Error("Missing required parameters for welcome email.");
  }

    // Validate Email
    if (!email || !email.includes("@")) {
        Logger.log(`❌ Invalid email detected: ${email}`);
        return false;
    }

  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header img {
              width: 100%;
              height: auto;
              border-radius: 8px 8px 0 0;
              display: block;
          }
          .content {
              padding: 20px;
          }
          h2 {
              color: #2e6ca8;
              margin-bottom: 10px;
          }
          p {
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 20px;
          }
          .footer {
              text-align: center;
              padding: 20px;
              background-color: #f4f4f4;
              color: #777;
              font-size: 12px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
          </div>
          <div class="content">
              <p>Hi ${clientName},</p>
              <p>Welcome to Zodiaccurate! We're thrilled that you've decided to join our community.</p>
              <p>Every day at 6 AM, you'll receive a personalized astrological reading tailored specifically to the details you've shared with us. Our goal is to provide you with insights that not only assist you to better navigate guide your daily decisions but also align that guidance with your personal life conditions, struggles and successes!<br></p>
              <p>If you ever need to update your Zodiaccurate “current life” information, you can easily do so by <a href="${editResponseUrl}">Clicking Here</a><br></p>
              <p>We look forward to being a part of your challenging, miraculous, creative, life.<br><br></p>

              <p>Please add us to your contacts and confirm your email address to complete your registration and start receiving personalized astrological insights tailored to you.</p>
                        <div class="important-info">
                <p><strong>To ensure you receive our emails, please add dailyguidance@zodiaccurate.com to your contacts:</strong></p>
                <ul>
                    <li><strong>GMAIL:</strong> Hover over dailyguidance@zodiaccurate.com, click (add to contacts) +face icon in the upper right corner of the window."</li>
                    <li><strong>YAHOO:</strong> Open an email, hover over "Daily Guidance," then select "Add to contacts."</li>
                    <li><strong>OUTLOOK:</strong> Open an email, hover over "Daily Guidance," click the three dots, then choose "Add to contacts."</li>
                    <li><strong>Other mail providers:</strong> Find and select "Add to contacts" for our email address.</li>
                </ul>
                
              <p>Best Regards,<br/>
              Your Zodiaccurate Team<br></p>
              <p>You can change your CC information or cancel anytime via this <a href="${STRIPE_LINK}">Link</a></p>
              <p>If you have any questions, please contact us at support@zodiaccurate.com</p>
          </div>
          <div class="footer">
              <p>${COPYRIGHT}</p>
          </div>
      </div>
  </body>
  </html>
  `;

  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Welcome to Zodiaccurate",
    },
    to: [{ email, name: clientName }],
    subject: "Life is easier when you can see it coming!",
    html: emailHtml,
  };

  return await sendEmail(MAILER_SEND_URL, emailData);
}

async function sendDailyEmailWithMailerSend(clientName, email, prompt, uuid) {
  console.log("sendDailyEmailWithMailerSend clientName ", clientName," email ", email, " uuid ", uuid);

  if (!clientName || !email || !prompt) {
    throw new Error("Missing required parameters for daily email.");
  }

  // Handle the case where prompt is an array
  var dailyPrompt = transformKeysToLowerCaseWithUnderscores(prompt);
  dailyPrompt = getObjectFromData(dailyPrompt);

  console.log("Daily prompt: ", dailyPrompt);
  const formattedDate = formatDateForUser(uuid);
  const editResponseUrl = EDIT_RESPONSE_URL_PRIME + uuid;

  const emailHtml = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header img {
            width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            display: block;
        }
        .content {
            padding: 20px;
        }
        h2 {
            color: #2e6ca8;
            margin-bottom: 10px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #777;
            font-size: 12px;
        }
        .info {
            background-color: #f8f9fa;
            border-left: 5px solid #b0b0b0;
            padding: 15px;
            margin-top: 20px;
            font-size: 13px;
            color: #444;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .info strong {
            color: #333;
            font-size: 14px;
            display: block;
            margin-bottom: 8px;
        }
        .info a {
            color: #2e6ca8;
            text-decoration: none;
            font-weight: bold;
        }
        .info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
        </div>
        <div class="content">
            <h3>${formattedDate}</h3>
            ${dailyPrompt.personal_guidance ? `<h2>Personal Guidance</h2><p>${dailyPrompt.personal_guidance}</p>` : ''}
            ${dailyPrompt.career_and_finances ? `<h2>Career and Finances</h2><p>${dailyPrompt.career_and_finances}</p>` : ''}
            ${dailyPrompt.health ? `<h2>Health</h2><p>${dailyPrompt.health}</p>` : ''}
            ${dailyPrompt.health_and_wellness ? `<h2>Health</h2><p>${dailyPrompt.health_and_wellness}</p>` : ''}
            ${dailyPrompt.relationships ? `<h2>Relationships</h2><p>${dailyPrompt.relationships}</p>` : ''}
            ${dailyPrompt.children_or_important_person_relationship ? `<h2>Children or Important Person Relationship</h2><p>${dailyPrompt.children_or_important_person_relationship}</p>` : ''}
            ${dailyPrompt.parenting_guidance ? `<h2>Children Advice</h2><p>${dailyPrompt.parenting_guidance}</p>` : ''}
            ${dailyPrompt.partner_relationship ? `<h2>Partner Relationship</h2><p>${dailyPrompt.partner_relationship}</p>` : ''}
            ${dailyPrompt.close_important_person ? `<h2>Close Important Person</h2><p>${dailyPrompt.close_important_person}</p>` : ''}
            ${dailyPrompt.important_person_relationship ? `<h2>Important Person Relationship</h2><p>${dailyPrompt.important_person_relationship}</p>` : ''}
            ${dailyPrompt.local_weather ? `<h2>Local Weather</h2><p>${dailyPrompt.local_weather}</p>` : ''}
            <p>Best Regards,<br/>Your Zodiaccurate Team</p>
        </div>
        <div class="info">
            <p>If you ever need to update your Zodiaccurate “current life” information, you can easily do so by <a href="${editResponseUrl}">Clicking Here</a>.</p>
            <p>You can change your CC information or cancel anytime via this <a href="${STRIPE_LINK}">Link</a>.</p>
            <p>If you have any questions, please contact us at <a href="mailto:support@zodiaccurate.com">support@zodiaccurate.com</a>.</p>
        </div>
        <br/>
        <div class="footer">
            <p>${COPYRIGHT}</p>
        </div>
    </div>
</body>
</html>


  `;

  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Daily Guidance",
    },
    to: [{ email, name: clientName }],
    subject: "Zodiaccurate Daily Guidance",
    html: emailHtml,
  };
  
  return await sendEmail(MAILER_SEND_URL, emailData);
}

/**
 * Sends an email notification to a user informing them that their information has been updated.
 * - Generates a personalized HTML email with updated information acknowledgment.
 * - Uses the `sendEmail` function for API interaction.
 *
 * @param {string} name - The recipient's name for personalization in the email.
 * @param {string} email - The recipient's email address where the notification will be sent.
 * @returns {Promise<void>} - Resolves if the email is sent successfully, otherwise throws an error.
 */
async function sendUpdateInfoWithMailerSend(name, email) {
  console.log("Sending updated info email to:", name, email);


  // HTML email content
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header img {
            width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            display: block;
        }
        .content {
            padding: 20px;
        }
        h2 {
            color: #2e6ca8;
            margin-bottom: 10px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
        </div>
        <div class="content">
            <h2>Your Information Has Been Updated</h2>
            <p>Dear ${name},</p>
            <p>As the stars realign and your path forward becomes clearer, we acknowledge the steps you've taken to ensure your journey remains true to your intentions. Your updated information has been received and harmonized with the celestial energies guiding your life.</p>
            <p>Every detail you've shared brings you closer to unlocking the wisdom of the cosmos. Trust in the alignment of your spirit, your choices, and the energies of the universe as they work together in perfect synchronicity.</p>
            <p>Continue to walk your path with courage and curiosity. The stars are watching, and they shine brightly upon you.</p>
            <p>Blessings,<br>The Zodiaccurate Team</p>
        </div>
          <div class="footer">
              <p>${COPYRIGHT}</p>
          </div>
    </div>
</body>
</html>
`;

  // Email payload
  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Daily Guidance",
    },
    to: [
      {
        email: email, // Recipient's email
        name: name,
      },
    ],
    subject: "Updated Zodiaccurate Info",
    html: emailHtml,
  };

  try {
    const response = await sendEmail(MAILER_SEND_URL, emailData);
    console.log("Update email sent successfully:", response.getContentText());
  } catch (error) {
    console.error("Failed to send update info email:", error.message);
    throw error;
  }
}

/**
 * Sends a trial campaign email to a user using MailerSend.
 * - Generates a personalized HTML email based on the campaign prompt.
 * - Uses the `sendEmail` function for API interaction.
 *
 * @param {string} name - The recipient's name for personalization in the email.
 * @param {string} email - The recipient's email address.
 * @param {string} prompt - The email content for the specific day of the trial campaign.
 * @param {number} day - The current day of the trial campaign.
 * @returns {Promise<void>} - Resolves if the email is sent successfully, otherwise throws an error.
 */
async function sendTrialCampaignEmailWithMailerSend(name, email, prompt, subject, day) {
  console.log(`Sending email for day ${day} to ${name} (${email})`);

  // Generate HTML content dynamically using the `prompt` object
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header img {
            width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            display: block;
        }
        .content {
            padding: 20px;
        }
        h2 {
            color: #2e6ca8;
            margin-bottom: 10px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
        </div>
        <div class="content">
            ${prompt ? `
            <h2>Zodiaccurate Trial Day ${day}</h2>
            <p>${prompt}</p>` : ''}
            <p>Blessings,<br>The Zodiaccurate Team</p>
        </div>
          <div class="footer">
              <p>${COPYRIGHT}</p>
          </div>
    </div>
</body>
</html>
`;

console.log("Email: ", email, " Name: ", name, " Subject: ", subject);
  // Email payload
  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Daily Guidance",
    },
    to: [
      {
        email: email,
        name: name || "Valued Seeker",
      },
    ],
    subject: subject,
    html: emailHtml,
  };

  try {
    const response = await sendEmail(MAILER_SEND_URL, emailData);
    console.log(`Trial campaign email for day ${day} sent successfully:`, response.getContentText());
  } catch (error) {
    console.error(`Failed to send trial campaign email for day ${day}:`, error.message);
    throw error;
  }
}

function testEmail(){
  sendEmailConfirmationWithMailerSend("Cass", "casspangell@gmail.com");
}

async function sendEmailConfirmationWithMailerSend(name, email) {
  console.log("Sending Confirmation Email name: ", name, " email: ", email);

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header img {
            width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            display: block;
        }
        .content {
            padding: 20px;
        }
        h2 {
            color: #2e6ca8;
            margin-bottom: 10px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        .button {
            background-color: #fff;
            color: #6a1b9a;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid #6a1b9a;
            font-size: 16px;
            display: inline-block;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .button:hover {
            background-color: #6a1b9a;
            color: #fff;
            border-color: #6a1b9a;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #777;
            font-size: 12px;
        }
        .important-info {
            background-color: #fff3e0;
            border-left: 5px solid #ffa726;
            padding: 10px;
            margin-top: 20px;
            font-size: 12px;
            color: #555;
        }
        .important-info strong {
            color: #d84315;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up with Zodiaccurate! We're thrilled to have you join our community.</p>
            </div>
            <div class="button-container">
                <a href="https://us-central1-zodiaccurate-e9aaf.cloudfunctions.net/handleEmailConfirmation?email=${email}&name=${name}" class="button">Confirm Email</a>
            </div>
        </div>
        <div class="footer">
            <p>${COPYRIGHT}</p>
            <p>If you have any questions, please contact us at <a href="mailto:support@zodiaccurate.com">support@zodiaccurate.com</a>.</p>
        </div>
    </div>
</body>
</html>
`;

console.log("Confirmation Email ", emailHtml);
  // Email payload
  const emailData = {
    from: {
      email: "support@zodiaccurate.com",
      name: "Support",
    },
    to: [
      {
        email: email,
        name: name || "Valued Seeker",
      },
    ],
    subject: "Zodiaccurate Email Confirmation",
    html: emailHtml,
  };

  try {
    console.log("...sending... ");
    const response = await sendEmail(MAILER_SEND_URL, emailData);
    console.log(`Email confirmation email sent successfully:`, response.getContentText());
    return response;
  } catch (error) {
    console.error(`Failed to send email confirmation email`, error.message);
    throw error;
  }
}

async function setUpEmailCampaign(jsonSinglePersonData, uuid, name, email) {
    console.log("PREPARE EMAIL CAMPAIGN CHATGPT");

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
- Server_Date
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
  // Retrieve the data from the trial_campaign table
  const jsonData = getUUIDDataFromTrialCampaignTable();

  // Parse the JSON data
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

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

