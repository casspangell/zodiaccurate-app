// PUSH to Firebase
function pushEntryToFirebase(jsonData, uuid) {
    Logger.log("PUSHING ENTRY TO FIREBASE...", JSON.stringify(jsonData));
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry successfully saved to Firebase.");
        Logger.log("Response: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}

function saveTimezoneToFirebase(exec_time, uuid, jsonData) {
    Logger.log("SAVING TIMEZONE ENTRY TO FIREBASE...", exec_time);
    const firebaseUrl = `${FIREBASE_URL}/exec_time/${exec_time}/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry saved: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
    }
}

function doesUserExist(uuid) {
    console.log("CHECKING IF USER EXISTS: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return false;
        }
        return true;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return false;
    }
}

// Retrieve single user data from Firebase
function getUserDataFromFirebase(uuid) {
    console.log("GETTING USER DATA FROM FIREBASE: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }
        Logger.log(userData);
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}

// Retrieve UUIDs and their nested data from Firebase for exec_time
function getUUIDDataFromExecTimeTable(time) {
    console.log(`getUUIDDataFromExecTimeTable(${time})`);
    const firebaseUrl = `${FIREBASE_URL}/exec_time/${time}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        },
        muteHttpExceptions: true // Avoid throwing errors for non-200 responses
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const uuidData = JSON.parse(response.getContentText());

        if (!uuidData || typeof uuidData !== 'object') {
            Logger.log(`No valid data found for time: ${time}`);
            return []; // Return an empty array if no valid data exists
        }

        // Map each UUID to its data (email, name, timezone)
        const uuidWithData = Object.keys(uuidData).map((uuid) => ({
            uuid: uuid,
            email: uuidData[uuid].email || "",
            name: uuidData[uuid].name || "",
            timezone: uuidData[uuid].timezone || ""
        }));

        Logger.log(`UUIDs with data for time ${time}: ${JSON.stringify(uuidWithData)}`);
        return uuidWithData;

    } catch (error) {
        Logger.log(`Error retrieving data for EXEC TIME ${time}: ${error.message}`);
        return []; // Return an empty array on error
    }
}

function saveHoroscopeToFirebase(jsonData, uuid) {

    const sanitizedData = sanitizeKeys(jsonData);

    Logger.log("SAVING HOROSCROPE TO FIREBASE: " + JSON.stringify(sanitizedData));

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;

    Logger.log("Saving horoscope for " + dayOfWeek + " to URL: " + firebaseUrl);

    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData[0])
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        Logger.log("Horoscope saved to Firebase: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving horoscope to Firebase: " + e.message);
    }
}

function getZodiacDataForToday(uuid) {
  // Firebase URL to the zodiac table using the provided UUID
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;
  console.log(url);
  try {

    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Get the current day of the week
    const today = getCurrentDayOfWeek();
    
    // Check if today's data exists in the response
    if (data && data[today]) {
      Logger.log(`Data for ${today}: ${JSON.stringify(data[today])}`);
      return data[today];
    } else {
      Logger.log(`No data found for ${today} for UUID: ${uuid}`);
      return null;
    }
  } catch (error) {
    Logger.log(`Error fetching data for UUID ${uuid}: ${error}`);
    return null;
  }
}

// Example usage
function testGetZodiacDataForThursday() {
  const testUUID = "example-uuid"; // Replace with an actual UUID
  const thursdayData = getZodiacDataForThursday(testUUID);
  Logger.log("Thursday Data: " + JSON.stringify(thursdayData));
}
