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
    console.log("Email sent successfully:", response.getContentText());
    return response;
  } catch (error) {
    console.error("Error sending email:", error.message, {
      apiUrl,
      emailData,
    });
    throw error;
  }
}

async function sendWelcomeEmailWithMailerSend(clientName, editResponseUrl, email) {
  console.log("sendWelcomeEmailWithMailerSend");
  if (!clientName || !email || !editResponseUrl) {
    throw new Error("Missing required parameters for welcome email.");
  }

  const mailerSendUrl = "https://api.mailersend.com/v1/email";
  const stripeLink = "www.google.com"; // TODO: Update this link

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
              <p>We look forward to being a part of your challenging, miraculous , creative, life.<br><br></p>
              <p>Best regards,<br/>
              Your Zodiaccurate Team<br></p>
              <p>You can change your CC information or cancel anytime via this <a href="${stripeLink}">Link</a></p>
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

  return await sendEmail(mailerSendUrl, emailData);
}

async function sendDailyEmailWithMailerSend(clientName, email, prompt) {
  console.log("sendDailyEmailWithMailerSend");

  if (!clientName || !email || !prompt) {
    throw new Error("Missing required parameters for daily email.");
  }

  // Handle the case where prompt is an array
  const dailyPrompt = Array.isArray(prompt) ? prompt[0] : prompt;

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
              <img src="https://taohealinggroup.com/zodiaccurate/zodiaccurate_logo.png" alt="Zodiaccurate Daily Guidance">
          </div>
          <div class="content">
              <h3>${new Date().toDateString()}</h3>

              ${dailyPrompt.overview ? `
              <h2>Overview</h2>
              <p>${dailyPrompt.overview}</p>` : ''}

              ${dailyPrompt.career_and_finances ? `
              <h2>Career and Finances</h2>
              <p>${dailyPrompt.career_and_finances}</p>` : ''}

              ${dailyPrompt.relationships ? `
              <h2>Relationships</h2>
              <p>${dailyPrompt.relationships}</p>` : ''}

              ${dailyPrompt.parenting_guidance ? `
              <h2>Parenting Guidance</h2>
              <p>${dailyPrompt.parenting_guidance}</p>` : ''}

              ${dailyPrompt.health ? `
              <h2>Health</h2>
              <p>${dailyPrompt.health}</p>` : ''}

              ${dailyPrompt.personal_guidance ? `
              <h2>Personal Guidance</h2>
              <p>${dailyPrompt.personal_guidance}</p>` : ''}

              ${dailyPrompt.local_weather ? `
              <h2>Local Weather</h2>
              <p>${dailyPrompt.local_weather}</p>` : ''}
          </div>
          <div class="footer">
              <p>&copy; ${COPYRIGHT} Zodiaccurate. All rights reserved.</p>
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

  return await sendEmail(mailerSendUrl, emailData);
}