async function nightlyChatCPTPrepare() {
    console.log("PREPARE NIGHTLY PREPARE CHATGPT");

    //fetch uuids for the timezone
    const uuids = fetchUUIDsForTimezone();
    console.log("UUIDS ", uuids);

    //for each uuid pull three days prior from the zodiac table getThreeDaysDataFromFirebase(uuid) (ex. today is Monday, it pulls Sunday, Sat, Fri) and formats into a json model
    // run function getChatInstructions(jsonSinglePersonData, uuid) for each day
}

function fetchUUIDsForTimezone() {
  // Step 1: Get all timezones where it's 6 AM
  const timezones = getTimezonesAt6AM();
  console.log("Timezones at 6 AM:", JSON.stringify(timezones, null, 2));

  // Step 2: Fetch user data for these timezones
  const users = getUUIDDataFromExecTimeTable(timezones);
  console.log("User Data:", JSON.stringify(users, null, 2));

  // Step 3: Process and store user UUIDs if data exists
  if (users && Array.isArray(users)) {
    const jsonData = {}; // Initialize jsonData object
    users.forEach((user) => {
      if (user.uuid) {
        jsonData[user.uuid] = user; // Map user UUID to user data
      }
    });

    console.log("Processed JSON Data:", JSON.stringify(jsonData, null, 2));
    return jsonData; // Return the processed data if needed
  } else {
    console.log("No users found for the given timezones.");
    return null; // Return null if no users are found
  }
}
