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
  for (const [uuid, user] of Object.entries(users)) {
    const email = user.email;
    const name = user.name;

    try {
      // Grab the zodiac data for today and process nightly chat
      const [zodiacData, nightChat] = await Promise.all([
        getZodiacDataForToday(uuid),
        nightlyChatGPT(uuid, user),
      ]);

      if (zodiacData != null && nightChat === true) {
        console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
        sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
      }
    } catch (error) {
      console.error(`An error occurred while processing user ${uuid}:`, error);
    }
  }

  console.log("Zodiaccurate processing complete.");
}
