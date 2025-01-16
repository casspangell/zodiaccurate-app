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
  // Get the edit response URL and UUID for this specific submission
  const responseUrl = e.response.getEditResponseUrl();
  const uuid = responseUrl.split("edit2=")[1];
  let name = "";
  let email = "";
  let timezone = "";
  var timezoneJson = {};
  var userData = {};
  
  // Check if the user already exists in Firebase
  const user = doesUserExist(uuid);

  // Get the responses for the current submission
  const itemResponses = e.response.getItemResponses();
  const jsonData = {};

  for (const itemResponse of itemResponses) {
      const question = itemResponse.getItem().getTitle().toLowerCase();
      const answer = itemResponse.getResponse();
      console.log(question, " ", answer);

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
        console.log("updating timezone ", timezone);
      }

      jsonData[question] = answer;
    }

  if (user) {
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


    itemResponses.forEach(item => {
      const question = item.getItem().getTitle().toLowerCase().trim();
      const answer = item.getResponse();
      Logger.log(`Question: ${question}, Answer: ${answer}`);
    });

    // Save zodiac data to Firebase
    const saveResult = pushEntryToFirebase(jsonData, uuid);

    // Ensure dependent actions only execute after Firebase has successfully saved the data
    if (saveResult) {
      welcomeChatGPT(uuid);
    }
  }
  
    const formattedTimezone = replaceSlashesWithDashes(timezone);
    updateExecTimeTable(uuid, formattedTimezone);
    saveUserToUserTableFirebase(uuid, userData);
}
