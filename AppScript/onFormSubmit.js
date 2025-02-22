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
// function onFormSubmitHandler(e) {
//     Logger.log("📩 Submission Triggered: onFormSubmitHandler");

    // if (!e || !e.response) {
    //     Logger.log("❌ Invalid form submission event.");
    //     return;
    // }

    // // Extract Edit Response URL and UUID
    // const responseUrl = e.response.getEditResponseUrl();
    // if (!responseUrl) {
    //     Logger.log("❌ Failed to retrieve response URL.");
    //     return;
    // }

    // const uuid = responseUrl.split("edit2=")[1];
    // if (!uuid) {
    //     Logger.log("❌ Failed to extract UUID from response URL.");
    //     return;
    // }

    // Logger.log(`✅ Retrieved UUID: ${uuid}`);

    // let name = "";
    // let email = "";
    // let timezone = "";
    // let userData = { "editURL": responseUrl };
    // let jsonData = {};
    // let timezoneJson = {};

    // // Extract responses from form submission
    // const itemResponses = e.response.getItemResponses();
    
    // for (const itemResponse of itemResponses) {
    //     const question = itemResponse.getItem().getTitle().trim().toLowerCase();
    //     const answer = itemResponse.getResponse();

    //     if (!answer) continue; // Skip empty answers

    //     if (question === "name") {
    //         userData["name"] = answer;
    //         name = answer;
    //     }

    //     if (question === "email") {
    //         userData["email"] = answer;
    //         email = answer;
    //     }

    //     if (question === "your current location") {
    //         timezone = getTimeZoneFromLocation(answer, uuid);
    //         userData["timezone"] = replaceSlashesWithDashes(timezone);
    //         console.log("🌍 Updating Timezone: ", timezone);
    //     }

    //     jsonData[question] = answer;
    // }

    // // Validate extracted data
    // if (!name || !email) {
    //     Logger.log("❌ Missing required fields (name/email). Aborting.");
    //     return;
    // }

    // Logger.log(`✅ Form Data Extracted - Name: ${name}, Email: ${email}, Timezone: ${timezone}`);

    // // Check if user exists in Firebase
    // const userExists = doesUserExist(uuid);
    // Logger.log(`🔍 User Exists in Firebase: ${userExists}`);

    // let saveResult = false;
    // let userSaveResult = false;

    // if (userExists) {
    //     Logger.log("🔄 Updating Existing User...");

    //     // Update Firebase entry
    //     saveResult = pushEntryToFirebase(jsonData, uuid);
    //     if (saveResult) {
    //         Logger.log("✅ User data updated in Firebase.");
    //         sendUpdateInfoWithMailerSend(name, email);
    //     } else {
    //         Logger.log("❌ Failed to update user data in Firebase.");
    //     }
    // } else {
    //     Logger.log("🆕 New User Submission Detected.");

    //     jsonData["trial-date-start"] = new Date().toISOString();
    //     jsonData["trial"] = "true";

    //     userSaveResult = saveUserToUserTableFirebase(uuid, userData);
    //     saveResult = pushEntryToFirebase(jsonData, uuid);

    //     if (saveResult && userSaveResult) {
    //         Logger.log("✅ New User Saved in Firebase.");
    //         welcomeChatGPT(jsonData, uuid);
    //         setUpEmailCampaign(jsonData, uuid, name, email);
    //         sendWelcomeEmailWithMailerSend(name, responseUrl, email);
    //     } else {
    //         Logger.log("❌ Failed to save new user in Firebase.");
    //     }
    // }

    // // Update execution time & save timezone
    // if (timezone) {
    //     const formattedTimezone = replaceSlashesWithDashes(timezone);
    //     Logger.log(`🕒 Updating Execution Table with Timezone: ${formattedTimezone}`);
    //     updateExecTimeTable(uuid, formattedTimezone);

    //     Logger.log("📌 Saving Timezone to Firebase...");
    //     saveTimezoneToFirebase(formattedTimezone, uuid, jsonData);
    // } else {
    //     Logger.log("⚠️ Skipping timezone update due to missing data.");
    // }
