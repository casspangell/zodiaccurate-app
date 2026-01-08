async function sendEmail(apiUrl, emailData) {
  console.log("Sending email...");
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

async function sendWelcomeEmailWithMailerSend(clientName, uuid, email) {
  console.log("sendWelcomeEmailWithMailerSend clientName: ", clientName, " uuid: ",uuid," email: ",email);
  if (!clientName || !email || !uuid) {
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
          <div class="content">
              <p>Hi ${clientName},</p>
              <p>Welcome to Zodiaccurate! We're thrilled that you've decided to join our community.</p>
              <p>Every day at 6 AM, you'll receive a personalized astrological reading tailored specifically to the details you've shared with us. Our goal is to provide you with insights that not only assist you to better navigate guide your daily decisions but also align that guidance with your personal life conditions, struggles and successes!<br></p>
              <p>If you ever need to update your Zodiaccurate “current life” information, you can easily do so by <a href="https://zodiaccurate.app/about-you/?${uuid}">Clicking Here</a><br></p>
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

async function sendDailyEmailWithMailerSend(clientName, email, zodiaccurate, uuid) {
  console.log("sendDailyEmailWithMailerSend clientName ", clientName," email ", email, " uuid ", uuid);
  console.log(JSON.stringify(zodiaccurate, null, 2));

  if (!clientName || !email) {
    throw new Error("Missing client name or email parameters for daily email.");
  }
  
  let zodiaccurateArray = [];
  
  // Convert the data into an array of category objects, regardless of input format
  if (Array.isArray(zodiaccurate)) {
    console.log("is array");
    zodiaccurateArray = zodiaccurate;
  } else if (zodiaccurate && typeof zodiaccurate === 'object') {
    console.log("is object");
    // Handle case where it's a single object with Category/Content
    if (zodiaccurate.Category && zodiaccurate.Content) {
      zodiaccurateArray = [zodiaccurate];
    } 
    // Handle case where it's an object with category keys
    else {
      zodiaccurateArray = Object.keys(zodiaccurate).map(key => {
        // If the value has Category and Content properties, use those
        if (zodiaccurate[key] && zodiaccurate[key].Category && zodiaccurate[key].Content) {
          return {
            Category: zodiaccurate[key].Category,
            Content: zodiaccurate[key].Content
          };
        }
        // Otherwise use the key as Category and the value as Content
        return {
          Category: key,
          Content: zodiaccurate[key]
        };
      });
    }
  } else {
    console.log("Missing or invalid zodiaccurate data for daily email.");
    throw new Error("Missing or invalid zodiaccurate data for daily email.");
  }
  
  if (zodiaccurateArray.length === 0) {
    console.error("Empty zodiaccurate data after normalization");
    throw new Error("No valid content for daily email.");
  }
  
  const formattedDate = formatDateForUser(uuid);
  
  let emailContent = '';

  try {
    // Add each category to the email content
    zodiaccurateArray.forEach((section, index) => {
      console.log("SECTION ", section);
      
      if (!section || typeof section !== 'object') {
        console.warn(`Invalid section at index ${index}:`, section);
        return;
      }
      
      const category = section.Category || `Section ${index + 1}`;
      const content = section.Content || '';
      
      // Create a styled section for each category
      emailContent += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2e6ca8; padding: 10px; background-color: #f0f8ff; border-radius: 4px;">${category}</h2>
          <div style="background-color: #fafafa; padding: 15px; border-left: 3px solid #2e6ca8; border-radius: 4px;">
            <p style="margin: 0;">${content}</p>
          </div>
        </div>
        <hr style="border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0)); margin: 25px 0;">
      `;
    });
  } catch (error) {
    console.error("Error processing zodiaccurate sections:", error);
    throw new Error("Failed to process horoscope sections: " + error.message);
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
          .timestamp {
              font-size: 11px;
              color: #999;
              text-align: right;
              margin-top: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://zodiaccurate.app/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
          </div>
          <div class="content">
              <h3>${formattedDate}</h3>
              
              ${emailContent}
              
              <p>Best Regards,<br/>Your Zodiaccurate Team</p>
          </div>
          <div class="info">
              <p>If you ever need to update your Zodiaccurate "current life" information, you can easily do so by <a href="https://zodiaccurate.app/about-you/?${uuid}">Clicking Here</a>.</p>
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

  // Add a timestamp to the subject to ensure you can identify the latest email
  const subject = `Zodiaccurate Daily Guidance - ${formattedDate}`;
  
  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Daily Guidance",
    },
    to: [{ email, name: clientName }],
    subject: subject,
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
            <img src="https://zodiaccurate.app/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
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
            <img src="https://zodiaccurate.app/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
        </div>
        <div class="content">
            ${prompt ? `
            <h2>Zodiaccurate Trial Day ${day}</h2>
            <p>${prompt}</p>` : ''}
            <p>Why wait 10 days? Ready to start your subscription now? <a href="${STRIPE_LINK}">Start here</a></p>
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
  sendEmailConfirmationWithMailerSend("Cass", "dahnworldhealer@yahoo.com");
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

function setUpEmailCampaign(jsonSinglePersonData, uuid, name, email) {
    console.log("PREPARE EMAIL CAMPAIGN CHATGPT");

    try {
        // Generate ChatGPT prompt
        const prompt = getChatEmailCampaignInstructions(name, uuid, jsonSinglePersonData, email);
        console.log("PROMPT ", prompt);
        
        const emailCampaignData = getChatGPTEmailCampaignResponse(prompt, uuid);
        console.log("RESPONSE ", emailCampaignData);
        
        saveEmailCampaignToFirebase(emailCampaignData, uuid);
        console.log("Trial email campaign setup successfully.");
    } catch (error) {
        console.error("Error setting up trial email campaign:", error.message);
    }
}

function testEmailCampaignFields() {
  const jsonData = getUUIDDataFromTrialCampaignTable();
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
  
  Object.keys(data).forEach((uuid) => {
    const emailData = data[uuid];
    
    // Check all required fields
    const requiredFields = [
      "Campaign_Date", "Name", "Email",
      "Email_1", "Email_2", "Email_3", "Email_4", "Email_5", "Email_6", "Email_7", "Email_8",
      "Subject_1", "Subject_2", "Subject_3", "Subject_4", "Subject_5", "Subject_6", "Subject_7", "Subject_8"
    ];
    
    const missingFields = requiredFields.filter(field => !emailData[field]);
    
    if (missingFields.length > 0) {
      console.log(`UUID ${uuid} is missing fields: ${missingFields.join(", ")}`);
    } else {
      console.log(`UUID ${uuid} has all required fields.`);
    }
  });
}

/**
 * Sends email campaigns based on trial duration
 * Updated to handle 8 emails (days 3, 5, 7, 9, 13, 17, 24, 30)
 */
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
    
    // Extract all email content and subjects (now including days 13, 17, 24, 30)
    const {
      Campaign_Date,
      Name,
      Email,
      Email_1,
      Email_2,
      Email_3,
      Email_4,
      Email_5,
      Email_6,
      Email_7,
      Email_8,
      Subject_1,
      Subject_2,
      Subject_3,
      Subject_4,
      Subject_5,
      Subject_6,
      Subject_7,
      Subject_8
    } = emailData;
    
    console.log("TRIAL EMAIL DATA: ", JSON.stringify(emailData));
    
    // Calculate the difference in days between Campaign_Date and today
    const campaignDate = new Date(Campaign_Date);
    const differenceInDays = Math.floor((today - campaignDate) / (1000 * 60 * 60 * 24));
    
    // Map of day numbers to corresponding email content
    const emails = {
      3: Email_1,
      5: Email_2,
      7: Email_3,
      9: Email_4,
      13: Email_5,
      17: Email_6,
      24: Email_7,
      30: Email_8
    };
    
    // Map of day numbers to corresponding email subjects
    const subjects = {
      3: Subject_1,
      5: Subject_2,
      7: Subject_3,
      9: Subject_4,
      13: Subject_5,
      17: Subject_6,
      24: Subject_7,
      30: Subject_8
    };
    
    // Check if the day difference matches an email trigger
    if (emails[differenceInDays]) {
      const emailContent = emails[differenceInDays];
      const subject = subjects[differenceInDays];
      const day = differenceInDays;
      
      console.log(`Sending day ${day} email to ${Name} (${Email})`);
      console.log("Email subject: ", subject);
      
      // Call the email sending function with subject
      sendTrialCampaignEmailWithMailerSend(Name, Email, emailContent, subject, day);
      
    } else if (differenceInDays > 30) {
      // Changed from 9 to 30 to reflect the extended campaign
      deleteUUIDFromTrialCampaignTable(uuid);
      console.log(`UUID ${uuid} deleted from the table as it is beyond 30 days.`);
      
    } else {
      console.log(`No email to send today for ${Name} (${Email}). Currently on day ${differenceInDays}.`);
    }
  });
}

/**
 * Sends an email notification to a user informing them that their information has been updated.
 * - Generates a personalized HTML email with updated information acknowledgment.
 * - Sends the email using the MailerSend API.
 *
 * @param {string} name - The recipient's name for personalization in the email.
 * @param {string} email - The recipient's email address where the notification will be sent.
 * @returns {void}
 */
function sendUpdateInfoWithMailerSend(name, email) {
  console.log("name: ", name, " email: ", email);
  const mailerSendUrl = "https://api.mailersend.com/v1/email";

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
            <img src="https://zodiaccurate.app/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
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
            <p>&copy; 2024 Zodiaccurate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


// Log the final generated HTML
console.log("Generated HTML:");
console.log(emailHtml);


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

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${MAILER_SEND_API_KEY}`,
    },
    payload: JSON.stringify(emailData),
  };

  try {
    const response = UrlFetchApp.fetch(mailerSendUrl, options);
    Logger.log("Email sent successfully: " + response.getContentText());
  } catch (error) {
    Logger.log("Error sending email: " + error.message);
  }
}

/**
 * Emails a summary report of expired trials to the admin
 * 
 * @param {string} adminEmail - Email address to send the report to (using ADMIN_EMAIL)
 * @param {Object} results - Results from the expireTrialUsers function
 */
async function emailTrialExpirationReport(adminEmail, results) {
  console.log("Sending expired trial email to: " + adminEmail);
  
  if (!results || !results.success) {
    Logger.log("No valid results to email");
    return;
  }
  
  const subject = `Trial Expiration Report - ${new Date().toLocaleDateString()}`;
  
  // Build HTML body for the email
  let emailHtml = `
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
              max-width: 800px;
              margin: 20px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 20px;
          }
          .content {
              padding: 20px;
          }
          h2 {
              color: #2e6ca8;
              margin-bottom: 10px;
          }
          h3 {
              color: #2e6ca8;
              margin-top: 20px;
          }
          p {
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 10px;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          th, td {
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
          }
          th {
              background-color: #f2f2f2;
              font-weight: bold;
          }
          tr:nth-child(even) {
              background-color: #f9f9f9;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #777;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Trial Expiration Report</h2>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="content">
              <p><strong>Total Users Processed:</strong> ${results.processed}</p>
              <p><strong>Trials Expired:</strong> ${results.expired}</p>
              <p><strong>Errors:</strong> ${results.errors}</p>`;

  // Add expired users table if any
  if (results.expiredUsers && results.expiredUsers.length > 0) {
    emailHtml += `
              <h3>Expired Users:</h3>
              <table>
                  <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Trial Days</th>
                  </tr>`;
    
    results.expiredUsers.forEach(user => {
      emailHtml += `
                  <tr>
                      <td>${user.userId}</td>
                      <td>${user.name}</td>
                      <td>${user.email}</td>
                      <td>${user.trialDays}</td>
                  </tr>`;
    });
    
    emailHtml += `
              </table>`;
  } else {
    emailHtml += `
              <p><em>No users were expired in this run.</em></p>`;
  }

  emailHtml += `
          </div>
          <div class="footer">
              <p>Zodiaccurate Trial Management System</p>
              <p>${COPYRIGHT}</p>
          </div>
      </div>
  </body>
  </html>`;

  // Create email data object for MailerSend
  const emailData = {
    from: {
      email: "system@zodiaccurate.com",
      name: "Zodiaccurate System"
    },
    to: [
      {
        email: adminEmail,
        name: "Admin"
      }
    ],
    subject: subject,
    html: emailHtml
  };

  try {
    console.log("Sending email report to " + adminEmail);
    const response = await sendEmail(MAILER_SEND_URL, emailData);
    console.log("Trial expiration report email sent successfully");
    return response;
  } catch (error) {
    console.error("Error sending trial expiration report:", error.message);
    return null;
  }
}

/**
 * Tests email sending with simplified content to isolate issues
 */
function testSimpleEmail() {
  console.log("Testing simple email sending...");
  
  // Simple test email with minimal content
  const emailData = {
    from: {
      email: "dailyguidance@zodiaccurate.com",
      name: "Daily Guidance Test",
    },
    to: [
      {
        email: "your-test-email@example.com", // Replace with your test email
        name: "Test User",
      }
    ],
    subject: "Test Email - " + new Date().toISOString(),
    html: `
      <html>
        <body>
          <p>This is a test email sent at ${new Date().toISOString()}</p>
        </body>
      </html>
    `,
  };
  
  // Log the exact request being made
  console.log("Sending test email with payload:");
  console.log(JSON.stringify(emailData, null, 2));
  
  try {
    // Send the email with detailed logging
    const options = {
      method: "POST",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${MAILER_SEND_API_KEY}`,
      },
      payload: JSON.stringify(emailData),
      muteHttpExceptions: true  // This prevents exceptions from being thrown
    };
    
    // Make the request
    console.log("Making API request to:", MAILER_SEND_URL);
    const response = UrlFetchApp.fetch(MAILER_SEND_URL, options);
    
    // Log detailed response info
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();
    const headers = response.getAllHeaders();
    
    console.log("Response Status Code:", statusCode);
    console.log("Response Headers:", JSON.stringify(headers, null, 2));
    console.log("Response Body:", responseBody);
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log("✅ Test email sent successfully!");
    } else {
      console.log("❌ Test email failed with status code:", statusCode);
    }
    
    return {
      success: statusCode >= 200 && statusCode < 300,
      statusCode: statusCode,
      responseBody: responseBody
    };
  } catch (error) {
    console.error("❌ Error sending test email:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Checks if an email is delivered by directly calling the MailerSend API
 */
function checkEmailStatus(emailId) {
  if (!emailId) {
    console.error("No email ID provided");
    return;
  }
  
  console.log(`Checking status for email ID: ${emailId}`);
  
  try {
    const url = `https://api.mailersend.com/v1/email-log/${emailId}`;
    
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MAILER_SEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    console.log("Status check response:", statusCode);
    console.log("Status details:", responseBody);
    
    return {
      statusCode: statusCode,
      details: responseBody
    };
  } catch (error) {
    console.error("Error checking email status:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validates email content and structure before sending
 */
function validateEmailContent(zodiaccurate) {
  console.log("Validating email content...");
  
  // Check for null/undefined data
  if (!zodiaccurate) {
    console.error("❌ zodiaccurate data is null or undefined");
    return false;
  }
  
  // Log the structure and type
  console.log("Data type:", typeof zodiaccurate);
  console.log("Is array?", Array.isArray(zodiaccurate));
  
  // Check array length if applicable
  if (Array.isArray(zodiaccurate)) {
    console.log("Array length:", zodiaccurate.length);
    if (zodiaccurate.length === 0) {
      console.error("❌ zodiaccurate array is empty");
      return false;
    }
  }
  
  // Convert to array for consistent processing
  let zodiaccurateArray = [];
  
  if (Array.isArray(zodiaccurate)) {
    zodiaccurateArray = zodiaccurate;
  } else if (zodiaccurate && typeof zodiaccurate === 'object') {
    // Handle case where it's a single object with Category/Content
    if (zodiaccurate.Category && zodiaccurate.Content) {
      zodiaccurateArray = [zodiaccurate];
    } 
    // Handle case where it's an object with category keys
    else {
      zodiaccurateArray = Object.keys(zodiaccurate).map(key => {
        if (zodiaccurate[key] && zodiaccurate[key].Category && zodiaccurate[key].Content) {
          return {
            Category: zodiaccurate[key].Category,
            Content: zodiaccurate[key].Content
          };
        }
        return {
          Category: key,
          Content: zodiaccurate[key]
        };
      });
    }
  }
  
  // Check if we have data after conversion
  if (zodiaccurateArray.length === 0) {
    console.error("❌ No valid data after conversion");
    return false;
  }
  
  // Validate each category item
  console.log("Validating individual categories...");
  
  // Check for any huge content that might exceed limits
  let totalContentLength = 0;
  
  zodiaccurateArray.forEach((item, index) => {
    console.log(`Category ${index + 1}: ${item.Category || "Unnamed"}`);
    
    if (!item.Content) {
      console.warn(`⚠️ No content for category at index ${index}`);
    } else {
      // Check content length
      const contentLength = String(item.Content).length;
      totalContentLength += contentLength;
      
      if (contentLength > 100000) {
        console.warn(`⚠️ Very large content (${contentLength} chars) for category ${item.Category || index}`);
      }
    }
  });
  
  console.log(`Total content length: ${totalContentLength} characters`);
  
  if (totalContentLength > 1000000) {
    console.error("❌ Total content may exceed API limits");
    return false;
  }
  
  console.log("✅ Content validation passed");
  return true;
}

/**
 * Debug the sendDailyEmailWithMailerSend function with a real data sample
 */
function debugDailyEmail() {
  // Create a test sample that follows the format of your ChatGPT response
  const testData = [
    {
      "Category": "Personal Spiritual Development",
      "Content": "This is a test for spiritual development content. This contains multiple sentences to simulate real content. This is the third sentence to provide some length. Here's a fourth sentence with more information. And finally a fifth sentence to complete the section."
    },
    {
      "Category": "Career/Financial Matters",
      "Content": "This is a test for career content. This contains multiple sentences to simulate real content. This is the third sentence to provide some length. Here's a fourth sentence with more information. And finally a fifth sentence to complete the section."
    }
  ];
  
  // Test the email function with this data
  console.log("Testing daily email with sample data...");
  
  // Validate the content first
  validateEmailContent(testData);
  
  // Call the email function
  const result = sendDailyEmailWithMailerSend(
    "Test User", 
    "dahnworldhealer@yahoo.com", // Replace with your email
    testData,
    "d8d8b814-2d3a-425e-8ad0-a89463d37dff"
  );
  
  return result;
}