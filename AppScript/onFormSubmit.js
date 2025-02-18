/**
 * Handles form submissions from Google Forms.
 * - Retrieves and processes responses from the submitted form.
 * - Determines if the user already exists in the system.
 * - Updates or creates a new entry in Firebase based on user existence.
 * - Updates the exec_time table and user table in Firebase.
 * - Sends emails for updates or new user welcomes.
 *
 * @param {Object} e - The event object from the form submission, containing the response data.
 * @property {Object} e.response - The form response object.
 * @property {Function} e.response.getEditResponseUrl - Retrieves the URL for editing the response.
 * @property {Function} e.response.getItemResponses - Retrieves the submitted responses.
 * @returns {void}
 */
function onFormSubmitHandler(e) {
    Logger.log("📩 Submission Triggered: onFormSubmitHandler");

    if (!e || !e.response) {
        Logger.log("❌ Invalid form submission event.");
        return;
    }

    // Extract Edit Response URL and UUID
    const responseUrl = e.response.getEditResponseUrl();
    if (!responseUrl) {
        Logger.log("❌ Failed to retrieve response URL.");
        return;
    }

    const uuid = responseUrl.split("edit2=")[1];
    if (!uuid) {
        Logger.log("❌ Failed to extract UUID from response URL.");
        return;
    }

    Logger.log(`✅ Retrieved UUID: ${uuid}`);

    let name = "";
    let email = "";
    let timezone = "";
    let userData = { "editURL": responseUrl };
    let jsonData = {};
    let timezoneJson = {};

    // Extract responses from form submission
    const itemResponses = e.response.getItemResponses();
    
    for (const itemResponse of itemResponses) {
        const question = itemResponse.getItem().getTitle().trim().toLowerCase();
        const answer = itemResponse.getResponse();

        if (!answer) continue; // Skip empty answers

        if (question === "name") {
            userData["name"] = answer;
            name = answer;
        }

        if (question === "email") {
            userData["email"] = answer;
            email = answer;
        }

        if (question === "your current location") {
            timezone = getTimeZoneFromLocation(answer, uuid);
            userData["timezone"] = replaceSlashesWithDashes(timezone);
            console.log("🌍 Updating Timezone: ", timezone);
        }

        jsonData[question] = answer;
    }

    // Validate extracted data
    if (!name || !email) {
        Logger.log("❌ Missing required fields (name/email). Aborting.");
        return;
    }

    Logger.log(`✅ Form Data Extracted - Name: ${name}, Email: ${email}, Timezone: ${timezone}`);

    // Check if user exists in Firebase
    const userExists = doesUserExist(uuid);
    Logger.log(`🔍 User Exists in Firebase: ${userExists}`);

    let saveResult = false;
    let userSaveResult = false;

    if (userExists) {
        Logger.log("🔄 Updating Existing User...");

        // Update Firebase entry
        saveResult = pushEntryToFirebase(jsonData, uuid);
        if (saveResult) {
            Logger.log("✅ User data updated in Firebase.");
            sendUpdateInfoWithMailerSend(name, email);
        } else {
            Logger.log("❌ Failed to update user data in Firebase.");
        }
    } else {
        Logger.log("🆕 New User Submission Detected.");

        jsonData["trial-date-start"] = new Date().toISOString();
        jsonData["trial"] = "true";

        userSaveResult = saveUserToUserTableFirebase(uuid, userData);
        saveResult = pushEntryToFirebase(jsonData, uuid);

        if (saveResult && userSaveResult) {
            Logger.log("✅ New User Saved in Firebase.");
            welcomeChatGPT(jsonData, uuid);
            setUpEmailCampaign(jsonData, uuid, name, email);
            sendWelcomeEmailWithMailerSend(name, responseUrl, email);
        } else {
            Logger.log("❌ Failed to save new user in Firebase.");
        }
    }

    // Update execution time & save timezone
    if (timezone) {
        const formattedTimezone = replaceSlashesWithDashes(timezone);
        Logger.log(`🕒 Updating Execution Table with Timezone: ${formattedTimezone}`);
        updateExecTimeTable(uuid, formattedTimezone);

        Logger.log("📌 Saving Timezone to Firebase...");
        saveTimezoneToFirebase(formattedTimezone, uuid, jsonData);
    } else {
        Logger.log("⚠️ Skipping timezone update due to missing data.");
    }
}


function onWebFormSubmitHandler(e) {
  console.log("Hitting onWebFormSubmitHandler: ", e);
  // Get the edit response URL and UUID for this specific submission
  const responseUrl = e.response.getEditResponseUrl();
  const uuid = responseUrl.split("edit2=")[1];
  let name = "";
  let email = "";
  let timezone = "";
  var timezoneJson = {};
  var userData = {};

  userData["editURL"] = responseUrl;

  // Get the responses for the current submission
  const itemResponses = e.response.getItemResponses();
  const jsonData = {};

  for (const itemResponse of itemResponses) {
      const question = itemResponse.getItem().getTitle().toLowerCase();
      const answer = itemResponse.getResponse();

      if (question === "name") {
        timezoneJson["name"] = answer;
        userData["name"] = answer;
        name = answer;
      } 
      
      if (question === "email") {
        timezoneJson["email"] = answer;
        userData["email"] = answer;
        email = answer;
      } 
      
      if (question === "your current location") {
        timezone = getTimeZoneFromLocation(answer);
        jsonData["timezone"] = timezone;
        userData["timezone"] = replaceSlashesWithDashes(timezone);
        console.log("Updating Timezone ", timezone);
      }

      jsonData[question] = answer;
    }

  // Check if the user already exists in Firebase
  const user = doesUserExist(uuid);
  // const userSaveResult = saveUserToUserTableFirebase(uuid, userData);

  if (user !== false) {
    // Handle existing user update
    Logger.log("User exists in system. Updating entry."); 

    // Save data to Firebase
    const saveResult = pushEntryToFirebase(jsonData, uuid);

    if (saveResult) {
      sendUpdateInfoWithMailerSend(name, email);
    }

  } else {
    // Handle new user creation
    Logger.log("New Form Submission Detected.");
    jsonData["trial-date-start"] = new Date();
    jsonData["trial"] = "true";

    const userSaveResult = saveUserToUserTableFirebase(uuid, userData);
    const saveResult = pushEntryToFirebase(jsonData, uuid);

    // Ensure dependent actions only execute after Firebase has successfully saved the data
    if (saveResult && userSaveResult) {
      welcomeChatGPT(jsonData, uuid);
      setUpEmailCampaign(jsonData, uuid, name, email);
      sendWelcomeEmailWithMailerSend(uuid, name, responseUrl, email);
    }
  }
  
    const formattedTimezone = replaceSlashesWithDashes(timezone);
    updateExecTimeTable(uuid, formattedTimezone);
    saveTimezoneToFirebase(formattedTimezone);
}
