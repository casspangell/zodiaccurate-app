function testWelcomeChatGPT() {
    const testData = getUserDataFromFirebase(PAUL_TEST);
    welcomeChatGPT(testData, PAUL_TEST);
}

async function welcomeChatGPT(jsonSinglePersonData, uuid) {
    console.log("PREPARE WELCOME CHATGPT");

    // // Fetch user data
    // var jsonSinglePersonData = {};
    // jsonSinglePersonData = getUserDataFromFirebase(uuid);

    // Generate ChatGPT prompt
    const prompt = getChatInstructions(jsonSinglePersonData, uuid);
    const userData = getUserDataFromUserTableFirebase(uuid);

    try {
      if(uuid) {
        const zodiaccurateData = await getChatGPTResponse(prompt, uuid);
        const editUrl = findKeyValue(userData, "editURL");
        const { name, email } = jsonSinglePersonData;
        console.log("EDITURL: ", editUrl);
        console.log("welcomechat zodiac pull", zodiaccurateData);
      await Promise.all([
        sendWelcomeEmailWithMailerSend(name, editUrl, email),
        sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid),
        saveHoroscopeToFirebase(zodiaccurateData, uuid)
      ]);

        console.log("Email sent successfully.");
      } else {
        console.error("UUID is null or undefined")
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}