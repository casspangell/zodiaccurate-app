function testWelcomeChatGPT() {
    const testData = getUserDataFromFirebase(PAUL_TEST);
    welcomeChatGPT(testData, PAUL_TEST);
}

async function welcomeChatGPT(jsonSinglePersonData, uuid) {
    console.log("PREPARE WELCOME CHATGPT");
    console.log(jsonSinglePersonData);
    console.log(uuid);

    // Generate ChatGPT prompt
    const prompt = getChatInstructions(jsonSinglePersonData, uuid);
    console.log("PROMPT: ",prompt);
    const userData = getUserDataFromUserTableFirebase(uuid);
    console.log("USER DATA: ",userData);

    try {
      console.log("processing...");
      if(uuid) {
        console.log("uuid found...");
        const zodiaccurateData = await getChatGPTResponse(prompt, uuid);
        const editUrl = findKeyValue(userData, "editURL");
        const { name, email } = jsonSinglePersonData;

        console.log("welcomechat zodiac pull", zodiaccurateData);
      await Promise.all([
        sendWelcomeEmailWithMailerSend(name, uuid, email),
        sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid),
        saveHoroscopeToFirebase(zodiaccurateData, uuid),
        setUpEmailCampaign(zodiaccurateData, uuid, name, email)
      ]);

        console.log("Email sent successfully.");
      } else {
        console.error("UUID is null or undefined")
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}