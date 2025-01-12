function onFormSubmitHandler(e) {

  // Get the edit response URL and UUID for this specific submission
  const responseUrl = e.response.getEditResponseUrl();
  const uuid = responseUrl.split("edit2=")[1];
  let name = "";
  let email = "";
  let timezone = "";
  let exec_time = "";
  var timezoneJson = {};
  
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
        name = answer;
      } 
      
      if (question === "email") {
        timezoneJson["email"] = answer;
        email = answer;
      } 
      
      if (question === "your current location") {
        timezone = getTimeZoneFromLocation(answer);
        console.log("updating timezone ", timezone);
        exec_time = calculateExecutionTimeInChicago(answer);
        timezoneJson["timezone"] = timezone;
        console.log("Exec_time = ", exec_time);
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

    // Save exec_time to Firebase
    saveTimezoneToFirebase(exec_time, uuid, timezoneJson);

}