// }


function onWebFormSubmitHandler(e) {
  console.log("Hitting onWebFormSubmitHandler: ", e);
  
  // Ensure that we have the expected structure
  if (!e || !e.formData) {
    console.error("Unexpected payload format:", e);
    return ContentService.createTextOutput("Error: Unexpected payload format")
                          .setMimeType(ContentService.MimeType.TEXT);
  }
  
  // Extract data from the payload.
  // Use formData.submissionId if available, otherwise fallback to the top-level uuid.
  var uuid = e.uuid;
  var name = e.formData.name || e.name;
  var email = e.formData.email || e.email;
  
  // Log the extracted values
  console.log("Extracted UUID:", uuid);
  console.log("Extracted Name:", name);
  console.log("Extracted Email:", email);
  
  // (Optional) Extract additional fields if needed
  var location = e.formData.location;
  var birthCity = e.formData.birth_city;
  var birthDate = e.formData.birth_date;
  var birthTime = e.formData.birth_time;
  var relationshipStatus = e.formData.relationship_status;
  var employmentStatus = e.formData.employment_status;
  
  console.log("Location:", location);
  console.log("Birth City:", birthCity);
  console.log("Birth Date:", birthDate);
  console.log("Birth Time:", birthTime);
  console.log("Relationship Status:", relationshipStatus);
  console.log("Employment Status:", employmentStatus);

    var userData = {};

    // Iterate over the keys in the formData object
    // for (const key in e.formData) {
    //   if (Object.prototype.hasOwnProperty.call(e.formData, key)) {
    //     const answer = e.formData[key];
    //     // Normalize the key to lower-case for consistency
    //     const question = key.trim().toLowerCase();
        
    //     userData[question] = answer;
    //   }
    // }

    // Validate extracted data
    if (!name || !email) {
        Logger.log("❌ Missing required fields (name/email). Aborting.");
        return;
    }

    // Check if user exists in Firebase
    const userExists = doesUserExist(uuid);
    Logger.log(`🔍 User Exists in Firebase: ${userExists}`);

    let saveResult = false;
    let userSaveResult = false;

    if (userExists) {
        Logger.log("🔄 Updating Existing User...");

        // Update Firebase entry
        saveResult = pushEntryToFirebase(e.formData, uuid);
        if (saveResult) {
            Logger.log("✅ User data updated in Firebase.");
            sendUpdateInfoWithMailerSend(name, email);
        } else {
            Logger.log("❌ Failed to update user data in Firebase.");
        }
    } else {
        Logger.log("🆕 New User Submission Detected.");

        // jsonData["trial-date-start"] = new Date().toISOString();
        // jsonData["trial"] = "true";

        // Update execution time & save timezone
        if (location) {
            const timezone = getTimeZoneFromLocation(location);
            const formattedTimezone = replaceSlashesWithDashes(timezone);
            userData["timezone"] = formattedTimezone;
            
            Logger.log(`🕒 Updating Execution Table with Timezone: ${formattedTimezone}`);
            updateExecTimeTable(uuid, formattedTimezone);

            Logger.log("📌 Saving Timezone to Firebase...");
            saveTimezoneToFirebase(formattedTimezone, uuid, e.formData);
        } else {
            Logger.log("⚠️ Skipping timezone update due to missing data.");
        }

        userData["editURL"] = uuid; 
        userData["email"] = email;
        userData["name"] = name;

        userSaveResult = saveUserToUserTableFirebase(uuid, userData);
        saveResult = pushEntryToFirebase(e.formData, uuid);

        if (saveResult && userSaveResult) {
            Logger.log("✅ New User Saved in Firebase.");
            welcomeChatGPT(e.formData, uuid);
            setUpEmailCampaign(e.formData, uuid, name, email);
            // sendWelcomeEmailWithMailerSend(name, responseUrl, email);
        } else {
            Logger.log("❌ Failed to save new user in Firebase.");
        }
    }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

