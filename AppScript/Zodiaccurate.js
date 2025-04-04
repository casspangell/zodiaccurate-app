
/**
 * Main function to run the Zodiaccurate process.
 * - Retrieves the current hour.
 * - Fetches UUIDs from the exec_time table for the current hour.
 * - Iterates over each user, retrieves their zodiac data, and processes nightly data.
 *
 * @returns {void}
 */
/**
 * Main function to run the Zodiaccurate process.
 * - Retrieves the current hour.
 * - Fetches UUIDs from the exec_time table for the current hour.
 * - Only processes users with trial="true" or trial="subscribed"
 * - Iterates over eligible users, retrieves their zodiac data, and processes nightly data.
 *
 * @returns {void}
 */
async function runZodiaccurate() {
  const currHour = getCurrentHour();
  console.log(`Running Zodiaccurate for hour: ${currHour}`);

  // Pull UUIDs from exec_time table for 6am
  let users = fetchUUIDsForTimezone(6);

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

  Logger.log(`Found ${Object.keys(users).length} users in the timezone.`);

  for (const uuid of Object.keys(users)) {
    let user = users[uuid];
    let email = user?.email || null;
    let name = user?.name || null;
    let userData = null;

    Logger.log(`🔍 Checking user: ${uuid}`);

    // Always fetch complete user data from Firebase to check trial status
    try {
      userData = getUserDataFromUserTableFirebase(uuid);
      if (userData) {
        email = userData.email || email;
        name = userData.name || name;
        Logger.log(`✅ Fetched user data from Firebase: ${name}, ${email}`);
      } else {
        Logger.log(`⚠️ User data not found in Firebase for UUID: ${uuid}`);
        continue; // Skip user if essential data is missing
      }
    } catch (error) {
      Logger.log(`❌ Error fetching user data from Firebase for UUID: ${uuid} - ${error.message}`);
      continue;
    }
    
    // Check if user has an active trial or subscription
    if (userData.trial === "true" || userData.trial === "subscribed") {
      Logger.log(`✅ User ${name} (${uuid}) has active status: ${userData.trial}`);
    } else {
      Logger.log(`⚠️ Skipping user ${name} (${uuid}) - Trial status is ${userData.trial || "not set"}`);
      continue; // Skip this user
    }

    Logger.log(`🚀 Processing user: ${name}, Email: ${email}, UUID: ${uuid}`);

    try {
      // Step 1: Fetch Zodiac Data
      let zodiacData = await getZodiacDataForToday(uuid);

      // Step 2: If no data exists, generate today's horoscope
      if (!zodiacData) {
        Logger.log(`📝 No zodiac data found for UUID ${uuid}, generating new horoscope.`);
        const horoscopeCreated = await createTodaysHoroscopeChatGPT(uuid, user);

        if (horoscopeCreated) {
          Logger.log(`✅ Horoscope created for UUID ${uuid}, fetching new data.`);
          zodiacData = await getZodiacDataForToday(uuid);
        } else {
          Logger.log(`❌ Failed to generate horoscope for UUID ${uuid}`);
        }
      }

      // Step 3: Run Nightly Chat (Parallel Execution with `Promise.all()`)
      const [nightChat] = await Promise.all([
        nightlyChatGPT(uuid, user)
      ]);

      // Step 4: If all required data exists, send email
      if (zodiacData && nightChat) {
        Logger.log(`📩 Sending daily email for UUID ${uuid}: Name: ${name}, Email: ${email}`);
        sendDailyEmailWithMailerSend(name, email, zodiacData, uuid);
      } else {
        Logger.log(`⚠️ Skipping email for UUID ${uuid} due to missing data`);
      }
    } catch (error) {
      Logger.log(`❌ Error processing user ${uuid}: ${error.message}`);
    }
  }

  Logger.log("✅ Zodiaccurate processing complete.");
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