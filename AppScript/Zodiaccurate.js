/**
 * Main function to run the Zodiaccurate process.
 * - Retrieves the current hour.
 * - Fetches UUIDs from the exec_time table for the current hour.
 * - Processes users with valid subscription status
 * - Iterates over eligible users, retrieves their zodiac data, and processes nightly data.
 *
 * @returns {void}
 */
async function runZodiaccurate() {
  const currHour = getCurrentHour();
  console.log(`Running Zodiaccurate for hour: ${currHour}`);
  // Pull UUIDs from exec_time table for 6am
  let users = fetchUUIDsForTimezone(13);
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
    
    // Check if user has an active subscription status
    const validStatuses = ["true", "subscribed", "past_due"];
    if (validStatuses.includes(userData.trial)) {
      Logger.log(`✅ User ${name} (${uuid}) has active status: ${userData.trial}`);
    } else if (userData.trial === "payment_issue") {
      // For payment issues, check if it's within 7 day grace period
      const paymentFailedAt = userData.paymentFailedAt ? new Date(userData.paymentFailedAt) : null;
      if (paymentFailedAt) {
        const gracePeriodDays = 7; // Configure grace period as needed
        const currentDate = new Date();
        const daysSinceFailure = Math.floor((currentDate - paymentFailedAt) / (1000 * 60 * 60 * 24));
        
        if (daysSinceFailure <= gracePeriodDays) {
          Logger.log(`⚠️ User ${name} (${uuid}) has payment issue but is within ${gracePeriodDays}-day grace period`);
        } else {
          Logger.log(`⚠️ Skipping user ${name} (${uuid}) - Payment issue outside grace period`);
          continue; // Skip this user
        }
      } else {
        Logger.log(`⚠️ Skipping user ${name} (${uuid}) - Payment issue with unknown start date`);
        continue; // Skip this user
      }
    } else if (userData.trial === "unpaid") {
      // Allow unpaid users to continue for a certain period
      const gracePeriodDays = 5;
      const statusChangedAt = userData.statusChangedAt ? new Date(userData.statusChangedAt) : null;
      
      if (statusChangedAt) {
        const currentDate = new Date();
        const daysSinceStatusChange = Math.floor((currentDate - statusChangedAt) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStatusChange <= gracePeriodDays) {
          Logger.log(`⚠️ User ${name} (${uuid}) has unpaid status but is within ${gracePeriodDays}-day grace period`);
        } else {
          Logger.log(`⚠️ Skipping user ${name} (${uuid}) - Unpaid status outside grace period`);
          continue; // Skip this user
        }
      } else {
        // If we don't know when they became unpaid, give them benefit of doubt
        Logger.log(`⚠️ User ${name} (${uuid}) has unpaid status with unknown start date, processing anyway`);
      }
    } else if (userData.pendingCancellation === true) {
      // For users who have requested cancellation but it's not yet effective
      // They should continue to receive service until the end of their billing period
      Logger.log(`⚠️ User ${name} (${uuid}) has pending cancellation but is still active`);
    } else {
      Logger.log(`⚠️ Skipping user ${name} (${uuid}) - Status is ${userData.trial || "not set"}`);
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