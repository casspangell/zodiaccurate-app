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
        } else {
            Logger.log("❌ Failed to save new user in Firebase.");
        }
    }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

