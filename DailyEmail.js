function sendDailyEmailWithMailerSend(name, email, prompt) {
  const mailerSendUrl = "https://api.mailersend.com/v1/email";
  console.log("SENDING DAILY GUIDANCE EMAIL ", prompt);

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
            <h3>${new Date().toDateString()}</h3>

            ${prompt.overview ? `
            <h2>Overview</h2>
            <p>${prompt.overview}</p>` : ''}

            ${prompt.career_and_finances ? `
            <h2>Career and Finances</h2>
            <p>${prompt.career_and_finances}</p>` : ''}

            ${prompt.relationships ? `
            <h2>Relationships</h2>
            <p>${prompt.relationships}</p>` : ''}

            ${prompt.parenting_guidance ? `
            <h2>Parenting Guidance</h2>
            <p>${prompt.parenting_guidance}</p>` : ''}

            ${prompt.health ? `
            <h2>Health</h2>
            <p>${prompt.health}</p>` : ''}

            ${prompt.personal_guidance ? `
            <h2>Personal Guidance</h2>
            <p>${prompt.personal_guidance}</p>` : ''}

            ${prompt.local_weather ? `
            <h2>Local Weather</h2>
            <p>${prompt.local_weather}</p>` : ''}
        </div>
        <div class="footer">
            <p>&copy; 2025 Zodiaccurate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  // Log the final generated HTML
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
        name: name || "Valued Seeker",
      },
    ],
    subject: "Your Daily Guidance",
    html: emailHtml, // Use the formatted HTML content
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
