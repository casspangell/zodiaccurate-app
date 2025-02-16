/**
 * Main function to run the Zodiaccurate process.
 * - Retrieves the current hour.
 * - Fetches UUIDs from the exec_time table for the current hour.
 * - Iterates over each user, retrieves their zodiac data, and processes nightly data.
 *
 * @returns {void}
 */
async function runZodiaccurate() {
  const currHour = getCurrentHour();
  console.log(`Running Zodiaccurate for hour: ${currHour}`);

  // Pull UUIDs from exec_time table for 6am
  let users = fetchUUIDsForTimezone(6);

  // Check if users is empty
  if (!users || typeof users !== "object") {
    console.log("No valid user data found.");
    return;
  }

  // Iterate over the object keys and values
  for (const [user, uuid] of Object.entries(users)) {
    let email = user.email;
    let name = user.name;
    let userData = null;

    if (!name || !email) {
      console.log("Name or email not found from user data in runZodiaccurate");
      userData = getUserDataFromUserTableFirebase(uuid);
      email = userData.email;
      name = userData.name;
    }

    try {
      // Attempt to get today's Zodiac data
      let zodiacData = await getZodiacDataForToday(uuid);

      // If no data exists, create today's horoscope
      if (zodiacData == null) {
        console.log(`No zodiac data found for UUID ${uuid}, generating new horoscope.`);
        const horoscopeCreated = await createTodaysHoroscopeChatGPT(uuid, user);

        if (horoscopeCreated) {
          // Fetch the newly created horoscope
          zodiacData = await getZodiacDataForToday(uuid);
        }
      }

      // If zodiac data is still null, log and continue to next user
      if (zodiacData == null) {
        console.error(`Failed to generate zodiac data for UUID ${uuid}, skipping email.`);
        continue;
      }

      // Proceed if zodiac data exists and the nightly chat runs successfully
      const nightChat = await nightlyChatGPT(uuid, user);

      if (nightChat === true) {
        console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
        console.log('Name: ', name," Email: ", email);
        sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
      }
    } catch (error) {
      console.error(`An error occurred while processing user ${uuid}:`, error);
    }
  }

  console.log("Zodiaccurate processing complete.");
}


async function manuallyRunZodiaccurateForTimezone() {
  const timezones = ["australia_sydney"];
  console.log(`Running Zodiaccurate for timezone: ${timezones}`);

  // Pull UUIDs from exec_time table for the designated timezone string
  let users = getUUIDDataFromExecTimeTable(timezones);

  // Check if users is empty
  if (!users || typeof users !== "object") {
    console.log("No valid user data found.");
    return;
  }

  // Iterate over the object keys and values
  for (const [user, uuid] of Object.entries(users)) {
    let email = user.email;
    let name = user.name;
    let userData = null;

    if (!name || !email) {
      userData = getUserDataFromUserTableFirebase(uuid);
      email = userData.email;
      name = userData.name;
    }

    try {
      // Attempt to get today's Zodiac data
      // If no data exists, create today's horoscope save to Firebase
      // Fetch the newly created horoscope
      let zodiacData = await getZodiacDataForToday(uuid);

      if (zodiacData == null) {
        console.log(`No zodiac data found for UUID ${uuid}, generating new horoscope.`);
        const horoscopeCreated = await createTodaysHoroscopeChatGPT(uuid, user);

        if (horoscopeCreated) {
          zodiacData = await getZodiacDataForToday(uuid);
        }
      }

      // If zodiac data is still null, log and continue to next user
      if (zodiacData == null) {
        console.error(`Failed to generate zodiac data for UUID ${uuid}, skipping email.`);
        continue;
      }

      // Proceed if zodiac data exists and the nightly chat runs successfully
      const nightChat = await nightlyChatGPT(uuid, user);

      if (nightChat === true) {
        console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
        console.log('Name: ', name," Email: ", email);
        sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
      }
    } catch (error) {
      console.error(`An error occurred while processing user ${uuid}:`, error);
    }
  }

  console.log("Zodiaccurate processing complete.");
}