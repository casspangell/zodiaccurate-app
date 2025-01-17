/**
 * Sends a personalized welcome email with daily horoscope guidance using MailerSend.
 * - Generates an HTML email with the user's horoscope data.
 * - Sends the email via the MailerSend API.
 *
 * @param {string} name - The recipient's name to personalize the email.
 * @param {string} email - The recipient's email address.
 * @param {string} prompt - The JSON string containing the horoscope data, which is parsed and formatted for the email.
 * @returns {void}
 */
function sendWelcomeEmailWithMailerSend(clientName, editResponseUrl, email) {
  const mailerSendUrl = "https://api.mailersend.com/v1/email";
  console.log("SENDING WELCOME EMAIL");
const copyright = getCopyright();
stripeLink = "www.google.com"; //TODO CHANGE

// Generate HTML content dynamically
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
            <p>${copyright}</p>
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
      name: "Welcome to Zodiaccurate",
    },
    to: [
      {
        email: email, // Recipient's email
        name: clientName || "Valued Seeker",
      },
    ],
    subject: "Life is easier when you can see it coming!",
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


