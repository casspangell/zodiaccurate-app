/**
 * Processes nightly data for a given user using ChatGPT and saves horoscope to tomorrow.
 * - Fetches three days' worth of data for the specified UUID.
 * - Generates a ChatGPT prompt based on user data.
 * - Retrieves and saves the ChatGPT-generated horoscope to Firebase.
 *
 * @async
 * @param {string} uuid - The unique identifier of the user.
 * @param {Object} userData - The user data object containing relevant information.
 * @returns {Promise<void>}
 */
async function nightlyChatGPT(uuid, userData) {
  try {
    // Generate ChatGPT prompt
    const prompt = getChatInstructions(userData, uuid);

    try {
      if(uuid) {
        const chatGPTResponse = await getChatGPTResponse(prompt, uuid);
        if (chatGPTResponse != null) {
          const tomorrow = getTomorrowDay();
          saveHoroscopeToFirebase(chatGPTResponse, uuid, tomorrow);
          return true;
        }
      } else {
        console.error("UUID is null or undefined")
        return false;
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }

  } catch (error) {
    console.error(`Error in nightlyChatGPT for UUID ${uuid}:`, error.message);
  }
}