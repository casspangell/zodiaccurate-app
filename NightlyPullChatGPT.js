async function nightlyChatCPTPrepare() {
    console.log("PREPARE NIGHTLY PREPARE CHATGPT");

    //fetch uuids for the timezone
    const uuids = fetchUUIDsForTimezone();
    console.log("UUIDS ", uuids);

    //for each uuid pull three days prior from the zodiac table getThreeDaysDataFromFirebase(uuid) (ex. today is Monday, it pulls Sunday, Sat, Fri) and formats into a json model
    // run function getChatInstructions(jsonSinglePersonData, uuid) for each day
}

function fetchUUIDsForTimezone() {
  // Get all timezones where it's 6 AM
  const timezones = getTimezonesAtTime(6);
  console.log("Timezones at 6 AM:", JSON.stringify(timezones, null, 2));

  // Fetch user data for these timezones
  const users = getUUIDDataFromExecTimeTable(timezones);
  console.log("User Data:", JSON.stringify(users, null, 2));

  // Process and store user UUIDs if data exists
  if (users && Array.isArray(users)) {
    const jsonData = {};
    users.forEach((user) => {
      if (user.uuid) {
        jsonData[user.uuid] = user;
      }
    });

    console.log("Processed JSON Data:", JSON.stringify(jsonData, null, 2));
    return jsonData;
  } else {
    console.log("No users found for the given timezones.");
    return null;
  }
}
