
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
  let users = fetchUUIDsForTimezone(18);  //todo

//------------Run For Timezone Manually--------------//
  // const timezones = ["australia_sydney"];
  // console.log(`Running Zodiaccurate for timezone: ${timezones}`);

  // // Pull UUIDs from exec_time table for the designated timezone string
  // let users = getUUIDDataFromExecTimeTable(timezones);
//------------Run For Timezone Manually--------------//

  // Check if users is empty
  if (!users || typeof users !== "object") {
    console.log("No valid user data found.");
    return;
  }

  Logger.log(JSON.stringify(users, null, 2));

// Iterate over the object keys and values
for (let [data, user] of Object.entries(users)) {
    let email = user.email;
    let name = user.name;
    let editUrl = user.editURL || null; // Ensure the correct key
    let userData = null;

    // Ensure editUrl exists before splitting
    if (editUrl) {
        const uuidExtracted = editUrl.includes("edit2=") ? editUrl.split("edit2=")[1] : null;
        if (uuidExtracted) {
            uuid = uuidExtracted; // Update UUID if extracted
        } else {
            Logger.log(`Malformed editURL for UUID: ${uuid}`);
            continue;
        }
    } else {
        Logger.log(`Missing editURL for UUID: ${uuid}`);
    }

    // If email or name is missing, fetch from Firebase
    if (!name || !email) {
        userData = getUserDataFromUserTableFirebase(uuid);
        if (userData) {
            email = userData.email || email;
            name = userData.name || name;
        } else {
            Logger.log(`User data not found in Firebase for UUID: ${uuid}`);
            continue;
        }
    }

    Logger.log(`Processing user: ${name}, Email: ${email}, UUID: ${uuid}`);

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


// async function manuallyRunZodiaccurateForTimezone() {
//   const timezones = ["australia_sydney"];
//   console.log(`Running Zodiaccurate for timezone: ${timezones}`);

//   // Pull UUIDs from exec_time table for the designated timezone string
//   let users = getUUIDDataFromExecTimeTable(timezones);

//   // Check if users is empty
//   if (!users || typeof users !== "object") {
//     console.log("No valid user data found.");
//     return;
//   }

//   // Iterate over the object keys and values
//   for (const [user, uuid] of Object.entries(users)) {
//     let email = user.email;
//     let name = user.name;
//     let userData = null;

//     if (!name || !email) {
//       userData = getUserDataFromUserTableFirebase(uuid);
//       email = userData.email;
//       name = userData.name;
//     }

//     try {
//       // Attempt to get today's Zodiac data
//       // If no data exists, create today's horoscope save to Firebase
//       // Fetch the newly created horoscope
//       let zodiacData = await getZodiacDataForToday(uuid);

//       if (zodiacData == null) {
//         console.log(`No zodiac data found for UUID ${uuid}, generating new horoscope.`);
//         const horoscopeCreated = await createTodaysHoroscopeChatGPT(uuid, user);

//         if (horoscopeCreated) {
//           zodiacData = await getZodiacDataForToday(uuid);
//         }
//       }

//       // If zodiac data is still null, log and continue to next user
//       if (zodiacData == null) {
//         console.error(`Failed to generate zodiac data for UUID ${uuid}, skipping email.`);
//         continue;
//       }

//       // Proceed if zodiac data exists and the nightly chat runs successfully
//       const nightChat = await nightlyChatGPT(uuid, user);

//       if (nightChat === true) {
//         console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
//         console.log('Name: ', name," Email: ", email);
//         sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
//       }
//     } catch (error) {
//       console.error(`An error occurred while processing user ${uuid}:`, error);
//     }
//   }

//   console.log("Zodiaccurate processing complete.");
// }

// async function manuallyRunZodiaccurateForTimezone() {
//   const timezones = ["australia_sydney"];
//   console.log(`Running Zodiaccurate for timezone: ${timezones}`);

//   // Pull UUIDs from exec_time table for the designated timezone string
//   let users = getUUIDDataFromExecTimeTable(timezones);

//   // Check if users is empty
//   if (!users || typeof users !== "object") {
//     console.log("No valid user data found.");
//     return;
//   }

//   // Iterate over the object keys and values
//   for (const [user, uuid] of Object.entries(users)) {
//     let email = user.email;
//     let name = user.name;
//     let userData = null;

//     if (!name || !email) {
//       userData = getUserDataFromUserTableFirebase(uuid);
//       email = userData.email;
//       name = userData.name;
//     }

//     try {
//       // Attempt to get today's Zodiac data
//       // If no data exists, create today's horoscope save to Firebase
//       // Fetch the newly created horoscope
//       let zodiacData = await getZodiacDataForToday(uuid);

//       if (zodiacData == null) {
//         console.log(`No zodiac data found for UUID ${uuid}, generating new horoscope.`);
//         const horoscopeCreated = await createTodaysHoroscopeChatGPT(uuid, user);

//         if (horoscopeCreated) {
//           zodiacData = await getZodiacDataForToday(uuid);
//         }
//       }

//       // If zodiac data is still null, log and continue to next user
//       if (zodiacData == null) {
//         console.error(`Failed to generate zodiac data for UUID ${uuid}, skipping email.`);
//         continue;
//       }

//       // Proceed if zodiac data exists and the nightly chat runs successfully
//       const nightChat = await nightlyChatGPT(uuid, user);

//       if (nightChat === true) {
//         console.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData, null, 2)}`);
//         console.log('Name: ', name," Email: ", email);
//         sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
//       }
//     } catch (error) {
//       console.error(`An error occurred while processing user ${uuid}:`, error);
//     }
//   }

//   console.log("Zodiaccurate processing complete.");
// }