async function welcomeChatGPT(uuid) {
    console.log("PREPARE WELCOME CHATGPT");

    // Fetch user data
    var jsonSinglePersonData = {};
    jsonSinglePersonData = getUserDataFromFirebase(uuid);

    // Generate ChatGPT prompt
    const prompt = getChatInstructions(jsonSinglePersonData, uuid);

    try {
      if(uuid) {
        const zodiaccurateData = await getChatGPTResponse(prompt, uuid);
        const editUrl = findKeyValue(jsonSinglePersonData, "editURL");
        const { name, email } = jsonSinglePersonData;
      console.log("welcomechat zodiac pull", zodiaccurateData);
      await Promise.all([
        sendWelcomeEmailWithMailerSend(name, editUrl, email),
        sendDailyEmailWithMailerSend(name, email, zodiaccurateData, uuid)
      ]);

        console.log("Email sent successfully.");
      } else {
        console.error("UUID is null or undefined")
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}