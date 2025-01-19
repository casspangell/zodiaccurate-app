/**
 * Main function to run the Zodiaccurate process.
 * - Retrieves the current hour.
 * - Fetches UUIDs from the exec_time table for the current hour.
 * - Iterates over each user, retrieves their zodiac data, and processes nightly data.
 *
 * @returns {void}
 */
function runZodiaccurate() {
  // Get the current hour
  const currHour = getCurrentHour();
  console.log(`Running Zodiaccurate for hour: ${currHour}`);

  // Pull UUIDs from exec_time table for the current hour
  let users = fetchUUIDsForTimezone(); // Raw data is an object

  // Check if users is a valid object
  if (!users || typeof users !== "object") {
    console.log("No valid user data found.");
    return;
  }

  // Iterate over the object keys and values
  Object.entries(users).forEach(([uuid, user]) => {
    const email = user.email;
    const name = user.name;

    console.log(`Processing UUID: ${uuid}`);
    console.log(`Name: ${name}, Email: ${email}`);

    // Grab the zodiac data for today
    const zodiacData = getZodiacDataForToday(uuid);
    nightlyChatGPT(uuid, user);

    if (zodiacData) {
      console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
      
      // Uncomment this to send the daily email
      sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
    }
  });

  console.log("Zodiaccurate processing complete.");
}

/**
 * Processes nightly data for a given user using ChatGPT.
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
    const threeDays = await getThreeDaysDataFromFirebase(uuid);
    console.log(`Data for UUID ${uuid}:`, threeDays);

    if (threeDays) {
      console.log(`Processing nightly data for UUID: ${uuid}`);

      // Generate ChatGPT prompt
      const prompt = getChatInstructions(userData, uuid);

      try {
        if(uuid) {
          const chatGPTResponse = await getChatGPTResponse(prompt, uuid);
          if (chatGPTResponse != null) {
            saveHoroscopeToFirebase(chatGPTResponse, uuid);
          }
        } else {
          console.error("UUID is null or undefined")
        }
      } catch (error) {
          console.error("An error occurred:", error);
      }
    }

  } catch (error) {
    console.error(`Error in nightlyChatGPT for UUID ${uuid}:`, error.message);
  }
}

/**
 * Fetches UUIDs and their associated user data for the specified timezones.
 * - Retrieves timezones where it's 6 AM.
 * - Fetches UUIDs from the exec_time table for those timezones.
 * - Retrieves user data for each UUID and organizes it into a JSON object.
 *
 * @returns {Object|null} - An object containing UUIDs as keys and user data as values, or null if no data is found.
 */
function fetchUUIDsForTimezone() {
  const timezones = getTimezonesAtTime(6);
  console.log("Timezones at 6 AM:", JSON.stringify(timezones, null, 2));

  // Fetch user data for these timezones
  const uuids = getUUIDDataFromExecTimeTable(timezones);
  console.log("UUIDs for Timezone:", JSON.stringify(uuids, null, 2));

  // Process and store user UUIDs if data exists
  if (uuids) {
    const jsonData = {};
    uuids.forEach((uuid) => {
        const userData = getUserDataFromFirebase(uuids);
        jsonData[uuid] = userData; 
        console.log("User data found: ", JSON.stringify(jsonData));
    });

    return jsonData;
  } else {
    console.log("No users found for the given timezones.");
    return null;
  }
}

